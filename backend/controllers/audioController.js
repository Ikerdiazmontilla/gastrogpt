// <file path="backend/controllers/audioController.js">
const OpenAI = require('openai');
const config = require('../config/config');
const { toFile } = require('openai/uploads');
const { ElevenLabsClient } = require('elevenlabs'); // Correct import

// Initialize OpenAI client (existing)
const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

// Initialize ElevenLabs client (new)
// The SDK will automatically try to pick up ELEVENLABS_API_KEY from process.env
// if apiKey is not provided or is undefined in the constructor.
// Passing it explicitly from config is also fine and makes dependencies clearer.
const elevenlabs = new ElevenLabsClient({
  apiKey: config.elevenlabsApiKey,
});

/**
 * @file audioController.js
 * @description Controller for handling audio-related API requests,
 *              including OpenAI transcription and ElevenLabs ConvAI signed URLs.
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
    const uploadableAudioFile = await toFile(
      req.file.buffer,
      req.file.originalname,
      { type: req.file.mimetype }
    );

    console.log(`Transcribing audio file: ${req.file.originalname}, size: ${req.file.size} bytes, model: ${config.llm.openai.transcriptionModelName}, type: ${req.file.mimetype}`);

    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: uploadableAudioFile,
      model: config.llm.openai.transcriptionModelName, // Ensure this model is suitable for your needs, e.g., 'whisper-1'
      language: 'es',
      response_format: 'text',
    });

    const transcribedText = typeof transcriptionResponse === 'string' 
                            ? transcriptionResponse 
                            : (transcriptionResponse && typeof transcriptionResponse.text === 'string' ? transcriptionResponse.text : null);


    if (transcribedText === null) { // Check for null or undefined specifically
        console.error('Unexpected transcription response format. Expected text, got:', transcriptionResponse);
        throw new Error('Transcription did not return text.');
    }

    res.json({ transcription: transcribedText.trim() });

  } catch (error) {
    console.error('Error transcribing audio with OpenAI:');
    let errorMessage = 'An unknown error occurred during transcription.';
    // OpenAI SDK errors might be structured differently, often with a `status` and `error.message`
    if (error.status && error.error && error.error.message) {
        console.error('OpenAI API Error:', error.error.message);
        errorMessage = error.error.message;
    } else if (error.message) {
        console.error('Error Message:', error.message);
        errorMessage = error.message;
    } else {
        console.error('Unknown Error Structure:', error);
    }
    res.status(error.status || 500).json({ error: errorMessage });
  }
}

/**
 * Handles GET /api/convai-signed-url
 * Generates a signed URL for the ElevenLabs Conversational AI agent.
 */
async function getConvAISignedUrl(req, res) {
  if (!config.elevenlabsApiKey) {
    console.error('ElevenLabs API key is not configured in config.js.');
    return res.status(500).json({ error: 'Conversational AI service API key is not configured.' });
  }
  if (!config.elevenlabs.agentId) {
    console.error('ElevenLabs Agent ID is not configured in config.js.');
    return res.status(500).json({ error: 'Conversational AI service Agent ID is not configured.' });
  }

  try {
    console.log(`Attempting to generate signed URL for Agent ID: ${config.elevenlabs.agentId}`);
    
    // Using the structure from ElevenLabs' Next.js example which uses a recent SDK version.
    // client.conversationalAi.getSignedUrl({ agent_id: ... })
    const response = await elevenlabs.conversationalAi.getSignedUrl({
      agent_id: config.elevenlabs.agentId, // Parameter name is agent_id
    });

    // The response object directly contains signed_url property
    if (!response || !response.signed_url) { 
      console.error('Failed to get signed_url from ElevenLabs. Full response:', response);
      throw new Error('Failed to retrieve signed_url from ElevenLabs.');
    }
    
    console.log('Successfully retrieved signed URL from ElevenLabs.');
    res.json({ signedUrl: response.signed_url }); // Send back signed_url

  } catch (error) {
    console.error('Error getting signed URL for ConvAI:');
    // Attempt to extract more detailed error message from ElevenLabs SDK error structure
    let detail = 'An unexpected error occurred.';
    if (error.message) {
        detail = error.message;
    }
    // Some SDK errors might have a 'body' with more details
    // Example: error.body.detail.message or error.body.detail[0].msg
    if (error.body && error.body.detail) {
        if (typeof error.body.detail === 'string') {
            detail = error.body.detail;
        } else if (Array.isArray(error.body.detail) && error.body.detail.length > 0 && error.body.detail[0].msg) {
            detail = error.body.detail[0].msg;
        } else if (typeof error.body.detail.message === 'string') {
            detail = error.body.detail.message;
        }
    }
    console.error('Detailed error for ConvAI signed URL:', detail);
    res.status(500).json({ error: `Failed to get signed URL for Conversational AI: ${detail}` });
  }
}

module.exports = {
  handleAudioTranscription,
  getConvAISignedUrl,
};
// </file>