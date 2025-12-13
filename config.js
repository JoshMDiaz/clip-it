// ============================================================================
// AI ENDPOINT CONFIGURATION
// ============================================================================
// Set your AI endpoint URL and API key here.
// This endpoint should accept POST requests with a JSON body containing:
// { "prompt": "...", "apiKey": "..." }
// and return JSON with: { "result": "formatted text" }

module.exports = {
  // Your AI endpoint URL (e.g., "https://api.example.com/v1/format")
  AI_ENDPOINT: process.env.AI_ENDPOINT || 'https://your-ai-endpoint.com/api/format',

  // Your API key for the AI endpoint
  API_KEY: process.env.API_KEY || 'your-api-key-here'
};

