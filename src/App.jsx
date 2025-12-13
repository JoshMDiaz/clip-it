import React, { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import { formatText } from './api';
import { MODES, TONES } from './prompts';

// Helper functions for character/word count
const getWordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;
const getCharCount = (text) => text.length;

function App() {
  const inputRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  // Load settings from localStorage
  const [tone, setTone] = useState(() => {
    const saved = localStorage.getItem('clip-tone');
    return saved || TONES.CASUAL;
  });
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('clip-mode');
    return saved || MODES.SUMMARIZE;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastError, setLastError] = useState(null);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('clip-tone', tone);
  }, [tone]);

  useEffect(() => {
    localStorage.setItem('clip-mode', mode);
  }, [mode]);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleFormat = useCallback(async () => {
    if (!inputText.trim()) {
      showToast('Please enter some text to format');
      return;
    }

    setIsLoading(true);
    setLastError(null);
    try {
      const formatted = await formatText(inputText, mode, tone);
      setOutputText(formatted);

      // Copy to clipboard
      if (window.electronAPI) {
        await window.electronAPI.copyToClipboard(formatted);
        showToast('Formatted text copied to clipboard!');
      } else {
        // Fallback for browser environment
        navigator.clipboard.writeText(formatted).then(() => {
          showToast('Formatted text copied to clipboard!');
        });
      }
    } catch (error) {
      const errorMessage = error.message || 'An unknown error occurred';
      setLastError(errorMessage);
      showToast(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, mode, tone, showToast]);

  const handleClear = useCallback(() => {
    setInputText('');
    setOutputText('');
    setLastError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    showToast('Cleared');
  }, [showToast]);

  const handleRetry = useCallback(() => {
    if (lastError && inputText.trim()) {
      handleFormat();
    }
  }, [lastError, inputText, handleFormat]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const txtFile = files.find(file => file.name.endsWith('.txt'));

    if (txtFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputText(event.target.result);
        showToast('File loaded successfully');
      };
      reader.onerror = () => {
        showToast('Error reading file');
      };
      reader.readAsText(txtFile);
    } else {
      showToast('Please drop a .txt file');
    }
  }, [showToast]);

  const handleKeyDown = useCallback((e) => {
    // Submit on Enter: Cmd+Enter/Ctrl+Enter always submits, or Enter for single-line text
    if (e.key === 'Enter') {
      if (e.metaKey || e.ctrlKey) {
        // Cmd+Enter or Ctrl+Enter always submits (even for multi-line)
        e.preventDefault();
        if (!isLoading && inputText.trim()) {
          handleFormat();
        }
      } else if (!e.shiftKey && !inputText.includes('\n')) {
        // Enter without Shift submits if it's a single line
        e.preventDefault();
        if (!isLoading && inputText.trim()) {
          handleFormat();
        }
      }
      // Otherwise, Enter creates a new line (default behavior)
    }
  }, [inputText, isLoading, handleFormat]);

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Clip It</h1>
          <p className="subtitle">Text Formatter</p>
        </header>

        <div className="controls">
          <div className="control-group">
            <label htmlFor="tone">Tone:</label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="select"
            >
              <option value={TONES.PROFESSIONAL}>Professional</option>
              <option value={TONES.LAID_BACK}>Laid-back</option>
              <option value={TONES.CASUAL}>Casual</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="mode">Mode:</label>
            <select
              id="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="select"
            >
              <option value={MODES.FORMAT}>Format</option>
              <option value={MODES.SUMMARIZE}>Summarize</option>
              <option value={MODES.FORMAT_AS_EMAIL}>Format as Email</option>
              <option value={MODES.FORMAT_AS_SLACK}>Format as Slack Message</option>
            </select>
          </div>
        </div>

        <div
          className={`input-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label htmlFor="input" className="label">
            Input Text {isDragging && <span className="drag-hint">Drop .txt file here</span>}
            <span className="count-badge">
              {getCharCount(inputText)} chars • {getWordCount(inputText)} words
            </span>
          </label>
          <textarea
            ref={inputRef}
            id="input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste or type text here, or drag and drop a .txt file... (Press Enter to format)"
            className="textarea"
            rows={8}
          />
        </div>

        <div className="button-group">
          <button
            onClick={handleFormat}
            disabled={isLoading || !inputText.trim()}
            className="format-button"
          >
            {isLoading ? 'Formatting...' : 'Format'}
          </button>
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="clear-button"
          >
            Clear
          </button>
        </div>

        <div className="output-area">
          <label htmlFor="output" className="label">
            Output
            {outputText && (
              <span className="count-badge">
                {getCharCount(outputText)} chars • {getWordCount(outputText)} words
              </span>
            )}
          </label>
          {lastError && (
            <div className="error-banner">
              <span className="error-message">{lastError}</span>
              <button onClick={handleRetry} className="retry-button">
                Retry
              </button>
            </div>
          )}
          <textarea
            id="output"
            value={outputText}
            readOnly
            placeholder="Formatted text will appear here..."
            className="textarea output"
            rows={8}
          />
        </div>
      </div>

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;

