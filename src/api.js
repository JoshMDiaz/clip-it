// ============================================================================
// AI API INTEGRATION
// ============================================================================
// This file handles communication with the AI endpoint via Electron IPC.
// The actual API calls are made in the main process to avoid CORS issues.
// Configuration is in ipc-handlers.js in the project root.

import { getPrompt } from './prompts';

// Configuration for model selection
const config = {
  MODEL: process.env.REACT_APP_MODEL || 'gpt-4' // Default model, can be overridden
};

/**
 * Formats text using the AI endpoint (via Electron IPC)
 * @param {string} text - The text to format
 * @param {string} mode - The formatting mode
 * @param {string} tone - The desired tone
 * @returns {Promise<string>} The formatted text
 */
export async function formatText(text, mode, tone) {
  const prompt = getPrompt(mode, tone, text);

  // Check if we're in Electron (has electronAPI)
  if (window.electronAPI && window.electronAPI.formatText) {
    try {
      const result = await window.electronAPI.formatText(prompt, config.MODEL);

      if (result.success) {
        return result.result;
      } else {
        throw new Error(result.error || 'AI request failed');
      }
    } catch (error) {
      throw new Error(`AI request failed: ${error.message || error}`);
    }
  } else {
    // Fallback for browser environment (development/testing)
    throw new Error('Electron API not available. This app must run in Electron.');
  }
}

