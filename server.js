const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const { VoiceResponse } = require('twilio').twiml;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const openai = new OpenAI({
  apiKey: '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'
});

const systemPrompt = `
You are Gravette City Chatbot...

[Put your city info here, like permit rules, city hall hours, etc]
`;

app.post('/voice', async (req, res) => {
  const question = req.body.SpeechResult || 'Hello';

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ]
    });

    const reply = completion.choices[0].message.content;

    const twiml = new VoiceResponse();
    twiml.say(reply, { voice: 'Polly.Joanna', language: 'en-US' });

    res.type('text/xml');
    res.send(twiml.toString());

  } catch (err) {
    console.error('Error:', err);
    const twiml = new VoiceResponse();
    twiml.say("I'm sorry, something went wrong.");
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

app.listen(3000, () => {
  console.log('✅ Voice bot is live at http://localhost:3000');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Voice bot is live at http://localhost:${PORT}`);
});
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
  const voiceResponse = new twilio.twiml.VoiceResponse();

  const userSpeech = req.body.SpeechResult || 'Hello, how can I help you?';

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userSpeech }],
    });

    const reply = chat.choices[0].message.content;
    voiceResponse.say(reply);
  } catch (error) {
    console.error('Error generating response:', error);
    voiceResponse.say("I'm sorry, something went wrong while processing your request.");
  }

  res.type('text/xml');
  res.send(voiceResponse.toString());
});

// Port binding for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Voice bot is running on port ${PORT}`);
});
