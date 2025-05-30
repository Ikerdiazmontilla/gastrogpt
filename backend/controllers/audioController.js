// <file path="backend/controllers/audioController.js">
const OpenAI = require('openai');
const config = require('../config/config');
const { toFile } = require('openai/uploads'); // Import the toFile utility

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * @file audioController.js
 * @description Controller for handling audio-related API requests, like transcription.
 */

/**
 * Handles POST /api/transcribe-audio
 * Transcribes an uploaded audio file using OpenAI.
 */
async function handleAudioTranscription(req, res) {
  if (!config.openaiApiKey) {
    console.error('OpenAI API key is not configured.');
    return res.status(500).json({ error: 'Audio transcription service is not configured.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded.' });
  }

  try {
    // Use the toFile utility to create an UploadableFile from the buffer.
    // This ensures the SDK correctly sets the filename and content type in the multipart request.
    const uploadableAudioFile = await toFile(
      req.file.buffer,       // The audio buffer
      req.file.originalname, // The original filename (e.g., 'audio.webm')
      { type: req.file.mimetype } // The MIME type (e.g., 'audio/webm')
    );

    console.log(`Transcribing audio file: ${req.file.originalname}, size: ${req.file.size} bytes, model: ${config.llm.openai.transcriptionModelName}, type: ${req.file.mimetype}`);

    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: uploadableAudioFile, // Pass the UploadableFile object
      model: config.llm.openai.transcriptionModelName,
      language: 'es', // Specify Spanish as the language
      response_format: 'text', // Request plain text response
    });

    // When response_format is 'text', transcriptionResponse is the transcribed string directly.
    // For 'json' or 'verbose_json', it would be an object (e.g., transcriptionResponse.text).
    const transcribedText = typeof transcriptionResponse === 'string' ? transcriptionResponse : transcriptionResponse.text;


    if (typeof transcribedText !== 'string') {
        console.error('Unexpected transcription response format. Expected text, got:', transcriptionResponse);
        throw new Error('Transcription did not return text.');
    }

    res.json({ transcription: transcribedText.trim() });

  } catch (error) {
    console.error('Error transcribing audio with OpenAI:');
    if (error.response && error.response.data) { // Axios-like error structure from OpenAI SDK
        console.error('OpenAI API Error Data:', error.response.data);
        errorMessage = error.response.data.error?.message || 'Failed to transcribe audio due to API error.';
    } else if (error.message) { // Standard error
        console.error('Error Message:', error.message);
        errorMessage = error.message;
    } else {
        console.error('Unknown Error:', error);
        errorMessage = 'An unknown error occurred during transcription.';
    }
    res.status(500).json({ error: errorMessage });
  }
}

module.exports = {
  handleAudioTranscription,
};
// </file>