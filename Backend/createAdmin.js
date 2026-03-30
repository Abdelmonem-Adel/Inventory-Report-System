import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './src/DB/models/user.model.js';

mongoose.connect('mongodb+srv://abdelmonem_db:abdelmonem2005@cluster0.ixmzsgc.mongodb.net/Inventory_Analysis_Project?appName=Cluster0'); // عدل اسم قاعدة البيانات إذا لزم

async function createAdmin() {
  const hashed = await bcrypt.hash('#100200300#', 10); 
  const user = new User({
    name: 'Abdelmonem',
    email: 'abdelmonem@admin.com',
    password: hashed,
    role: 'top_admin'
  });
  await user.save();
  console.log('Top Admin user created!');
  mongoose.disconnect();
}

createAdmin();