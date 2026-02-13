import React, { useState } from 'react';
import { Sparkles, Download, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultImage, setResultImage] = useState(null);

    // Fixed Defaults - Reduced Resolution
    const RESOLUTION = '512x512';
    const N_IMAGES = 1;

    // API Configuration
    const API_PROXY_URL = '/images-api/images/api/v1/images/generations/';
    const API_KEY = 'img-sk-8f3a9b2c4d5e6f7a8b9c0d1e2f3a4b5c';

    const generateImage = async (e) => {
        e?.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setResultImage(null);

        try {
            const body = {
                prompt: prompt.trim(),
                model: 'standard',
                resolution: RESOLUTION,
                nImages: N_IMAGES
            };

            const response = await fetch(API_PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Generation failed');
            }

            if (data.data && data.data.length > 0) {
                const img = data.data[0];
                const url = typeof img === 'string' ? img : (img.url || img.b64_json || img.image_url);

                if (url && url.startsWith('http')) {
                    setResultImage(url);
                } else {
                    throw new Error('No valid image URL returned');
                }
            } else {
                throw new Error('No images returned from API');
            }
        } catch (error) {
            console.error("Generation Error:", error);
            alert(error.message || "An error occurred during generation");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!resultImage) return;
        try {
            const response = await fetch(resultImage);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `lumina-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    return (
        <div className="app-container" style={{ justifyContent: 'center', padding: '1rem' }}>
            <header style={{ marginBottom: '2rem', border: 'none', justifyContent: 'center' }}>
                <div className="logo">
                    <Sparkles size={24} className="text-primary" />
                    <span>AI Generator</span>
                </div>
            </header>

            <main className="main-content" style={{ gap: '2rem' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="generator-card"
                    style={{ padding: '1.5rem', maxWidth: '500px' }}
                >
                    <form onSubmit={generateImage}>
                        <div className="input-row">
                            <div className="input-wrapper">
                                <textarea
                                    className="prompt-input"
                                    placeholder="What should I create?"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={2}
                                    style={{ fontSize: '0.95rem' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="generate-btn"
                            disabled={loading || !prompt.trim()}
                            style={{ marginTop: '1rem', padding: '1rem' }}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    Generate
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                <AnimatePresence>
                    {resultImage && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="result-card"
                            style={{ maxWidth: '400px', margin: '0 auto' }}
                        >
                            <div className="image-display" style={{ borderRadius: '12px' }}>
                                <img src={resultImage} alt="Result" />
                                <div className="image-overlay">
                                    <button className="icon-btn" onClick={handleDownload}>
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default App;
