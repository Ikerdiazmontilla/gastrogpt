// backend/controllers/convaiController.js

const { ElevenLabsClient } = require('elevenlabs');
const crypto = require('crypto');
const express = require('express');
const config = require('../config/config');
const llmService = require('../services/llmService');
const chatRepository = require('../db/chatRepository');
const pool = require('../db/pool');

const elevenlabs = new ElevenLabsClient({
  apiKey: config.elevenlabsApiKey,
});

/**
 * @file convaiController.js
 * @description Controller for handling Conversational AI API requests.
 */

/**
 * Handles POST /api/convai/signed-url
 * Creates a secure, temporary URL for the frontend to connect to the voice chat.
 */
async function handleGetSignedUrl(req, res) {
  if (!config.elevenlabsAgentId) {
    return res.status(500).json({ error: 'Conversational AI agent is not configured.' });
  }

  try {
    // *** FIX IS HERE: Changed `agentId` to `agent_id` ***
    const response = await elevenlabs.conversationalAi.getSignedUrl({
      agent_id: config.elevenlabsAgentId,
    });

    res.json({ signedUrl: response.signed_url });
  } catch (error) {
    console.error('Error getting signed URL for ConvAI:', error);
    res.status(500).json({ error: 'Failed to get signed URL.' });
  }
}

/**
 * Handles POST /api/convai/webhook
 * Receives the final transcript from ElevenLabs, generates an order summary, and updates the conversation.
 */
async function handleWebhook(req, res) {
  // 1. Verify the webhook signature for security
  const signature = req.headers['elevenlabs-signature'];
  const timestamp = req.headers['elevenlabs-signature-timestamp'];
  const body = req.body;

  if (!signature || !timestamp || !body) {
    return res.status(400).json({ error: 'Missing signature headers or body.' });
  }

  const signedContent = `${timestamp}.${body.toString()}`;
  const expectedSignature = crypto
    .createHmac('sha256', config.elevenlabsWebhookSecret)
    .update(signedContent)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.warn('Webhook signature verification failed.');
    return res.status(401).json({ error: 'Invalid signature.' });
  }

  // 2. Process the event
  const event = JSON.parse(body.toString());

  if (event.type === 'post_call_transcription') {
    const { conversation_id, transcript } = event.data;
    console.log(`Webhook received for conversation: ${conversation_id}`);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 3. Generate the order summary using the LLM
      const orderPrompt = `Based on the following conversation transcript, please create a final order summary. List each item clearly. If there are special requests, note them. The summary should be friendly and confirm the order for the customer. Transcript:\n\n${JSON.stringify(transcript, null, 2)}`;
      
      const orderSummaryText = await llmService.getChatbotResponse([
        { role: 'system', content: 'You are an expert at summarizing restaurant orders from conversation transcripts.' },
        { role: 'user', content: orderPrompt }
      ]);

      // 4. Prepare messages to save in the database
      const transcriptMessages = transcript.map(item => ({
        role: item.role,
        content: item.text,
      }));

      const summaryMessage = {
        role: 'assistant',
        content: `### Order Summary\n\n${orderSummaryText}`,
        isOrderSummary: true,
      };

      // 5. Update the conversation in the database
      const conversation = await chatRepository.getConversationById(conversation_id, client);
      if (conversation) {
        const updatedMessages = [...transcriptMessages, summaryMessage];
        await chatRepository.updateConversationMessages(conversation_id, updatedMessages, client);
        console.log(`Successfully updated conversation ${conversation_id} with transcript and order summary.`);
      } else {
        console.warn(`Could not find conversation ${conversation_id} to update with webhook data.`);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing webhook:', error);
    } finally {
      client.release();
    }
  }

  res.status(200).json({ received: true });
}

module.exports = {
  handleGetSignedUrl,
  handleWebhook,
};