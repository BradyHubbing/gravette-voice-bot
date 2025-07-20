const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
app.post('/voice', async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  const speechResult = req.body.SpeechResult;

  if (!speechResult) {
    // No speech input yet — prompt caller and collect their response
    const gather = twiml.gather({
      input: 'speech',
      speechTimeout: 'auto',
      action: '/voice',
      method: 'POST'
    });
    gather.say("Hello, this is the Gravette City Assistant. How can I help you today?");
  } else {
    try {
      const chat = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: speechResult }],
      });

      const reply = chat.choices[0].message.content;
      twiml.say(reply);
    } catch (err) {
      console.error(err);
      twiml.say("Sorry, something went wrong while processing your request.");
    }
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Voice bot is running on port ${PORT}`);
});
