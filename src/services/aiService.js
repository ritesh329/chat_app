// // import Groq from "groq-sdk";
// // import dotenv from "dotenv";

// // dotenv.config();

// // // Check API Key
// // if (!process.env.GROQ_API_KEY) {
// //   console.error("❌ GROQ_API_KEY is missing in .env");
// //   console.log("Get your free API key from: https://console.groq.com");
// // }

// // const groq = new Groq({
// //   apiKey: process.env.GROQ_API_KEY,
// // });

// // class AIService {
// //   constructor() {
// //     this.contextMemory = new Map();
// //   }

// //   // ==================== GET PERSONAL RESPONSE ====================
// // //   async getPersonalResponse(userId, message) {
// // //     try {
// // //       const key = `personal_${userId}`;
// // //       const history = this.contextMemory.get(key) || [];

// // //       const systemPrompt = `
// // // You are Nova AI, a friendly and helpful AI assistant.
// // // You're having a personal conversation with a user.

// // // Important Rules:
// // // 1. Reply in only 1 or 2 short sentences.
// // // 2. Sound natural and casual like a friend.
// // // 3. Do not give long explanations.
// // // 4. Do not mention you are an AI.
// // // 5. Never say "as an AI" or "as a language model".
// // // 6. Match the emotional tone of the user.
// // // 7. Emojis are allowed but don't overuse them.
// // // 8. If the user asks about programming, give clear but concise explanations.

// // // Previous conversation:
// // // ${history.slice(-5).join('\n')}

// // // User's message: ${message}

// // // Respond naturally and conversationally. Keep it short and friendly.
// // //       `;

// // //       const response = await groq.chat.completions.create({
// // //         model: "openai/gpt-oss-20b",
// // //         messages: [
// // //           { role: "system", content: systemPrompt },
// // //           { role: "user", content: message },
// // //         ],
// // //         max_tokens: 150,
// // //         temperature: 0.8,
// // //       });

// // //       const aiResponse = response.choices[0]?.message?.content?.trim() || 
// // //         "I'm here to help! Can you tell me more? 😊";

// // //       // Update context memory
// // //       history.push(`User: ${message}`);
// // //       history.push(`AI: ${aiResponse}`);
// // //       if (history.length > 20) {
// // //         history.splice(0, 2);
// // //       }
// // //       this.contextMemory.set(key, history);

// // //       return aiResponse;
// // //     } catch (error) {
// // //       console.error("AI Service Error:", error);
// // //       return "I'm having a bit of trouble. Can you try again? 🤔";
// // //     }
// // //   }


// // async getPersonalResponse(userId, message) {
// //   try {
// //     const key = `personal_${userId}`;

// //     const history =
// //       this.contextMemory.get(key) || [];

// //     const systemPrompt = `
// // You are Nova AI, a smart, friendly, helpful, and natural conversational assistant.

// // You are having a personal one-to-one conversation with the user.

// // ========================
// // CONVERSATION STYLE
// // ========================

// // 1. Talk naturally, like ChatGPT.
// // 2. Understand the user's intent before answering.
// // 3. Do not give the same generic response repeatedly.
// // 4. Be friendly, clear, and conversational.
// // 5. Match the user's language and tone.
// // 6. If the user speaks Hindi/Hinglish, reply naturally in Hindi/Hinglish.
// // 7. If the user speaks English, reply in English.
// // 8. Emojis are allowed when they naturally fit, but don't overuse them.
// // 9. Don't unnecessarily mention that you are an AI.
// // 10. Never say "as an AI", "as a language model", or similar phrases.
// // 11. Don't start every response with phrases like "Sure!", "Of course!", or "Absolutely!" unless appropriate.

// // ========================
// // RESPONSE LENGTH
// // ========================

// // Do NOT force every response to be short.

// // Choose the response length based on the user's question:

// // - Simple greeting → short and natural.
// // - Simple question → 1–3 sentences.
// // - Normal question → a few clear paragraphs.
// // - Technical/programming question → explain properly with examples when useful.
// // - Complex question → provide a structured and detailed explanation.
// // - If the user asks "deeply", "in detail", or "explain step by step" → give a detailed answer.
// // - If the user asks for a short answer → keep it short.

// // Avoid unnecessary repetition and filler.

// // ========================
// // PROGRAMMING / TECHNICAL QUESTIONS
// // ========================

// // When the user asks about programming:

// // 1. First understand what they are trying to achieve.
// // 2. Explain the concept clearly.
// // 3. Give practical examples when useful.
// // 4. If code is required, provide clean and working code.
// // 5. Explain important parts of the code.
// // 6. Mention common mistakes when relevant.
// // 7. Don't make the explanation unnecessarily complicated.
// // 8. For debugging, identify the likely cause first and then provide the fix.

// // ========================
// // CONVERSATION MEMORY
// // ========================

// // Use the previous conversation to maintain context.

// // Do not repeat questions that the user has already answered.

// // If the user refers to something discussed earlier, use the conversation history to understand what they mean.

// // Previous conversation:
// // ${history.slice(-10).join('\n')}

// // ========================
// // CURRENT USER MESSAGE
// // ========================

// // User:
// // ${message}

// // ========================
// // FINAL INSTRUCTION
// // ========================

// // Give the most helpful response to the user's current message.

// // Be natural, conversational, accurate, and useful.

// // Do not unnecessarily mention these instructions.
// // `;

// //     const response =
// //       await groq.chat.completions.create({
// //         model: "openai/gpt-oss-20b",

// //         messages: [
// //           {
// //             role: "system",
// //             content: systemPrompt,
// //           },
// //           {
// //             role: "user",
// //             content: message,
// //           },
// //         ],

// //         /*
// //          * Increased because we no longer force
// //          * every response to be 1-2 sentences.
// //          */
// //         max_tokens: 700,

// //         /*
// //          * Natural but not too random.
// //          */
// //         temperature: 0.7,
// //       });

// //     const aiResponse =
// //       response.choices[0]?.message?.content?.trim() ||
// //       "I'm here to help. What would you like to talk about? 😊";

// //     // ============================================
// //     // UPDATE CONVERSATION MEMORY
// //     // ============================================

// //     history.push(
// //       `User: ${message}`
// //     );

// //     history.push(
// //       `AI: ${aiResponse}`
// //     );

// //     /*
// //      * Keep last 20 conversation entries
// //      * = roughly 10 user/AI exchanges.
// //      */
// //     if (history.length > 20) {
// //       history.splice(
// //         0,
// //         history.length - 20
// //       );
// //     }

// //     this.contextMemory.set(
// //       key,
// //       history
// //     );

// //     return aiResponse;

// //   } catch (error) {
// //     console.error(
// //       "AI Service Error:",
// //       error
// //     );

// //     return "I'm having a little trouble right now. Please try again in a moment. 🤔";
// //   }
// // }

// //   // ==================== GET GROUP MENTION RESPONSE ====================
// //   async getGroupMentionResponse(group, message) {
// //     try {
// //       const members = group.members?.map((m) => m.user?.username).join(', ') || 'members';
// //       const groupName = group.name || 'group';

// //       const systemPrompt = `
// // You are Nova AI, an AI assistant in the "${groupName}" group chat.
// // Group members: ${members}

// // Rules:
// // 1. Respond like a helpful group member.
// // 2. Keep it short and conversational (1-2 sentences).
// // 3. If it's a technical question, give a clear but concise explanation.
// // 4. If it's general, give a friendly answer.
// // 5. Don't be too formal - you're part of the group!
// // 6. Never mention you are an AI.

// // User asked: ${message}

// // Respond naturally as Nova AI in the group chat.
// //       `;

// //       const response = await groq.chat.completions.create({
// //        model: "openai/gpt-oss-20b",
// //         messages: [
// //           { role: "system", content: systemPrompt },
// //           { role: "user", content: message },
// //         ],
// //         max_tokens: 120,
// //         temperature: 0.7,
// //       });

// //       return response.choices[0]?.message?.content?.trim() || 
// //         "That's a great question! Let me think about it. 🤔";
// //     } catch (error) {
// //       console.error("Group AI Error:", error);
// //       return "I'm here to help! Could you rephrase that? 😊";
// //     }
// //   }

// //   // ==================== CHECK IF AI SHOULD AUTO-RESPOND ====================
// //   async shouldAutoRespond(message) {
// //     try {
// //       // Don't respond to AI messages
// //       if (message.startsWith('@AI') || message.startsWith('@Nova')) {
// //         return false;
// //       }

// //       // Check if it's a question
// //       const isQuestion = message.includes('?');

// //       // Technical keywords
// //       const techKeywords = [
// //         'how', 'why', 'what', 'help', 'error', 'bug', 'fix',
// //         'best', 'deploy', 'code', 'api', 'database', 'server',
// //         'react', 'node', 'mongodb', 'express', 'javascript',
// //         'python', 'java', 'sql', 'docker', 'aws', 'render',
// //         'solution', 'issue', 'problem', 'recommend', 'explain',
// //         'difference', 'vs', 'tutorial', 'guide', 'example'
// //       ];

// //       const hasTechKeyword = techKeywords.some(kw => 
// //         message.toLowerCase().includes(kw)
// //       );

// //       // Auto-respond if question with technical keyword
// //       if (isQuestion && hasTechKeyword) {
// //         return true;
// //       }

// //       // Or if 2+ technical keywords
// //       const keywordCount = techKeywords.filter(kw =>
// //         message.toLowerCase().includes(kw)
// //       ).length;

// //       return keywordCount >= 2;
// //     } catch (error) {
// //       return false;
// //     }
// //   }

// //   // ==================== GENERATE AUTO-RESPONSE ====================
// //   async generateAutoResponse(group, message) {
// //     try {
// //       const systemPrompt = `
// // You are Nova AI in the group "${group.name || 'chat'}".

// // Rules:
// // 1. Give a brief, helpful response.
// // 2. 1-2 sentences maximum.
// // 3. Be natural and conversational.
// // 4. Never mention you are an AI.
// // 5. Add value to the conversation.

// // Previous message: ${message}

// // Respond briefly and helpfully.
// //       `;

// //       const response = await groq.chat.completions.create({
// //         model: "openai/gpt-oss-20b",
// //         messages: [
// //           { role: "system", content: systemPrompt },
// //           { role: "user", content: message },
// //         ],
// //         max_tokens: 100,
// //         temperature: 0.7,
// //       });

// //       return response.choices[0]?.message?.content?.trim() || null;
// //     } catch (error) {
// //       console.error("Auto Response Error:", error);
// //       return null;
// //     }
// //   }

// //   // ==================== CLEAR CONTEXT ====================
// //   clearContext(userId) {
// //     this.contextMemory.delete(`personal_${userId}`);
// //   }
// // }

// // export default AIService;


// import Groq from "groq-sdk";
// import dotenv from "dotenv";

// dotenv.config();

// // Check API Key
// if (!process.env.GROQ_API_KEY) {
//   console.error("❌ GROQ_API_KEY is missing in .env");
//   console.log("Get your free API key from: https://console.groq.com");
// }

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// class AIService {
//   constructor() {
//     this.contextMemory = new Map();
//   }

//   // ==================== GET PERSONAL RESPONSE ====================
//   async getPersonalResponse(userId, message) {
//     try {
//       const key = `personal_${userId}`;

//       const history =
//         this.contextMemory.get(key) || [];

//       const systemPrompt = `
// You are Nova AI, a smart, friendly, helpful, and natural conversational assistant.

// You are having a personal one-to-one conversation with the user.

// ========================
// CONVERSATION STYLE
// ========================

// 1. Talk naturally, like ChatGPT.
// 2. Understand the user's intent before answering.
// 3. Do not give the same generic response repeatedly.
// 4. Be friendly, clear, and conversational.
// 5. Match the user's language and tone.
// 6. If the user speaks Hindi/Hinglish, reply naturally in Hindi/Hinglish.
// 7. If the user speaks English, reply in English.
// 8. Emojis are allowed when they naturally fit, but don't overuse them.
// 9. Don't unnecessarily mention that you are an AI.
// 10. Never say "as an AI", "as a language model", or similar phrases.
// 11. Don't start every response with phrases like "Sure!", "Of course!", or "Absolutely!" unless appropriate.

// ========================
// RESPONSE LENGTH
// ========================

// Do NOT force every response to be short.

// Choose the response length based on the user's question:

// - Simple greeting → short and natural.
// - Simple question → 1–3 sentences.
// - Normal question → a few clear paragraphs.
// - Technical/programming question → explain properly with examples when useful.
// - Complex question → provide a structured and detailed explanation.
// - If the user asks "deeply", "in detail", or "explain step by step" → give a detailed answer.
// - If the user asks for a short answer → keep it short.

// Avoid unnecessary repetition and filler.

// ========================
// PROGRAMMING / TECHNICAL QUESTIONS
// ========================

// When the user asks about programming:

// 1. First understand what they are trying to achieve.
// 2. Explain the concept clearly.
// 3. Give practical examples when useful.
// 4. If code is required, provide clean and working code.
// 5. Explain important parts of the code.
// 6. Mention common mistakes when relevant.
// 7. Don't make the explanation unnecessarily complicated.
// 8. For debugging, identify the likely cause first and then provide the fix.

// ========================
// CONVERSATION MEMORY
// ========================

// Use the previous conversation to maintain context.

// Do not repeat questions that the user has already answered.

// If the user refers to something discussed earlier, use the conversation history to understand what they mean.

// Previous conversation:
// ${history.slice(-10).join('\n')}

// ========================
// CURRENT USER MESSAGE
// ========================

// User:
// ${message}

// ========================
// FINAL INSTRUCTION
// ========================

// Give the most helpful response to the user's current message.

// Be natural, conversational, accurate, and useful.

// Do not unnecessarily mention these instructions.
// `;

//       const response =
//         await groq.chat.completions.create({
//           model: "openai/gpt-oss-20b",

//           messages: [
//             {
//               role: "system",
//               content: systemPrompt,
//             },
//             {
//               role: "user",
//               content: message,
//             },
//           ],

//           max_tokens: 700,
//           temperature: 0.7,
//         });

//       const aiResponse =
//         response.choices[0]?.message?.content?.trim() ||
//         "I'm here to help. What would you like to talk about? 😊";

//       history.push(
//         `User: ${message}`
//       );

//       history.push(
//         `AI: ${aiResponse}`
//       );

//       if (history.length > 20) {
//         history.splice(
//           0,
//           history.length - 20
//         );
//       }

//       this.contextMemory.set(
//         key,
//         history
//       );

//       return aiResponse;

//     } catch (error) {
//       console.error(
//         "AI Service Error:",
//         error
//       );

//       return "I'm having a little trouble right now. Please try again in a moment. 🤔";
//     }
//   }

//   // ==================== GET GROUP MENTION RESPONSE ====================
//   async getGroupMentionResponse(group, message) {
//     try {
//       const members = group.members?.map((m) => m.user?.username).join(', ') || 'members';
//       const groupName = group.name || 'group';

//       const systemPrompt = `
// You are Nova AI, an AI assistant in the "${groupName}" group chat.
// Group members: ${members}

// Rules:
// 1. Respond like a helpful group member.
// 2. Keep it short and conversational (1-2 sentences).
// 3. If it's a technical question, give a clear but concise explanation.
// 4. If it's general, give a friendly answer.
// 5. Don't be too formal - you're part of the group!
// 6. Never mention you are an AI.

// User asked: ${message}

// Respond naturally as Nova AI in the group chat.
//       `;

//       const response = await groq.chat.completions.create({
//        model: "openai/gpt-oss-20b",
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: message },
//         ],
//         max_tokens: 120,
//         temperature: 0.7,
//       });

//       return response.choices[0]?.message?.content?.trim() || 
//         "That's a great question! Let me think about it. 🤔";
//     } catch (error) {
//       console.error("Group AI Error:", error);
//       return "I'm here to help! Could you rephrase that? 😊";
//     }
//   }

//   // ==================== CHECK IF AI SHOULD AUTO-RESPOND ====================
//   async shouldAutoRespond(message) {
//     try {
//       // Don't respond to AI messages
//       if (message.startsWith('@AI') || message.startsWith('@Nova')) {
//         return false;
//       }

//       // Check if it's a question
//       const isQuestion = message.includes('?');

//       // Technical keywords
//       const techKeywords = [
//         'how', 'why', 'what', 'help', 'error', 'bug', 'fix',
//         'best', 'deploy', 'code', 'api', 'database', 'server',
//         'react', 'node', 'mongodb', 'express', 'javascript',
//         'python', 'java', 'sql', 'docker', 'aws', 'render',
//         'solution', 'issue', 'problem', 'recommend', 'explain',
//         'difference', 'vs', 'tutorial', 'guide', 'example'
//       ];

//       const hasTechKeyword = techKeywords.some(kw => 
//         message.toLowerCase().includes(kw)
//       );

//       // Auto-respond if question with technical keyword
//       if (isQuestion && hasTechKeyword) {
//         return true;
//       }

//       // Or if 2+ technical keywords
//       const keywordCount = techKeywords.filter(kw =>
//         message.toLowerCase().includes(kw)
//       ).length;

//       return keywordCount >= 2;
//     } catch (error) {
//       return false;
//     }
//   }

//   // ==================== GENERATE AUTO-RESPONSE ====================
//   async generateAutoResponse(group, message) {
//     try {
//       const systemPrompt = `
// You are Nova AI in the group "${group.name || 'chat'}".

// Rules:
// 1. Give a brief, helpful response.
// 2. 1-2 sentences maximum.
// 3. Be natural and conversational.
// 4. Never mention you are an AI.
// 5. Add value to the conversation.

// Previous message: ${message}

// Respond briefly and helpfully.
//       `;

//       const response = await groq.chat.completions.create({
//         model: "openai/gpt-oss-20b",
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: message },
//         ],
//         max_tokens: 100,
//         temperature: 0.7,
//       });

//       return response.choices[0]?.message?.content?.trim() || null;
//     } catch (error) {
//       console.error("Auto Response Error:", error);
//       return null;
//     }
//   }

//   // ==================== POLL GENERATOR ====================
//   async generatePoll(text) {
//     try {
//       const systemPrompt = `
// You are a poll-generating assistant for a group chat.
// The user wants to make a group decision. Convert their message into a poll.

// Rules:
// 1. Return ONLY valid JSON, nothing else (no markdown, no explanation).
// 2. Format: {"question": "short question", "options": ["option1", "option2", ...]}
// 3. Options should be 2 to 4 items, short (1-4 words each).
// 4. Keep the question short and clear, in the same language style as the user (Hindi/Hinglish/English).

// User's message: ${text}
//       `;

//       const response = await groq.chat.completions.create({
//         model: "openai/gpt-oss-20b",
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: text },
//         ],
//         // max_tokens: 15,
//         temperature: 0.5,
//       });

//       const raw = response.choices[0]?.message?.content?.trim() || "";
//       const clean = raw.replace(/```json|```/g, "").trim();

//       const parsed = JSON.parse(clean);

//       if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length < 2) {
//         return null;
//       }

//       return {
//         question: parsed.question,
//         options: parsed.options.slice(0, 4),
//       };
//     } catch (error) {
//       console.error("Poll Generation Error:", error);
//       return null;
//     }
//   }

//   // ==================== MOOD-BASED EMOJI SUGGESTION ====================
//   async suggestEmoji(text) {
//     try {
//       if (!text || text.trim().length < 3) return null;

//       const systemPrompt = `
// Based on the mood/context of this message, return ONLY ONE most relevant emoji.
// Reply with just the emoji character, nothing else - no text, no explanation.

// Message: ${text}
//       `;

//       const response = await groq.chat.completions.create({
//         model: "openai/gpt-oss-20b",
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: text },
//         ],
//         max_tokens: 10,
//         temperature: 0.3,
//       });

//       const emoji = response.choices[0]?.message?.content?.trim() || null;

//       if (emoji && emoji.length <= 6) {
//         return emoji;
//       }
//       return null;
//     } catch (error) {
//       console.error("Emoji Suggestion Error:", error);
//       return null;
//     }
//   }

//   // ==================== ROAST / COMPLIMENT BOT ====================
//   async roastOrCompliment(text, mode = "roast") {
//     try {
//       const systemPrompt =
//         mode === "roast"
//           ? `
// You are a fun, friendly group chat bot. Give a LIGHT, playful, friendly roast on this message.
// Rules:
// 1. Maximum 2 short lines.
// 2. Keep it playful and friendly, like a close friend teasing - NEVER genuinely mean, insulting, or offensive.
// 3. No swearing, no personal attacks on appearance/family/sensitive topics.
// 4. Match the language style of the message (Hindi/Hinglish/English).
// 5. Add 1 emoji max.

// Message: ${text}
//         `
//           : `
// You are a fun, friendly group chat bot. Give a warm, genuine compliment about this message.
// Rules:
// 1. Maximum 2 short lines.
// 2. Be genuine and specific to what was said.
// 3. Match the language style of the message (Hindi/Hinglish/English).
// 4. Add 1 emoji max.

// Message: ${text}
//         `;

//       const response = await groq.chat.completions.create({
//         model: "openai/gpt-oss-20b",
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: text },
//         ],
//         max_tokens: 80,
//         temperature: 0.9,
//       });

//       return (
//         response.choices[0]?.message?.content?.trim() ||
//         (mode === "roast" ? "Haha nice try 😄" : "That's great! 👏")
//       );
//     } catch (error) {
//       console.error("Roast/Compliment Error:", error);
//       return null;
//     }
//   }

//   // ==================== ICEBREAKER GENERATOR ====================
//   async generateIcebreaker(groupName) {
//     try {
//       const systemPrompt = `
// Generate ONE fun, interesting icebreaker question for a group chat called "${groupName || 'the group'}".
// Rules:
// 1. Should be fun, light-hearted, and spark conversation.
// 2. One question only, 1 sentence.
// 3. Mix it up - could be "would you rather", hypothetical, opinion-based, or fun fact question.
// 4. Add 1-2 relevant emojis.
// 5. Keep it casual and friendly (Hinglish tone works well).
//       `;

//       const response = await groq.chat.completions.create({
//         model: "openai/gpt-oss-20b",
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: "Generate an icebreaker question" },
//         ],
//         max_tokens: 80,
//         temperature: 1.0,
//       });

//       return (
//         response.choices[0]?.message?.content?.trim() ||
//         "Agar tumhe superpower milta toh kaunsa lete? 🦸"
//       );
//     } catch (error) {
//       console.error("Icebreaker Error:", error);
//       return "Agar tumhe superpower milta toh kaunsa lete? 🦸";
//     }
//   }

//   // ==================== CLEAR CONTEXT ====================
//   clearContext(userId) {
//     this.contextMemory.delete(`personal_${userId}`);
//   }
// }

// export default AIService;


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

          max_tokens: 700,
          temperature: 0.7,
        });

      const aiResponse =
        response.choices[0]?.message?.content?.trim() ||
        "I'm here to help. What would you like to talk about? 😊";

      history.push(
        `User: ${message}`
      );

      history.push(
        `AI: ${aiResponse}`
      );

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

  // ==================== POLL GENERATOR ====================
  async generatePoll(text) {
    try {
      const systemPrompt = `
You are a poll-generating assistant for a group chat.
The user wants to make a group decision. Convert their message into a poll.

Rules:
1. Return ONLY valid, complete, minified JSON. No markdown, no code fences, no explanation, no text before or after.
2. Format exactly: {"question":"short question","options":["option1","option2"]}
3. Options must be 2 to 4 items, VERY short (1-3 words each).
4. Keep the question under 10 words, in the same language style as the user (Hindi/Hinglish/English).
5. Make sure the JSON is fully closed and valid - do not cut off mid-string.

User's message: ${text}
      `;

      const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        max_tokens: 300,
        temperature: 0.4,
      });

      const raw = response.choices[0]?.message?.content?.trim() || "";
      console.log("Poll raw AI response:", raw);

      const parsed = this._extractPollJSON(raw);

      if (!parsed || !parsed.question || !Array.isArray(parsed.options) || parsed.options.length < 2) {
        console.error("Poll Generation: could not extract valid poll JSON from:", raw);
        return null;
      }

      return {
        question: String(parsed.question).slice(0, 150),
        options: parsed.options.slice(0, 4).map((o) => String(o).slice(0, 60)),
      };
    } catch (error) {
      console.error("Poll Generation Error:", error);
      return null;
    }
  }

  // ==================== HELPER: SAFELY EXTRACT POLL JSON ====================
  _extractPollJSON(raw) {
    if (!raw) return null;

    // Strip markdown code fences if present
    let clean = raw.replace(/```json|```/gi, "").trim();

    // Try direct parse first
    try {
      return JSON.parse(clean);
    } catch (_) {
      // fall through to recovery attempts
    }

    // Extract the { ... } block only, in case AI added extra text
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (_) {
        // Try to repair a truncated JSON (missing closing quote/brackets)
        let repaired = match[0];

        // If it ends mid-string (odd number of unescaped quotes), close the string
        const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length;
        if (quoteCount % 2 !== 0) {
          repaired += '"';
        }

        // Balance brackets/braces
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/\]/g) || []).length;
        const openBraces = (repaired.match(/\{/g) || []).length;
        const closeBraces = (repaired.match(/\}/g) || []).length;

        repaired += "]".repeat(Math.max(0, openBrackets - closeBrackets));
        repaired += "}".repeat(Math.max(0, openBraces - closeBraces));

        try {
          return JSON.parse(repaired);
        } catch (_) {
          return null;
        }
      }
    }

    return null;
  }

  // ==================== MOOD-BASED EMOJI SUGGESTION ====================
  async suggestEmoji(text) {
    try {
      if (!text || text.trim().length < 3) return null;

      const systemPrompt = `
Based on the mood/context of this message, return ONLY ONE most relevant emoji.
Reply with just the emoji character, nothing else - no text, no explanation.

Message: ${text}
      `;

      const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        max_tokens: 10,
        temperature: 0.3,
      });

      const emoji = response.choices[0]?.message?.content?.trim() || null;

      if (emoji && emoji.length <= 6) {
        return emoji;
      }
      return null;
    } catch (error) {
      console.error("Emoji Suggestion Error:", error);
      return null;
    }
  }

  // ==================== ROAST / COMPLIMENT BOT ====================
  async roastOrCompliment(text, mode = "roast") {
    try {
      const systemPrompt =
        mode === "roast"
          ? `
You are a fun, friendly group chat bot. Give a LIGHT, playful, friendly roast on this message.
Rules:
1. Maximum 2 short lines.
2. Keep it playful and friendly, like a close friend teasing - NEVER genuinely mean, insulting, or offensive.
3. No swearing, no personal attacks on appearance/family/sensitive topics.
4. Match the language style of the message (Hindi/Hinglish/English).
5. Add 1 emoji max.

Message: ${text}
        `
          : `
You are a fun, friendly group chat bot. Give a warm, genuine compliment about this message.
Rules:
1. Maximum 2 short lines.
2. Be genuine and specific to what was said.
3. Match the language style of the message (Hindi/Hinglish/English).
4. Add 1 emoji max.

Message: ${text}
        `;

      const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        max_tokens: 80,
        temperature: 0.9,
      });

      return (
        response.choices[0]?.message?.content?.trim() ||
        (mode === "roast" ? "Haha nice try 😄" : "That's great! 👏")
      );
    } catch (error) {
      console.error("Roast/Compliment Error:", error);
      return null;
    }
  }

  // ==================== ICEBREAKER GENERATOR ====================
  async generateIcebreaker(groupName) {
    try {
      const systemPrompt = `
Generate ONE fun, interesting icebreaker question for a group chat called "${groupName || 'the group'}".
Rules:
1. Should be fun, light-hearted, and spark conversation.
2. One question only, 1 sentence.
3. Mix it up - could be "would you rather", hypothetical, opinion-based, or fun fact question.
4. Add 1-2 relevant emojis.
5. Keep it casual and friendly (Hinglish tone works well).
      `;

      const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate an icebreaker question" },
        ],
        max_tokens: 80,
        temperature: 1.0,
      });

      return (
        response.choices[0]?.message?.content?.trim() ||
        "Agar tumhe superpower milta toh kaunsa lete? 🦸"
      );
    } catch (error) {
      console.error("Icebreaker Error:", error);
      return "Agar tumhe superpower milta toh kaunsa lete? 🦸";
    }
  }

  // ==================== CLEAR CONTEXT ====================
  clearContext(userId) {
    this.contextMemory.delete(`personal_${userId}`);
  }
}

export default AIService;
