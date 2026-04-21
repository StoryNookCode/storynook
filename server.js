const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// Health check - confirms your server is running
app.get('/health', (req, res) => {
  res.json({ status: 'StoryNook server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`StoryNook server running on port ${PORT}`);
});