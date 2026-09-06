import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/generate", async (req, res) => {
  try {
    const { topic, region } = req.body;

    if (!topic || !region) {
      return res.status(400).json({
        error: "Сабақ тақырыбы мен өңірді енгізіңіз."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY табылмады. .env файлын тексеріңіз."
      });
    }

    const prompt = `
Сен Қазақстандағы бастауыш сынып мұғаліміне көмектесетін Smart-Region Edu атты білім беру платформасының ЖИ көмекшісісің.

Мұғалімнің сабақ тақырыбы: "${topic}"
Өңірі: "${region}"

Осы тақырыпқа байланысты бастауыш сынып оқушыларына арналған 3 қызықты тапсырма құрастыр.

Әр тапсырмада:
1. Қысқа оқиға немесе контекст болсын.
2. Өңірдің тарихы, географиясы немесе белгілі тұлғалары қолданылсын.
3. Оқушыға нақты сұрақ қойылсын.
4. Дұрыс жауабы көрсетілсін.
5. Тілі өте қарапайым, балаға түсінікті болсын.

Жауапты тек қазақ тілінде бер.
`;

    const response = await client.responses.create({
      model: "gpt-5",
      input: prompt
    });

    res.json({
      success: true,
      result: response.output_text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "ЖИ тапсырма жасағанда қате пайда болды."
    });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, region, person } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Сұрақ енгізіңіз."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY табылмады."
      });
    }

    const prompt = `
Сен Smart-Region Edu платформасындағы "AI-Тарихи Тұлға" балалар чат-ботысың.

Өңір: ${region || "Қазақстан"}
Тарихи тұлға: ${person || "өңірдің белгілі тарихи тұлғасы"}

Бала қойған сұрақ:
${message}

Жауапты қазақ тілінде бер.
Жауап қысқа, жылы және бастауыш сынып оқушысына түсінікті болсын.
Тарихи фактілерді ойдан шығарма.
Егер нақты ақпарат белгісіз болса, оны ашық айт.
`;

    const response = await client.responses.create({
      model: "gpt-5",
      input: prompt
    });

    res.json({
      success: true,
      answer: response.output_text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Чат-бот жауап бере алмады."
    });
  }
});

app.listen(PORT, () => {
  console.log("");
  console.log("======================================");
  console.log("🚀 Smart-Region Edu іске қосылды!");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("======================================");
});