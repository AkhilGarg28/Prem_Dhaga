import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from '../models/User';

dotenv.config();

const email = process.argv[2] || 'admin@premdhaga.com';
const role = process.argv[3] || 'super_admin';
const rawPassword = process.argv[4] || 'admin123';

async function makeAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prem_dhaga';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB: ${mongoUri}`);

    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    let user = await User.findOne({ email });
    if (!user) {
      console.log(`User ${email} not found. Creating new admin account...`);
      user = new User({
        name: 'Admin User',
        email,
        password: hashedPassword,
        role: role as any,
        isVIP: true,
      });
    } else {
      user.password = hashedPassword;
      user.role = role as any;
      console.log(`Updating existing user ${email} password and role to: ${role}`);
    }

    await user.save();
    console.log(`✅ Success! User ${email} is now assigned role: [${user.role}]`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    process.exit(1);
  }
}

makeAdmin();
