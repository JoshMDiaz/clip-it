const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { clipboard } = require('electron');

// Set app name (appears in menu bar and dock)
app.setName('Clip It');

// Load OpenAI for AI formatting
let OpenAI;
let openai;
try {
  OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.API_KEY || '282ec0b3-23dd-4a2a-8163-27164410a17b',
    baseURL: process.env.BASE_URL || 'https://brain-platform.pattern.com/api/v1/openai_compatible',
  });
} catch (error) {
  // OpenAI will be initialized lazily if needed
}

// Function to register IPC handlers
function registerIpcHandlers() {
  if (!ipcMain) {
    return;
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
  ipcMain.handle('format-text', async (event, { prompt, model }) => {
    try {
      if (!openai) {
        // Lazy initialization if it failed before
        if (!OpenAI) OpenAI = require('openai');
        openai = new OpenAI({
          apiKey: process.env.API_KEY || '282ec0b3-23dd-4a2a-8163-27164410a17b',
          baseURL: process.env.BASE_URL || 'https://brain-platform.pattern.com/api/v1/openai_compatible',
        });
      }

      const completion = await openai.chat.completions.create({
        model: model || process.env.MODEL || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      });

      let formattedText = completion.choices[0]?.message?.content;

      if (!formattedText) {
        return { success: false, error: 'No response received from AI endpoint' };
      }

      // Clean up: Remove any "Text: " prefix that might have been included
      formattedText = formattedText.replace(/^Text:\s*/i, '').trim();

      return { success: true, result: formattedText };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to connect to AI endpoint'
      };
    }
  });
}

// Register handlers immediately
registerIpcHandlers();

let mainWindow;

async function createWindow() {
  const windowOptions = {
    width: 600,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#ffffff',
    show: false,
    title: 'Clip It'
  };

  // macOS-specific title bar styling
  if (process.platform === 'darwin') {
    windowOptions.titleBarStyle = 'hiddenInset';
  }

  // Set icon if it exists (for development)
  try {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    await fs.access(iconPath);
    windowOptions.icon = iconPath;
  } catch {
    // Icon file doesn't exist, use default
  }

  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.setTitle('Clip It');

  // Load the React app
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:1234');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Register global shortcut
  // Default: Cmd+Shift+H (macOS) or Ctrl+Shift+H (Windows/Linux)
  // Can be overridden via SHORTCUT environment variable (e.g., "CommandOrControl+Shift+T")
  const defaultShortcut = process.platform === 'darwin'
    ? 'CommandOrControl+Shift+H'
    : 'Control+Shift+H';
  const shortcut = process.env.SHORTCUT || defaultShortcut;

  const registered = globalShortcut.register(shortcut, () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  if (!registered) {
    console.error(`Failed to register global shortcut: ${shortcut}`);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

