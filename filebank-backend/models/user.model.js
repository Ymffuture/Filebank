import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  displayName: String,
  email: String
}, { timestamps: true });

export default mongoose.model('User', userSchema);
