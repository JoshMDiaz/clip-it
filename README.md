# Clip It - Desktop Text Formatter

A minimal Electron desktop app for formatting text using AI. Perfect for quickly reformatting, summarizing, or converting text to emails with different tones.

## Features

- 🎨 Clean, modern UI with drag-and-drop support
- ⌨️ Global keyboard shortcut (Cmd+Shift+H on macOS, Ctrl+Shift+H on Windows/Linux) - configurable
- 📝 Multiple formatting modes: Format, Summarize, Format as Email, Format as Slack Message
- 🎭 Tone options: Professional, Laid-back, or Casual
- 📋 Automatic clipboard copy with toast notifications
- 📁 Drag-and-drop .txt file loading

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

## Configuration

### Setting Your AI API Key and Base URL

The app uses the OpenAI SDK to connect to an OpenAI-compatible API endpoint. Configuration is already set up with default values, but you can customize them:

#### Option 1: Environment Variables (Recommended)

Create a `.env` file in the project root:

```bash
REACT_APP_API_KEY=your-api-key-here
REACT_APP_BASE_URL=https://brain-platform.pattern.com/api/v1/openai_compatible
REACT_APP_MODEL=gpt-4
```

#### Option 2: Edit Source Code

Edit `src/api.js` and update the `config` object:

```javascript
const config = {
  API_KEY: 'your-api-key-here',
  BASE_URL: 'https://brain-platform.pattern.com/api/v1/openai_compatible',
  MODEL: 'gpt-4' // Optional: specify the model to use
};
```

### AI Endpoint Requirements

The app uses an OpenAI-compatible API endpoint that supports:
- Chat completions API (`/chat/completions`)
- Standard OpenAI SDK format with messages array
- Default model: `gpt-4` (configurable via `REACT_APP_MODEL`)

## Running the App

### Development Mode

Start the React development server and Electron:

```bash
pnpm run dev
```

This will:
1. Start the React dev server on http://localhost:1234
2. Launch Electron when the server is ready

### Production Mode

Build the React app and run Electron:

```bash
pnpm run build
pnpm start
```

## Usage

1. **Open the app**: Use the global shortcut `Cmd+Shift+F` (macOS) or `Ctrl+Shift+F` (Windows/Linux), or launch it normally
2. **Enter text**: Type or paste text into the input area, or drag-and-drop a .txt file
3. **Select options**: Choose your desired tone (Professional/Laid-back) and mode (Format/Summarize/Format as Email)
4. **Format**: Click the "Format" button
5. **Copy**: The formatted text is automatically copied to your clipboard and displayed in the output area

## Customizing Prompts

To add new formatting modes or modify prompts:

1. Edit `src/prompts.js`:
   - Add new modes to the `MODES` object
   - Add new tones to the `TONES` object
   - Modify the `getPrompt()` function to handle new modes

2. Update the UI dropdown in `src/App.jsx`:
   - Add new options to the mode/tone select elements

Example: Adding a "Format as List" mode

```javascript
// In src/prompts.js
export const MODES = {
  FORMAT: 'Format',
  SUMMARIZE: 'Summarize',
  FORMAT_AS_EMAIL: 'Format as Email',
  FORMAT_AS_LIST: 'Format as List'  // Add new mode
};

// In getPrompt() function
case MODES.FORMAT_AS_LIST:
  return `Convert the following text into a bulleted list with a ${toneDescription} tone:\n\n${userText}`;
```

Then add the option to the dropdown in `App.jsx`:

```jsx
<option value={MODES.FORMAT_AS_LIST}>Format as List</option>
```

## Project Structure

```
clip/
├── main.js              # Electron main process
├── preload.js           # Preload script for secure IPC
├── ipc-handlers.js      # IPC handlers for file operations
├── config.js            # Server-side config (for reference)
├── prompts.js           # Prompt templates (server-side, for reference)
├── package.json
├── README.md
├── public/
│   └── index.html
└── src/
    ├── index.js         # React entry point
    ├── index.css         # Global styles
    ├── App.jsx           # Main React component
    ├── App.css           # Component styles
    ├── api.js            # AI API integration
    └── prompts.js        # Prompt templates (used by React)
```

## Keyboard Shortcuts

- **Default**: `Cmd+Shift+H` (macOS) / `Ctrl+Shift+H` (Windows/Linux): Toggle app visibility

### Changing the Keyboard Shortcut

You can customize the global keyboard shortcut by setting the `SHORTCUT` environment variable:

```bash
# Example: Change to Cmd+Shift+T
SHORTCUT=CommandOrControl+Shift+T pnpm start

# Or set it in your .env file
SHORTCUT=CommandOrControl+Shift+T
```

**Shortcut format**: Use Electron's accelerator format:
- `CommandOrControl` = Cmd on macOS, Ctrl on Windows/Linux
- `Shift`, `Alt`, `Option` for modifiers
- Single letter or key name (e.g., `C`, `T`, `F1`, `Space`)

**Examples**:
- `CommandOrControl+Shift+H` (default)
- `CommandOrControl+Option+T`
- `CommandOrControl+Shift+T`

## Building for Distribution

To create distributable packages:

```bash
pnpm run build:electron
```

This will create platform-specific installers in the `dist/` directory.

## Troubleshooting

### App won't start
- Make sure all dependencies are installed: `pnpm install`
- Check that Node.js version is 16+ and pnpm is installed

### AI endpoint not working
- Verify your endpoint URL and API key in `.env` or `src/api.js`
- Check browser console (DevTools) for error messages
- Ensure your endpoint accepts CORS requests from Electron

### Global shortcut not working
- On macOS, you may need to grant accessibility permissions
- Try restarting the app after granting permissions

## License

MIT

