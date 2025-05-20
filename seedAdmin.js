const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed

const MONGO_URI = 'mongodb+srv://augustinous10:BXJEhJz73YpbKBOZ@cluster0.0vct39i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const createAdminUser = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ phone: '0781345944' });
    if (existingAdmin) {
      console.log('Admin already exists');
      return process.exit(0);
    }

    // Create admin user with plain password
    const admin = new User({
      name: 'Augustine NSHIMIYIMANA',
      phone: '0781345944',
      password: '0781345944', // This will be hashed by the pre('save') hook
      role: 'ADMIN'
    });

    await admin.save();
    console.log('✅ Admin created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
};

createAdminUser();
