import cloudinary from '../config/cloudinary.js';
import File from '../models/file.model.js';
import { nanoid } from 'nanoid';


export const uploadFiles = async (req, res) => {
  try {
    const uploads = await Promise.all(req.files.map(async (file) => {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
          resource_type: 'auto'
        }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
        stream.end(file.buffer);
      });

      const slug = nanoid(8);
      const newFile = await File.create({
        filename: result.original_filename,
        url: result.secure_url,
        cloudinaryId: result.public_id,
        slug,
        userId: req.user.id
      });
      return newFile;
    }));

    res.json(uploads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ slug: req.params.slug, userId: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    await cloudinary.uploader.destroy(file.cloudinaryId);
    await file.deleteOne();

    res.json({ message: 'File deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
