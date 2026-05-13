const express = require('express');
const dotenv = require('dotenv');
const Anthropic = require('@anthropic-ai/sdk');

dotenv.config();

const app = express();
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── STORY TEMPLATE ───────────────────────────────────────────────────────────

function getStoryTemplate(childName, gender, occasion, mumName, interests) {

  // Gender logic
  const pronounHe    = gender === 'girl' ? 'she' : gender === 'neutral' ? 'they' : 'he';
  const pronounHis   = gender === 'girl' ? 'her' : gender === 'neutral' ? 'their' : 'his';
  const pronounHim   = gender === 'girl' ? 'her' : gender === 'neutral' ? 'them' : 'him';
  const childType    = gender === 'girl' ? 'little girl' : gender === 'neutral' ? 'little one' : 'little boy';
  const mummyChild   = gender === 'girl' ? "mummy's little girl" : gender === 'neutral' ? "mummy's little treasure" : "mummy's little boy";
  const coverSubtitle = `A ${childType}'s letters to the magical people in the world.`;

  // Occasion logic
  const occasionLine = occasion === 'birthday' ? 'So Happy Birthday Mummy!' : 'So mummy, Happy Mother\'s Day!';

  // Mum's name (default to 'Mum' if not provided)
  const mum = mumName || 'Mum';

  return {
    coverSubtitle,
    pages: [
      {
        pageNumber: 1,
        recipient: 'Dear Santa,',
        text: `I think my mum has magic powers.
She knows me inside out.
Before I've even asked a question,
Mum knows what it's about.

I think my mum has magic powers.
I'm really still in awe.
For you I have to write a list,
But mum just knows it all.

From your merry little elf,
${childName}`
      },
      {
        pageNumber: 2,
        recipient: 'Dear Tooth Fairy,',
        text: `I think my mum has magic powers.
She helps when I feel sneezy.
A kiss, a hug, a little laugh,
Then I'm fine — easy peasy!

I think my mum has magic powers.
It sounds crazy but it's true.
Although one thing she could work on,
Is slipping me a coin or two.

From your flossing friend,
${childName}`
      },
      {
        pageNumber: 3,
        recipient: 'Dear Easter Bunny,',
        text: `I think my mum has magic powers.
She finds my missing stuff.
My shoes, my hat, my favourite books,
For mum it's easy — for others, tough!

I think my mum has magic powers.
I can't believe my eyes.
At Easter time, when you hide eggs,
It's like she's not surprised!

From your egg-cellent pal,
${childName}`
      },
      {
        pageNumber: 4,
        recipient: 'Dear Fairy Godmother,',
        text: `I think my mum has magic powers.
She makes boring things fun.
It's a Rainy Day? No problems!
Blanket forts, here we come!

I think my mum has magic powers.
It's really cool to see.
You help out kids in fairy tales,
But mum is here with me.

From your spellbound student,
${childName}`
      },
      {
        pageNumber: 5,
        recipient: 'Dear Witches and Wizards of the World,',
        text: `I think my mum has magic powers.
When our fridge is looking bare,
She finds a way to cook a feast,
From practically thin air.

I think my mum has magic powers.
She cooks most every night.
Lasagna, Tacos, even fish.
But ice cream? Not a bite!

From your hocus pocus helper,
${childName}`
      },
      {
        pageNumber: 6,
        recipient: 'Dear Santa,',
        text: `I thought my mum had magic powers.
But something's changed, I think.
I've been watching much more closely,
But there's no spell. No trick.

I thought my mum had magic powers.
But it's just what mums do.
They do it all without much thanks,
But that's so unfair too!

Please turn over →`
      },
      {
        pageNumber: 7,
        recipient: 'And then it hit me, Santa.',
        text: `I know my mum's not magic.
No wands or potions, no.
She has something much more special,
That fills me head to toe.

I know my mum's not magic.
But she has the biggest heart.
It's Ginormous! Humungous! Enormous!
And that's her most amazing part.

From this mighty ${mummyChild},
${childName}`
      },
      {
        pageNumber: 8,
        recipient: `Dear ${mum},`,
        text: `I've been writing lots of letters,
I'd write them late at night.
It's cause I thought you were magic,
It turns out I was right!

You may not have your potions,
Or broomsticks, spells or cauldrons,
But the things you do are magic mum,
You turn dark days bright and golden.

You help teach me tricky words,
And help teach me to be kind.
I've learnt so much from your lessons,
You don't let me fall behind.

So when I become a grown up,
I want to be like you.
Being kind, and calm and patient,
These are things that you just do.

${occasionLine}
Thanks for being who you are.
I'll love you now and for forever,
You're the bestest mum by far.

Love from your favourite little human,
${childName} x`
      }
    ]
  };
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'StoryNook server is running',
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY
  });
});

// Generate personalised story
app.post('/generate-story', async (req, res) => {
  const { childName, childAge, gender, occasion, mumName, interests } = req.body;

  // Basic validation
  if (!childName || !gender || !occasion) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: childName, gender, occasion'
    });
  }

  try {
    // Get the fixed story with personal details swapped in
    const story = getStoryTemplate(childName, gender, occasion, mumName, interests);

    // Use Claude to generate Easter egg illustration prompts
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are helping create a personalised children's book called "I Think My Mum Has Magic Powers".

The child's name is ${childName}, age ${childAge}, and their interests are: ${interests}.

The book has 8 illustrated pages. Each illustration should subtly hide 1 of the child's interests as an Easter egg in the background — something fun for the child to find when reading.

Here are the 8 scenes:
1. Child writing letter to Santa at Christmas, mum nearby
2. Child sick on sofa, mum looking after them
3. Mum pointing at things she found, child amazed
4. Mum and child in a blanket fort on a rainy day
5. Child looking in empty fridge, mum cooking a feast
6. Child spying on mum from the stairs with binoculars
7. Collage of all the magical mum moments from the book
8. Final letter — child drawing a picture for mum

Return ONLY a JSON array with exactly 8 objects. Each object should have:
- pageNumber (1-8)
- easterEgg: what interest to hide and exactly where in the scene

Example format:
[
  { "pageNumber": 1, "easterEgg": "a small football tucked behind the Christmas tree" },
  { "pageNumber": 2, "easterEgg": "a dinosaur toy peeking out from under the blanket" }
]`
        }
      ]
    });

    const rawText = message.content[0].text;
    const cleanText = rawText
  .replace(/```json\n?|\n?```/g, '')
  .replace(/[\u2018\u2019\u201C\u201D]/g, '"')
  .trim();
const easterEggs = JSON.parse(cleanText);

    res.json({
      success: true,
      story: {
        ...story,
        childName,
        childAge,
        gender,
        occasion,
        easterEggs
      }
    });

  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`StoryNook server running on port ${PORT}`);
});