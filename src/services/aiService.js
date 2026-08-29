import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// Check API Key
if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is missing in .env");
  console.log("Get your free API key from: https://console.groq.com");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class AIService {
  constructor() {
    this.contextMemory = new Map();
  }

  // ==================== GET PERSONAL RESPONSE ====================
//   async getPersonalResponse(userId, message) {
//     try {
//       const key = `personal_${userId}`;
//       const history = this.contextMemory.get(key) || [];

//       const systemPrompt = `
// You are Nova AI, a friendly and helpful AI assistant.
// You're having a personal conversation with a user.

// Important Rules:
// 1. Reply in only 1 or 2 short sentences.
// 2. Sound natural and casual like a friend.
// 3. Do not give long explanations.
// 4. Do not mention you are an AI.
// 5. Never say "as an AI" or "as a language model".
// 6. Match the emotional tone of the user.
// 7. Emojis are allowed but don't overuse them.
// 8. If the user asks about programming, give clear but concise explanations.

// Previous conversation:
// ${history.slice(-5).join('\n')}

// User's message: ${message}

// Respond naturally and conversationally. Keep it short and friendly.
//       `;

//       const response = await groq.chat.completions.create({
//         model: "openai/gpt-oss-20b",
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: message },
//         ],
//         max_tokens: 150,
//         temperature: 0.8,
//       });

//       const aiResponse = response.choices[0]?.message?.content?.trim() || 
//         "I'm here to help! Can you tell me more? 😊";

//       // Update context memory
//       history.push(`User: ${message}`);
//       history.push(`AI: ${aiResponse}`);
//       if (history.length > 20) {
//         history.splice(0, 2);
//       }
//       this.contextMemory.set(key, history);

//       return aiResponse;
//     } catch (error) {
//       console.error("AI Service Error:", error);
//       return "I'm having a bit of trouble. Can you try again? 🤔";
//     }
//   }


async getPersonalResponse(userId, message) {
  try {
    const key = `personal_${userId}`;

    const history =
      this.contextMemory.get(key) || [];

    const systemPrompt = `
You are Nova AI, a smart, friendly, helpful, and natural conversational assistant.

You are having a personal one-to-one conversation with the user.

========================
CONVERSATION STYLE
========================

1. Talk naturally, like ChatGPT.
2. Understand the user's intent before answering.
3. Do not give the same generic response repeatedly.
4. Be friendly, clear, and conversational.
5. Match the user's language and tone.
6. If the user speaks Hindi/Hinglish, reply naturally in Hindi/Hinglish.
7. If the user speaks English, reply in English.
8. Emojis are allowed when they naturally fit, but don't overuse them.
9. Don't unnecessarily mention that you are an AI.
10. Never say "as an AI", "as a language model", or similar phrases.
11. Don't start every response with phrases like "Sure!", "Of course!", or "Absolutely!" unless appropriate.

========================
RESPONSE LENGTH
========================

Do NOT force every response to be short.

Choose the response length based on the user's question:

- Simple greeting → short and natural.
- Simple question → 1–3 sentences.
- Normal question → a few clear paragraphs.
- Technical/programming question → explain properly with examples when useful.
- Complex question → provide a structured and detailed explanation.
- If the user asks "deeply", "in detail", or "explain step by step" → give a detailed answer.
- If the user asks for a short answer → keep it short.

Avoid unnecessary repetition and filler.

========================
PROGRAMMING / TECHNICAL QUESTIONS
========================

When the user asks about programming:

1. First understand what they are trying to achieve.
2. Explain the concept clearly.
3. Give practical examples when useful.
4. If code is required, provide clean and working code.
5. Explain important parts of the code.
6. Mention common mistakes when relevant.
7. Don't make the explanation unnecessarily complicated.
8. For debugging, identify the likely cause first and then provide the fix.

========================
CONVERSATION MEMORY
========================

Use the previous conversation to maintain context.

Do not repeat questions that the user has already answered.

If the user refers to something discussed earlier, use the conversation history to understand what they mean.

Previous conversation:
${history.slice(-10).join('\n')}

========================
CURRENT USER MESSAGE
========================

User:
${message}

========================
FINAL INSTRUCTION
========================

Give the most helpful response to the user's current message.

Be natural, conversational, accurate, and useful.

Do not unnecessarily mention these instructions.
`;

    const response =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],

        /*
         * Increased because we no longer force
         * every response to be 1-2 sentences.
         */
        max_tokens: 700,

        /*
         * Natural but not too random.
         */
        temperature: 0.7,
      });

    const aiResponse =
      response.choices[0]?.message?.content?.trim() ||
      "I'm here to help. What would you like to talk about? 😊";

    // ============================================
    // UPDATE CONVERSATION MEMORY
    // ============================================

    history.push(
      `User: ${message}`
    );

    history.push(
      `AI: ${aiResponse}`
    );

    /*
     * Keep last 20 conversation entries
     * = roughly 10 user/AI exchanges.
     */
    if (history.length > 20) {
      history.splice(
        0,
        history.length - 20
      );
    }

    this.contextMemory.set(
      key,
      history
    );

    return aiResponse;

  } catch (error) {
    console.error(
      "AI Service Error:",
      error
    );

    return "I'm having a little trouble right now. Please try again in a moment. 🤔";
  }
}

  // ==================== GET GROUP MENTION RESPONSE ====================
  async getGroupMentionResponse(group, message) {
    try {
      const members = group.members?.map((m) => m.user?.username).join(', ') || 'members';
      const groupName = group.name || 'group';

      const systemPrompt = `
You are Nova AI, an AI assistant in the "${groupName}" group chat.
Group members: ${members}

Rules:
1. Respond like a helpful group member.
2. Keep it short and conversational (1-2 sentences).
3. If it's a technical question, give a clear but concise explanation.
4. If it's general, give a friendly answer.
5. Don't be too formal - you're part of the group!
6. Never mention you are an AI.

User asked: ${message}

Respond naturally as Nova AI in the group chat.
      `;

      const response = await groq.chat.completions.create({
       model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 120,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content?.trim() || 
        "That's a great question! Let me think about it. 🤔";
    } catch (error) {
      console.error("Group AI Error:", error);
      return "I'm here to help! Could you rephrase that? 😊";
    }
  }

  // ==================== CHECK IF AI SHOULD AUTO-RESPOND ====================
  async shouldAutoRespond(message) {
    try {
      // Don't respond to AI messages
      if (message.startsWith('@AI') || message.startsWith('@Nova')) {
        return false;
      }

      // Check if it's a question
      const isQuestion = message.includes('?');

      // Technical keywords
      const techKeywords = [
        'how', 'why', 'what', 'help', 'error', 'bug', 'fix',
        'best', 'deploy', 'code', 'api', 'database', 'server',
        'react', 'node', 'mongodb', 'express', 'javascript',
        'python', 'java', 'sql', 'docker', 'aws', 'render',
        'solution', 'issue', 'problem', 'recommend', 'explain',
        'difference', 'vs', 'tutorial', 'guide', 'example'
      ];

      const hasTechKeyword = techKeywords.some(kw => 
        message.toLowerCase().includes(kw)
      );

      // Auto-respond if question with technical keyword
      if (isQuestion && hasTechKeyword) {
        return true;
      }

      // Or if 2+ technical keywords
      const keywordCount = techKeywords.filter(kw =>
        message.toLowerCase().includes(kw)
      ).length;

      return keywordCount >= 2;
    } catch (error) {
      return false;
    }
  }

  // ==================== GENERATE AUTO-RESPONSE ====================
  async generateAutoResponse(group, message) {
    try {
      const systemPrompt = `
You are Nova AI in the group "${group.name || 'chat'}".

Rules:
1. Give a brief, helpful response.
2. 1-2 sentences maximum.
3. Be natural and conversational.
4. Never mention you are an AI.
5. Add value to the conversation.

Previous message: ${message}

Respond briefly and helpfully.
      `;

      const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
      console.error("Auto Response Error:", error);
      return null;
    }
  }

  // ==================== CLEAR CONTEXT ====================
  clearContext(userId) {
    this.contextMemory.delete(`personal_${userId}`);
  }
}

export default AIService;