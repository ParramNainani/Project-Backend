const app = require('./src/app');

async function runTests() {
  console.log('--- STARTING TESTS ---');
  // Initialize server to ensure DB connections etc.
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Health check
    console.log('\n[1] pinging /health');
    const healthRes = await fetch(`${baseUrl}/health`);
    console.log('Health:', await healthRes.json());

    // 2. Login as Admin
    console.log('\n[2] Logging in as Admin...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@zorvyn.com', password: 'admin123' })
    });
    
    const loginData = await loginRes.json();
    const { token, user } = loginData.data;
    console.log('Logged in User:', user.name, '| Role:', user.role);

    // 3. Get Dashboard Summary
    console.log('\n[3] Fetching Dashboard Summary...');
    const summaryRes = await fetch(`${baseUrl}/api/summary/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const summaryData = await summaryRes.json();
    
    console.log('Overview:', summaryData.data.overview);
    console.log('Categories count:', summaryData.data.categoryBreakdown.length);
    console.log('Total Users:', summaryData.data.userStats.total);

    // 4. Get Records (Filtering)
    console.log('\n[4] Fetching Income Records...');
    const recordsRes = await fetch(`${baseUrl}/api/records?type=INCOME&limit=2`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const recordsData = await recordsRes.json();
    
    console.log(`Fetched ${recordsData.data.records.length} records. Total via pagination:`, recordsData.data.pagination.total);
    console.log('Sample Record Amount:', recordsData.data.records[0].amount);

// 5. Test Access Control
    console.log('\n[5] Fetching Users API as Viewer (Should Fail)...');
    
    // Login as viewer
    const viewerLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'viewer@zorvyn.com', password: 'viewer123' })
    });
    const viewerToken = (await viewerLoginRes.json()).data.token;
    
    const accessRes = await fetch(`${baseUrl}/api/users`, {
      headers: { 'Authorization': `Bearer ${viewerToken}` }
    });
    console.log('Viewer accessing Users array -> Status:', accessRes.status, 'Message:', (await accessRes.json()).message);

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
