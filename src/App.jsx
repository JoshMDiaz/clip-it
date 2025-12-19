import React, { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import { formatText } from './api';
import { MODES, TONES } from './prompts';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy } from 'lucide-react';

// Helper functions for character/word count
const getWordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;
const getCharCount = (text) => text.length;

function App() {
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const containerRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  // Load settings from localStorage
  const [tone, setTone] = useState(() => {
    const saved = localStorage.getItem('clip-tone');
    return saved || TONES.CASUAL;
  });
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('clip-mode');
    return saved || MODES.FORMAT;
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

      // Scroll to output area after a brief delay to ensure DOM update
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
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
    // Scroll to top
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    showToast('Cleared');
  }, [showToast]);

  const handleCopyOutput = useCallback(async () => {
    if (!outputText.trim()) {
      showToast('No output to copy');
      return;
    }

    try {
      if (window.electronAPI) {
        await window.electronAPI.copyToClipboard(outputText);
        showToast('Copied to clipboard!');
      } else {
        await navigator.clipboard.writeText(outputText);
        showToast('Copied to clipboard!');
      }
    } catch (error) {
      showToast('Failed to copy to clipboard');
    }
  }, [outputText, showToast]);

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
      <div className="container max-w-full" ref={containerRef}>
        <header className="header">
          <div className="header-left">
            <h1>Clip It</h1>
            <p className="subtitle">Text Formatter</p>
          </div>
          <div className="controls">
            <div className="control-group">
              <label htmlFor="tone">Tone:</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TONES.PROFESSIONAL}>Professional</SelectItem>
                  <SelectItem value={TONES.LAID_BACK}>Laid-back</SelectItem>
                  <SelectItem value={TONES.CASUAL}>Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="control-group">
              <label htmlFor="mode">Mode:</label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger id="mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MODES.FORMAT}>Format</SelectItem>
                  <SelectItem value={MODES.FORMAT_AS_EMAIL}>Format as Email</SelectItem>
                  <SelectItem value={MODES.FORMAT_AS_SLACK}>Format as Slack Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Input/Output Container - Single column on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Input and Buttons Group */}
          <div className="flex flex-col flex-1 gap-4">
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
              <Textarea
                ref={inputRef}
                id="input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste or type text here, or drag and drop a .txt file... (Press Enter to format)"
                rows={8}
              />
            </div>

            <div className="button-group">
              <Button
                onClick={handleFormat}
                disabled={isLoading || !inputText.trim()}
                size="lg"
              >
                {isLoading ? 'Formatting...' : 'Format'}
              </Button>
              <Button
                onClick={handleClear}
                disabled={isLoading}
                variant="outline"
                size="lg"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Output Group */}
          <div className="output-area flex-1" ref={outputRef}>
            <div className="label flex items-center justify-between">
              <label htmlFor="output">Output</label>
              <div className="flex items-center gap-2">
                {outputText && (
                  <span className="count-badge">
                    {getCharCount(outputText)} chars • {getWordCount(outputText)} words
                  </span>
                )}
                {outputText && (
                  <Button
                    onClick={handleCopyOutput}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Copy output"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {lastError && (
              <div className="error-banner">
                <span className="error-message">{lastError}</span>
                <Button onClick={handleRetry} variant="destructive" size="sm">
                  Retry
                </Button>
              </div>
            )}
            <Textarea
              id="output"
              value={outputText}
              readOnly
              placeholder="Formatted text will appear here..."
              className="bg-muted"
              rows={8}
            />
          </div>
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

