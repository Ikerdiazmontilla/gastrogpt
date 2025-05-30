// <file path="backend/routes/audioRoutes.js">
const express = require('express');
const multer = require('multer');
const audioController = require('../controllers/audioController');

/**
 * @file audioRoutes.js
 * @description Defines routes related to audio processing, like transcription.
 */

const router = express.Router();

// Configure multer for file uploads
// Using memoryStorage to keep the uploaded file in memory as a buffer
// Adjust limits as necessary. OpenAI has a 25MB limit for transcription.
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
  fileFilter: (req, file, cb) => {
    // Basic filter for common audio types. OpenAI supports mp3, mp4, mpeg, mpga, m4a, wav, webm.
    if (file.mimetype.startsWith('audio/') || ['application/octet-stream', 'video/webm'].includes(file.mimetype)) { // video/webm is often used for audio-only webm
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
  }
});

// POST /api/transcribe-audio - Transcribe an uploaded audio file
router.post('/transcribe-audio', upload.single('audio'), audioController.handleAudioTranscription);
// 'audio' in upload.single('audio') must match the FormData key from the frontend

module.exports = router;
// </file>