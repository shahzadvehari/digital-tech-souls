const plans = [
  { name: 'Shared Starter', price: 4.99, storage: '50 GB NVMe SSD', bandwidth: 'Unmetered', emails: 10, databases: 5, freeSsl: true, backup: 'Free Weekly', isFeatured: false },
  { name: 'Premium WordPress', price: 9.99, storage: '100 GB NVMe SSD', bandwidth: 'Unmetered', emails: 50, databases: 20, freeSsl: true, backup: 'Daily + On-Demand', isFeatured: true },
  { name: 'Business Cloud', price: 19.99, storage: '250 GB NVMe SSD', bandwidth: 'Unmetered', emails: 999, databases: 999, freeSsl: true, backup: 'Hourly', isFeatured: false }
];

async function seed() {
  for (const plan of plans) {
    const res = await fetch('http://localhost:3001/plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-role': 'ADMIN_USER'
      },
      body: JSON.stringify(plan)
    });
    if (res.ok) {
      console.log('Seeded:', plan.name);
    } else {
      console.error('Failed:', plan.name);
    }
  }
}

seed();
