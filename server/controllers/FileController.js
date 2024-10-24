import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: 'your-cloud-name',
  api_key: 'your-api-key',
  api_secret: 'your-api-secret',
})

export const fileDownload = async(req, res)=> {
  const {publicId} = req.query;
  try {
    const signedUrl = cloudinary.url(publicId, {
      resource_type: 'raw', // For raw files like PDFs
      type: 'authenticated', // Use 'authenticated' for private files
      expires_at: Math.floor(Date.now() / 1000) + 3600, // URL valid for 1 hour
    });

    res.json({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }};