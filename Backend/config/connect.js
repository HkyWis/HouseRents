const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = require('../models/UserSchema'); 

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    
    console.log('Connected to MongoDB');
    
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL
    const adminExists = await userSchema.findOne({ email: String(ADMIN_EMAIL) });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(String(ADMIN_PASSWORD), salt);

      const admin = new userSchema({
        name: "Admin",
        email: String(ADMIN_EMAIL),
        password: hashedPassword,
        type: "Admin",
      });

      await admin.save();
      console.log("Admin created");
    } else {
      console.log("Admin already exists");
    }

  } catch (err) {
    console.log(`Could not connect to MongoDB: ${err}`);
  }
};

module.exports = connectDB;