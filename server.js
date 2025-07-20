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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Voice bot is running on port ${PORT}`);
});
