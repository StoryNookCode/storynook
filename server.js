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

  const pronounHe    = gender === 'girl' ? 'she' : gender === 'neutral' ? 'they' : 'he';
  const pronounHis   = gender === 'girl' ? 'her' : gender === 'neutral' ? 'their' : 'his';
  const pronounHim   = gender === 'girl' ? 'her' : gender === 'neutral' ? 'them' : 'him';
  const childType    = gender === 'girl' ? 'little girl' : gender === 'neutral' ? 'little one' : 'little boy';
  const mummyChild   = gender === 'girl' ? "mummy's little girl" : gender === 'neutral' ? "mummy's little treasure" : "mummy's little boy";
  const coverSubtitle = `A ${childType}'s letters to the magical people in the world.`;

  const occasionLine = occasion === 'birthday' ? 'So Happy Birthday Mummy!' : "So mummy, Happy Mother's Day!";

  const mum = mumName || 'Mum';

  return {
    coverSubtitle,
    pages: [
      {
        pageNumber: 1,
        recipient: 'Dear Santa,',
        text: `I think my mum has magic powers.\nShe knows me inside out.\nBefore I've even asked a question,\nMum knows what it's about.\n\nI think my mum has magic powers.\nI'm really still in awe.\nFor you I have to write a list,\nBut mum just knows it all.\n\nFrom your merry little elf,\n${childName}`
      },
      {
        pageNumber: 2,
        recipient: 'Dear Tooth Fairy,',
        text: `I think my mum has magic powers.\nShe helps when I feel sneezy.\nA kiss, a hug, a little laugh,\nThen I'm fine — easy peasy!\n\nI think my mum has magic powers.\nIt sounds crazy but it's true.\nAlthough one thing she could work on,\nIs slipping me a coin or two.\n\nFrom your flossing friend,\n${childName}`
      },
      {
        pageNumber: 3,
        recipient: 'Dear Easter Bunny,',
        text: `I think my mum has magic powers.\nShe finds my missing stuff.\nMy shoes, my hat, my favourite books,\nFor mum it's easy — for others, tough!\n\nI think my mum has magic powers.\nI can't believe my eyes.\nAt Easter time, when you hide eggs,\nIt's like she's not surprised!\n\nFrom your egg-cellent pal,\n${childName}`
      },
      {
        pageNumber: 4,
        recipient: 'Dear Fairy Godmother,',
        text: `I think my mum has magic powers.\nShe makes boring things fun.\nIt's a Rainy Day? No problems!\nBlanket forts, here we come!\n\nI think my mum has magic powers.\nIt's really cool to see.\nYou help out kids in fairy tales,\nBut mum is here with me.\n\nFrom your spellbound student,\n${childName}`
      },
      {
        pageNumber: 5,
        recipient: 'Dear Witches and Wizards of the World,',
        text: `I think my mum has magic powers.\nWhen our fridge is looking bare,\nShe finds a way to cook a feast,\nFrom practically thin air.\n\nI think my mum has magic powers.\nShe cooks most every night.\nLasagna, Tacos, even fish.\nBut ice cream? Not a bite!\n\nFrom your hocus pocus helper,\n${childName}`
      },
      {
        pageNumber: 6,
        recipient: 'Dear Santa,',
        text: `I thought my mum had magic powers.\nBut something's changed, I think.\nI've been watching much more closely,\nBut there's no spell. No trick.\n\nI thought my mum had magic powers.\nBut it's just what mums do.\nThey do it all without much thanks,\nBut that's so unfair too!\n\nPlease turn over →`
      },
      {
        pageNumber: 7,
        recipient: 'And then it hit me, Santa.',
        text: `I know my mum's not magic.\nNo wands or potions, no.\nShe has something much more special,\nThat fills me head to toe.\n\nI know my mum's not magic.\nBut she has the biggest heart.\nIt's Ginormous! Humungous! Enormous!\nAnd that's her most amazing part.\n\nFrom this mighty ${mummyChild},\n${childName}`
      },
      {
        pageNumber: 8,
        recipient: `Dear ${mum},`,
        text: `I've been writing lots of letters,\nI'd write them late at night.\nIt's cause I thought you were magic,\nIt turns out I was right!\n\nYou may not have your potions,\nOr broomsticks, spells or cauldrons,\nBut the things you do are magic mum,\nYou turn dark days bright and golden.\n\nYou help teach me tricky words,\nAnd help teach me to be kind.\nI've learnt so much from your lessons,\nYou don't let me fall behind.\n\nSo when I become a grown up,\nI want to be like you.\nBeing kind, and calm and patient,\nThese are things that you just do.\n\n${occasionLine}\nThanks for being who you are.\nI'll love you now and for forever,\nYou're the bestest mum by far.\n\nLove from your favourite little human,\n${childName} x`
      }
    ]
  };
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'StoryNook server is running',
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY
  });
});

app.post('/generate-story', async (req, res) => {
  const { childName, childAge, gender, occasion, mumName, interests } = req.body;

  if (!childName || !gender || !occasion) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: childName, gender, occasion'
    });
  }

  try {
    const story = getStoryTemplate(childName, gender, occasion, mumName, interests);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are helping create a personalised children's book called "I Think My Mum Has Magic Powers".

The child's name is ${childName}, age ${childAge}, and their interests are: ${interests}.

The book has 8 illustrated pages. Each illustration should subtly hide 1 of the child's interests as an Easter egg in the background.

Here are the 8 scenes:
1. Child writing letter to Santa at Christmas, mum nearby
2. Child sick on sofa, mum looking after them
3. Mum pointing at things she found, child amazed
4. Mum and child in a blanket fort on a rainy day
5. Child looking in empty fridge, mum cooking a feast
6. Child spying on mum from the stairs with binoculars
7. Collage of all the magical mum moments from the book
8. Final letter - child drawing a picture for mum

You MUST return ONLY a valid JSON array. No explanation, no markdown, no code blocks. Just the raw JSON array starting with [ and ending with ].

The array must have exactly 8 objects, each with pageNumber and easterEgg keys. Keep easterEgg descriptions short and simple, under 15 words each. No apostrophes or special characters in the text.

Example of exact format required:
[{"pageNumber":1,"easterEgg":"a small dinosaur sitting on the windowsill"},{"pageNumber":2,"easterEgg":"a football under the sofa"}]`
        }
      ]
    });

    let easterEggs = [];
    try {
      const rawText = message.content[0].text.trim();
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        easterEggs = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Easter egg parse error:', parseError);
      // Fall back to simple defaults if parsing fails
      easterEggs = [
        { pageNumber: 1, easterEgg: `a small ${interests.split(',')[0].trim()} toy near the tree` },
        { pageNumber: 2, easterEgg: `a ${interests.split(',')[0].trim()} book on the shelf` },
        { pageNumber: 3, easterEgg: `a ${interests.split(',')[0].trim()} picture on the wall` },
        { pageNumber: 4, easterEgg: `a ${interests.split(',')[0].trim()} toy in the corner` },
        { pageNumber: 5, easterEgg: `a ${interests.split(',')[0].trim()} magnet on the fridge` },
        { pageNumber: 6, easterEgg: `a ${interests.split(',')[0].trim()} poster on the wall` },
        { pageNumber: 7, easterEgg: `a ${interests.split(',')[0].trim()} toy in the background` },
        { pageNumber: 8, easterEgg: `a ${interests.split(',')[0].trim()} drawing on the paper` }
      ];
    }

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