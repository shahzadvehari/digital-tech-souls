const fetch = require('node-fetch');

async function test() {
  // Login
  const loginRes = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@digitaltechsouls.com', password: 'admin' })
  });
  
  if (!loginRes.ok) {
    console.log("Login failed");
    return;
  }
  
  const loginData = await loginRes.json();
  const token = loginData.access_token;
  
  // Create product
  const createRes = await fetch('http://localhost:3001/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Test Product',
      price: 9.99,
      billing: 'Monthly',
      description: 'Test',
      features: 'test',
      imageUrl: '',
      isFeatured: false
    })
  });
  
  if (!createRes.ok) {
    console.log("Create failed:", createRes.status, await createRes.text());
    return;
  }
  
  console.log("Create success:", await createRes.json());
}

test();
