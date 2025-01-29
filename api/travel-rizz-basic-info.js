require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { language, city, startDate, endDate } = req.body;

        console.log("Received basic info request for:", { language, city, startDate, endDate });

        try {
            const gptResponse = await openai.chat.completions.create({
                model: 'gpt-4o-2024-08-06',
                messages: [
                    {"role": "system", "content": "You are a knowledgeable travel assistant focused on providing basic information about cities for travel purposes."},
                    {"role": "user", "content": 
                    `In the language of ${language}, provide an introduction of ${city}, information about the season, climate and weather during the period from ${startDate} to ${endDate}, the languages spoken, and the population.
                    
                    Response Intros:
                    Each aspect will take one section/paragraph, and made up by 2 to 4 sentences.
                    Provide all these information in about 200 words in one page/div, the word count suitable for one single A4 page.
                    
                    Response Format:
                    The entire output, including the content and the headings should be in the language of ${language}.
                    Since the response here will be redirected to be shown on a webpage, certain sections of the content will be formatted with some HTML tags.
                    Do not use the tags like '''html, </,  '\n' + or ''' in the generated content.
                    Use <div class="page-break"><header><img id='logo' src='resources/TH-logo.png' alt='logo'/><h2 id='brand'>Travel-Rizz</h2><h2 id='header-slogan'>Travel-Rizz:Your Personalized Journey Awaits</h2></header> and </div> EVERY TIME you start and end a whole page/section/div.
                    For the content, start with a welcome phrase in the language, like <h1>Welcome to ${city}!</h1> or <h1>欢迎来到 ${city}!</h1>, then <h2></h2> for the following headings/aspects accordingly.
                    Use <p></p> for paragraphs. 
                    For weather related websites for the city during the period, use the format similar to <a href="https://www.accuweather.com/en/my/muar/228032/weather-forecast/228032?city=muar" target="_blank">Muar November 2024 Weather</a>.
                    
                    Response Tone:
                    Remember not to provide the response in a dialogue or conversation form, instead reply in an informative and concise way.
                    As for the tone and mood of your response, be passionate and friendly.
                    `}
                ],
                max_tokens: 1000
            });

            if (gptResponse && gptResponse.choices && gptResponse.choices.length > 0) {
                const basicInfoContent = gptResponse.choices[0].message.content;
                console.log("Basic Info Content:", basicInfoContent);
                res.send({ response: basicInfoContent });
            } else {
                console.error("Unexpected OpenAI API response structure for basic info:");
                res.status(500).send("The response from the API does not have the expected content for basic info.");
            }
        } catch (error) {
            console.error("Error in fetching basic info:", error);
            res.status(500).send("Error processing your basic info request");
        }
    } else {
        res.status(405).send('Method Not Allowed for basic info');
    }
};

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Basic Info Service running on port ${PORT}`));
