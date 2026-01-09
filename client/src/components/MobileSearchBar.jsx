import { useState, useEffect, useRef, useCallback } from 'react';
import { SearchBar } from 'antd-mobile';
import styles from './MobileSearchBar.module.css';

/**
 * MobileSearchBar - Enhanced search bar with voice input support
 * Uses antd-mobile SearchBar with Web Speech API for voice input
 */
function MobileSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  showVoice = true,
  disabled = false
}) {
  const [localValue, setLocalValue] = useState(value || '');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const debounceRef = useRef(null);
  const recognitionRef = useRef(null);

  // Check for Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (value !== undefined && value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Debounced onChange handler
  const handleChange = useCallback((val) => {
    setLocalValue(val);

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounced call
    debounceRef.current = setTimeout(() => {
      if (onChange) {
        onChange(val);
      }
    }, debounceMs);
  }, [onChange, debounceMs]);

  // Handle search submit
  const handleSearch = useCallback((val) => {
    // Clear debounce and call immediately
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (onChange) {
      onChange(val);
    }
    if (onSearch) {
      onSearch(val);
    }
  }, [onChange, onSearch]);

  // Handle clear
  const handleClear = useCallback(() => {
    setLocalValue('');
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (onChange) {
      onChange('');
    }
  }, [onChange]);

  // Start voice recognition
  const startVoiceInput = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      setLocalValue(transcript);

      // If final result, trigger search
      if (event.results[0].isFinal) {
        handleChange(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      // Haptic feedback for error
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      // Haptic feedback for end
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  }, [handleChange]);

  // Stop voice recognition
  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Toggle voice input
  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  }, [isListening, startVoiceInput, stopVoiceInput]);

  return (
    <div className={styles.searchBarWrapper}>
      <SearchBar
        value={localValue}
        onChange={handleChange}
        onSearch={handleSearch}
        onClear={handleClear}
        placeholder={placeholder}
        showCancelButton={false}
        className={`${styles.searchBar} ${isListening ? styles.listening : ''}`}
        disabled={disabled}
      />

      {showVoice && speechSupported && (
        <button
          type="button"
          className={`${styles.voiceButton} ${isListening ? styles.voiceActive : ''}`}
          onClick={toggleVoice}
          disabled={disabled}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        >
          {isListening ? (
            <span className={styles.voiceIcon}>
              <span className={styles.pulseRing}></span>
              🎤
            </span>
          ) : (
            <span className={styles.voiceIcon}>🎙️</span>
          )}
        </button>
      )}

      {isListening && (
        <div className={styles.listeningIndicator}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.listeningText}>Listening...</span>
        </div>
      )}
    </div>
  );
}

export default MobileSearchBar;
