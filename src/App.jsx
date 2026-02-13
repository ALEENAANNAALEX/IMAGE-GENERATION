import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Download, History, Settings, Image as ImageIcon, Loader2, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_IMAGE_API_KEY || '');
  const [apiEndpoint, setApiEndpoint] = useState(import.meta.env.VITE_IMAGE_API_ENDPOINT || '/api-proxy/v1/imagine');

  useEffect(() => {
    const savedHistory = localStorage.getItem('image_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const generateImage = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResultImage(null);

    // Check if we have an API key to use a professional provider
    if (apiKey && apiKey.startsWith('img-sk')) {
      try {
        const response = await axios.post(apiEndpoint, {
          name: `gen_${Date.now()}`,
          prompt: prompt,
          width: 1024,
          height: 1024,
          model: 'sdxl'
        }, {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15s timeout
        });

        if (response.data && (response.data.url || response.data.image_url)) {
          const imageUrl = response.data.url || response.data.image_url;
          setResultImage(imageUrl);
          addToHistory(imageUrl, prompt);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Professional API Error:", error.message);
        // Continue to fallback
      }
    }

    // Fallback to pollinations.ai
    // We update the state to the URL directly. Browsers handle the 403 checks better than fetch sometimes
    // or Pollinations might block manual fetch requests. Setting it as src is safer.
    const newSeed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${newSeed}&width=1024&height=1024&nologo=true`;

    // Instead of fetching, we'll just set the image URL and wait for the <img> tag to load
    setResultImage(imageUrl);
    addToHistory(imageUrl, prompt);
    setLoading(false);
  };

  const addToHistory = (url, promptText) => {
    const newHistoryItem = {
      id: Date.now(),
      prompt: promptText,
      url: url,
      timestamp: new Date().toLocaleString()
    };
    const updatedHistory = [newHistoryItem, ...history.slice(0, 19)];
    setHistory(updatedHistory);
    localStorage.setItem('image_history', JSON.stringify(updatedHistory));
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <Sparkles size={28} className="text-primary" />
          <span>LuminaGen</span>
        </div>
        <div className="header-actions">
          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="generator-card"
        >
          <form onSubmit={generateImage}>
            <div className="input-wrapper">
              <input
                type="text"
                className="prompt-input"
                placeholder="Describe the image you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="generate-btn"
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="loader-icon animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  Generate Image
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <AnimatePresence>
          {(loading || resultImage) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="result-container"
            >
              <div className="image-display">
                {loading ? (
                  <div className="loader"></div>
                ) : (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={resultImage}
                    alt={prompt}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                      setLoading(false);
                      console.error("Image failed to load");
                    }}
                  />
                )}
              </div>

              {!loading && resultImage && (
                <div className="action-row">
                  <button className="settings-btn" onClick={handleDownload}>
                    <Download size={18} />
                    Download
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {history.length > 0 && (
          <div className="history-section" style={{ width: '100%', marginTop: '4rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={24} />
              Recent Generations
            </h2>
            <div className="history-grid">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  className="history-item"
                  onClick={() => {
                    setResultImage(item.url);
                    setPrompt(item.prompt);
                  }}
                >
                  <img src={item.url} alt={item.prompt} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showSettings && (
          <div className="modal-overlay" onClick={() => setShowSettings(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal"
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Settings</h2>
                <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowSettings(false)} />
              </div>
              <div className="form-group">
                <label>API Key</label>
                <input
                  type="password"
                  className="prompt-input"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="img-sk-..."
                />
              </div>
              <div className="form-group">
                <label>API Endpoint</label>
                <input
                  type="text"
                  className="prompt-input"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                More providers and custom API keys will be supported in future versions.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer style={{ marginTop: 'auto', padding: '2rem 0', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
        <p>© 2026 LuminaGen AI. Powering creativity.</p>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        .loader-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .action-row {
          display: flex;
          gap: 1rem;
        }
      `}} />
    </div>
  );
}

export default App;
