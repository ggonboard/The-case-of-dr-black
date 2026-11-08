import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // API endpoint for suspect portrait generation using character traits
  app.post('/api/generate-portrait', async (req, res) => {
    try {
      const { name, gender, age, hair, clothing, accessory, traits } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server.',
          hint: 'Please configure GEMINI_API_KEY in the environment secrets.',
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const traitsText = Array.isArray(traits) ? traits.join(', ') : '';

      // Detailed prompt synthesizing all character traits into 1930s vintage film noir aesthetic
      const prompt = `Authentic 1930s vintage film noir crime investigation suspect mugshot portrait of ${name || 'the suspect'}.
Subject Details:
- Gender: ${gender || 'Unknown'}
- Apparent Age: ${age || 'Adult'}
- Hair style and color: ${hair || 'Dark'} hair styled in genuine 1930s period fashion
- Attire: wearing distinct ${clothing || 'vintage attire'}
- Distinctive item or accessory: ${accessory || 'None'}
- Notable traits: ${traitsText}

Visual Aesthetic:
- Genuine 1930s detective mystery archive photograph, high contrast chiaroscuro lighting, deep dramatic shadows, smoky atmosphere.
- Warm sepia monochrome tones, authentic photographic grain, vintage gelatin silver print, weathered paper borders with subtle vignette.
- Close-up head and shoulders character portrait, tense, guarded, authentic period drama suspect expression.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '1:1',
          },
        },
      });

      let imageData: string | null = null;
      let mimeType = 'image/png';

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          imageData = part.inlineData.data;
          if (part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          break;
        }
      }

      if (imageData) {
        return res.json({
          success: true,
          imageUrl: `data:${mimeType};base64,${imageData}`,
          name,
        });
      } else {
        return res.status(502).json({
          error: 'The image generation model did not return image data.',
        });
      }
    } catch (err: any) {
      console.error('Error generating suspect portrait:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate suspect portrait',
      });
    }
  });

  // Shared Case Storage: ensures everyone entering the same code accesses the exact same case
  const casesStore = new Map<string, any>();

  app.get('/api/cases/:code', (req, res) => {
    const code = req.params.code.trim().toUpperCase().replace(/^CASE-/, '');
    const caseData = casesStore.get(code);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found', code });
    }
    return res.json({ success: true, code, caseData });
  });

  app.post('/api/cases', (req, res) => {
    const { code, caseData } = req.body;
    if (!code || !caseData) {
      return res.status(400).json({ error: 'Code and caseData are required' });
    }
    const normalizedCode = String(code).trim().toUpperCase().replace(/^CASE-/, '');
    casesStore.set(normalizedCode, {
      ...caseData,
      updatedAt: Date.now(),
    });
    return res.json({ success: true, code: normalizedCode });
  });

  app.post('/api/cases/:code/unlock', (req, res) => {
    const code = req.params.code.trim().toUpperCase().replace(/^CASE-/, '');
    const caseData = casesStore.get(code);
    if (caseData) {
      caseData.roomUnlocked = true;
      caseData.unlockedAt = Date.now();
      casesStore.set(code, caseData);
      return res.json({ success: true, code, roomUnlocked: true });
    }
    return res.json({ success: true, code, roomUnlocked: true, note: 'Case will store unlocked flag upon sync' });
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      activeCasesCount: casesStore.size,
    });
  });

  // Dev mode: Mount Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static assets
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
