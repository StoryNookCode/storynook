const express = require('express');
const dotenv = require('dotenv');
const Anthropic = require('@anthropic-ai/sdk');

dotenv.config();

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'StoryNook server is running' });
});

// Story generation
app.post('/generate-story', async (req, res) => {
  const { childName, childAge, interests } = req.body;

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are a children's book author. Write a 5 page story for a child named ${childName} who is ${childAge} years old and loves ${interests}.

Each page should have exactly 2-3 sentences, warm and engaging for a ${childAge} year old.

Return ONLY a JSON object in this exact format, nothing else:
{
  "title": "story title here",
  "pages": [
    { "pageNumber": 1, "text": "page 1 text here" },
    { "pageNumber": 2, "text": "page 2 text here" },
    { "pageNumber": 3, "text": "page 3 text here" },
    { "pageNumber": 4, "text": "page 4 text here" },
    { "pageNumber": 5, "text": "page 5 text here" }
  ]
}`
        }
      ]
    });

    const storyText = message.content[0].text;
    const cleanText = storyText.replace(/```json\n?|\n?```/g, '').trim();
    const story = JSON.parse(cleanText);

    res.json({ success: true, story });

  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`StoryNook server running on port ${PORT}`);
});