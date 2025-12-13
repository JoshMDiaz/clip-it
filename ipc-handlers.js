const { ipcMain } = require('electron');
const fs = require('fs').promises;
const { clipboard } = require('electron');

// Configuration - can be overridden by environment variables
const config = {
  API_KEY: process.env.API_KEY || '282ec0b3-23dd-4a2a-8163-27164410a17b',
  BASE_URL: process.env.BASE_URL || 'https://brain-platform.pattern.com/api/v1/openai_compatible',
  MODEL: process.env.MODEL || 'gpt-4'
};

// Initialize OpenAI client in main process (no CORS issues)
let openai;
try {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: config.API_KEY,
    baseURL: config.BASE_URL,
  });
} catch (error) {
  console.error('Failed to initialize OpenAI:', error);
}

// Verify ipcMain is available
if (!ipcMain) {
  console.error('ERROR: ipcMain is not available!');
} else {
  console.log('ipcMain is available, registering handlers...');
}

// Handle file reading
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle clipboard copy
ipcMain.handle('copy-to-clipboard', async (event, text) => {
  try {
    clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle AI text formatting
console.log('Registering format-text handler');
ipcMain.handle('format-text', async (event, { prompt, model }) => {
  console.log('format-text handler called with prompt length:', prompt?.length);
  try {
    if (!openai) {
      // Lazy initialization if it failed before
      const OpenAI = require('openai');
      openai = new OpenAI({
        apiKey: config.API_KEY,
        baseURL: config.BASE_URL,
      });
    }

    const completion = await openai.chat.completions.create({
      model: model || config.MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const formattedText = completion.choices[0]?.message?.content;

    if (!formattedText) {
      return { success: false, error: 'No response received from AI endpoint' };
    }

    return { success: true, result: formattedText };
  } catch (error) {
    console.error('Format text error:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to AI endpoint'
    };
  }
});

