require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { fetch } = require('undici');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/image', async (req, res) => {
  const { style, companion, dream, location } = req.body;

  // Gelişmiş, sahne betimlemeli prompt
  let prompt = '';

  if (dream && dream.trim().length > 10) {
    prompt += `Scene: ${dream.trim()}. `;
  } else {
    prompt += `A ${style} vacation with ${companion}. `;
  }

  if (location) {
    prompt += `Setting: ${location}, a picturesque and emotionally rich location. `;
  }

  // ✨ Fotoğraf ve sinematik detaylar (ToryBarber + Pitch referanslarıyla)
  prompt += `
  This image should be a high-end DSLR photograph, shot on a Leica or Canon 5D, 
  with a 50mm lens at f1.8 aperture. Use soft golden hour natural lighting, 
  warm tones, and shallow depth of field to focus on the subject. 
  Composition should follow the rule of thirds. Add subtle film grain, 
  slight motion blur in background, and analog color tones to evoke realism. 
  Cinematic, emotionally evocative, ultra photorealistic.`;

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "dall-e-3",
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
