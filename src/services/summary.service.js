const prisma = require('../config/prisma');

/**
 * Generate a comprehensive dashboard summary.
 */
const getDashboardSummary = async () => {
  const baseWhere = { isDeleted: false };

  // ── Totals ──
  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.record.aggregate({
      where: { ...baseWhere, type: 'INCOME' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.record.aggregate({
      where: { ...baseWhere, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const totalIncome = incomeAgg._sum.amount || 0;
  const totalExpenses = expenseAgg._sum.amount || 0;
  const netBalance = totalIncome - totalExpenses;

  // ── Category-wise breakdown ──
  const categoryBreakdown = await prisma.record.groupBy({
    by: ['type', 'category'],
    where: baseWhere,
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: 'desc' } },
  });

  // ── Last 30 days daily trend ──
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRecords = await prisma.record.findMany({
    where: {
      ...baseWhere,
      date: { gte: thirtyDaysAgo },
    },
    select: { type: true, amount: true, date: true },
    orderBy: { date: 'asc' },
  });

  // Group by date string
  const dailyTrend = {};
  for (const record of recentRecords) {
    const dateKey = record.date.toISOString().split('T')[0];
    if (!dailyTrend[dateKey]) {
      dailyTrend[dateKey] = { date: dateKey, income: 0, expense: 0 };
    }
    if (record.type === 'INCOME') {
      dailyTrend[dateKey].income += record.amount;
    } else {
      dailyTrend[dateKey].expense += record.amount;
    }
  }

  // ── Top 5 recent transactions ──
  const recentTransactions = await prisma.record.findMany({
    where: baseWhere,
    include: {
      createdBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // ── User stats ──
  const [totalUsers, activeUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
  ]);

  return {
    overview: {
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netBalance: parseFloat(netBalance.toFixed(2)),
      totalRecords: incomeAgg._count + expenseAgg._count,
    },
    categoryBreakdown: categoryBreakdown.map((c) => ({
      type: c.type,
      category: c.category,
      total: parseFloat((c._sum.amount || 0).toFixed(2)),
      count: c._count,
    })),
    dailyTrend: Object.values(dailyTrend).map((d) => ({
      ...d,
      income: parseFloat(d.income.toFixed(2)),
      expense: parseFloat(d.expense.toFixed(2)),
    })),
    recentTransactions,
    userStats: {
      total: totalUsers,
      active: activeUsers,
    },
  };
};

module.exports = { getDashboardSummary };
