import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/file_upload_db');
    console.log('%cMongoDB connected', "color:green ; font-size:20px;");
  } catch (err) {
    console.error(err);
    // process.exit(1);
  }
};

export default connectDB;
