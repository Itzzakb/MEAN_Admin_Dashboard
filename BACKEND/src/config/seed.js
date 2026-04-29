require('dotenv').config({ path: '../../../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./db');

const seedDB = async () => {
  await connectDB();

  // Dynamically require models
  const User = require('../models/user.model');
  const Product = require('../models/product.model');

  await User.deleteMany({});
  await Product.deleteMany({});

  // Seed Users
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const users = await User.insertMany([
    { name: 'Super Admin', email: 'admin@dashboard.com', password: hashedPassword, role: 'admin', status: 'active' },
    { name: 'Jane Smith', email: 'jane@dashboard.com', password: hashedPassword, role: 'user', status: 'active' },
    { name: 'Bob Johnson', email: 'bob@dashboard.com', password: hashedPassword, role: 'user', status: 'inactive' },
    { name: 'Alice Cooper', email: 'alice@dashboard.com', password: hashedPassword, role: 'user', status: 'active' },
    { name: 'Mike Wilson', email: 'mike@dashboard.com', password: hashedPassword, role: 'admin', status: 'active' },
  ]);

  // Seed Products
  const categories = ['Electronics', 'Clothing', 'Books', 'Food', 'Sports'];
  const products = [];
  for (let i = 1; i <= 30; i++) {
    products.push({
      name: `Product ${i}`,
      description: `Description for product ${i}. High quality item.`,
      price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
      category: categories[Math.floor(Math.random() * categories.length)],
      stock: Math.floor(Math.random() * 200),
      status: Math.random() > 0.2 ? 'active' : 'inactive',
      createdBy: users[0]._id,
    });
  }
  await Product.insertMany(products);

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin Login: admin@dashboard.com / Admin@123');
  process.exit(0);
};

seedDB().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
