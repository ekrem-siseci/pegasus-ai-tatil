require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { fetch } = require('undici');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // index.html bu klasörde olmalı

// OpenAI DALL·E API'den görsel üret
app.post('/api/image', async (req, res) => {
  const { style, companion } = req.body;

  const prompt = `A ${style} vacation with ${companion}. Dreamy summer vibes, blue sky, immersive scene, photorealistic, vibrant colors.`;

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "dall-e-3", // Gerekirse "dall-e-2" ile değiştirilebilir
        prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    const imageUrl = data?.data?.[0]?.url || null;

    if (imageUrl) {
      res.json({ imageUrl });
    } else {
      console.error("❌ Görsel alınamadı:", data);
      res.status(500).json({ error: 'Görsel alınamadı', detail: data });
    }

  } catch (error) {
    console.error('❌ OpenAI API hatası:', error);
    res.status(500).json({ error: 'OpenAI API isteği başarısız oldu' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
