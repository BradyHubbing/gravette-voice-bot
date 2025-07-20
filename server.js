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
  messages: [
    {
      role: 'system',
      content: `You are a formal, helpful digital assistant for the City of Gravette, Arkansas. Always answer questions based on the city’s real services and information.

Facts to use:
- Chickens are allowed in city limits with restrictions. Roosters are prohibited. No more than six hens per household unless zoned agricultural.
- Permits, licenses, and zoning forms are online: https://www.gravettear.com/forms
- Events are posted at https://www.gravettear.com/calendar
- Trash & sanitation pickup can be scheduled or reported by calling (479) 787-5757
- Utilities (water/sewer bills) can be paid at https://www.gravettear.com/pay
- City Hall is open Monday through Friday, 8 AM to 4:30 PM. Phone: (479) 787-5757
- Ordinances are searchable at: https://library.municode.com/ar/gravette/codes/code_of_ordinances

Always speak confidently and clearly about Gravette’s services. If unsure, encourage the user to contact city hall directly.`
    },
    {
      role: 'user',
      content: speechResult
    }
  ]
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
