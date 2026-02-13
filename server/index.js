require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Proxy for the image API to bypass CORS
app.post('/images-api/images/api/v1/images/generations/', async (req, res) => {
    try {
        const API_KEY = process.env.VITE_IMAGE_API_KEY || 'img-sk-8f3a9b2c4d5e6f7a8b9c0d1e2f3a4b5c';
        const response = await axios.post(
            'https://alphabotstudio.com/images/api/v1/images/generations/',
            req.body,
            {
                headers: {
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Proxy failed' });
    }
});

// Original API endpoint (optional, but kept for compatibility)
app.post('/api/generate', async (req, res) => {
    const { prompt, resolution, nImages, negative_prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    try {
        const API_KEY = process.env.VITE_IMAGE_API_KEY || 'img-sk-8f3a9b2c4d5e6f7a8b9c0d1e2f3a4b5c';
        const response = await axios.post(
            'https://alphabotstudio.com/images/api/v1/images/generations/',
            {
                prompt,
                model: 'standard',
                resolution: resolution || '1024x1024',
                nImages: parseInt(nImages) || 1,
                negative_prompt: negative_prompt || ''
            },
            {
                headers: {
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        let imageUrls = [];
        if (response.data && response.data.data) {
            imageUrls = response.data.data.map(img => {
                if (typeof img === 'string') return img;
                return img.url || img.b64_json || img.image_url;
            });
        }

        if (imageUrls.length > 0) {
            res.json({ imageUrl: imageUrls[0], images: imageUrls, success: true });
        } else {
            res.status(500).json({ error: 'No image returned from API' });
        }
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('/:path*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
