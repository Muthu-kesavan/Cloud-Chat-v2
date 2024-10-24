// uploadRoute.js

import express from 'express';
import multer from 'multer';
import cloudinary from './cloudinaryConfig.js'; // Import the configured Cloudinary instance

const router = express.Router();

// Multer setup for handling file uploads
const upload = multer({ storage: multer.memoryStorage() }); // We use memory storage since Cloudinary handles file storage

// Route for handling file uploads
router.post('/upload', upload.single('media'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) return res.status(500).send({ error: error.message });
        return res.status(200).send({ message: 'File uploaded successfully', url: result.secure_url });
      }
    );
    req.file.stream.pipe(result); // Use the multer file stream to pipe the file to Cloudinary
  } catch (error) {
    return res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
