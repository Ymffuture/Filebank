import express from 'express';
import { ensureAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadFiles, getFiles, deleteFile } from '../controllers/file.controller.js';

const router = express.Router();

router.post('/upload', ensureAuth, upload.array('file', 5), uploadFiles);
router.get('/', ensureAuth, getFiles);
router.delete('/:slug', ensureAuth, deleteFile);

export default router;
