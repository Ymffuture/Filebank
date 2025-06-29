import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: String,
  url: String,
  slug: String,
  cloudinaryId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('File', fileSchema);
