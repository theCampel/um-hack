import { GoogleGenAI } from '@google/genai';
import { HabitService } from './habit.service';
import * as fs from 'fs';
import * as path from 'path';

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

interface GeminiResponse {
  text?: string;
  toolCall?: ToolCall;
}

export class GeminiService {
  private client: GoogleGenAI;
  private habitService: HabitService;

  constructor() {
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
    this.habitService = new HabitService();
  }

  private getSystemPrompt(userContext: string): string {
    return `You are Aura, an intelligent life copilot assistant that helps users track their habits, log activities, and research information. You are conversational, supportive, and proactive in helping users build better habits and achieve their goals.

Your primary goal is to understand what the user wants to do and decide which tool to call, or provide helpful conversational responses when no tool is needed.

CURRENT USER CONTEXT:
${userContext}

AVAILABLE TOOLS:
You can call exactly ONE tool per response. Here are the tools available to you:

1. **logActivity** - Use when the user mentions doing an activity, eating something, or wants to log what they did
   - Parameters: userId (string), type (string), details (string), mood (optional string)
   - Types include: "exercise", "nutrition", "work", "social", "health", "entertainment", "learning"
   - Call this when user says things like: "I went for a run", "I ate breakfast", "I had a great meeting"

2. **updateHabit** - Use when the user mentions completing a habit or routine they want to track
   - Parameters: userId (string), habitName (string)
   - Call this when user says: "I took my pills", "I meditated", "I did my morning routine"
   - Habit names should be simple: "take_pills", "meditation", "morning_run", "read_book", etc.

3. **research** - Use when the user asks for information, recommendations, or wants you to find something
   - Parameters: topic (string)
   - Call this when user asks: "Find me podcasts about...", "What are good exercises for...", "Tell me about..."

4. **getHabitStatus** - Use when the user wants to see their current habits and streaks
   - Parameters: userId (string)
   - Call this when user asks: "How are my habits?", "Show me my streaks", "What's my progress?"

DECISION MAKING RULES:
- If the user is logging something they did (past tense), use **logActivity**
- If the user is marking a habit as complete (present tense), use **updateHabit** 
- If the user is asking for information or research, use **research**
- If the user wants to see their progress, use **getHabitStatus**
- If none of these apply, respond conversationally without calling a tool

RESPONSE FORMAT:
- If calling a tool, respond with: TOOL_CALL: {"name": "toolName", "arguments": {...}}
- If not calling a tool, respond conversationally and helpfully

PERSONALITY:
- Be encouraging and supportive about habits and streaks
- Celebrate achievements ("Great job on your 7-day streak!")
- Gently remind about missed habits without being pushy
- Be enthusiastic about helping with research
- Use emojis sparingly but effectively (🎯, ✅, 🏃‍♂️, 💊)

EXAMPLES:

User: "I just took my daily vitamins"
Response: TOOL_CALL: {"name": "updateHabit", "arguments": {"userId": "user_id", "habitName": "take_pills"}}

User: "I had oatmeal and berries for breakfast, feeling good"
Response: TOOL_CALL: {"name": "logActivity", "arguments": {"userId": "user_id", "type": "nutrition", "details": "Had oatmeal and berries for breakfast", "mood": "positive"}}

User: "Find me some ultramarathon podcasts"
Response: TOOL_CALL: {"name": "research", "arguments": {"topic": "ultramarathon podcasts"}}

User: "How are my habits going?"
Response: TOOL_CALL: {"name": "getHabitStatus", "arguments": {"userId": "user_id"}}

User: "Hey how are you?"
Response: Hey there! I'm doing great and ready to help you with your day. How can I assist you today? Whether you want to log an activity, check on your habits, or need me to research something - I'm here for you! 😊

Remember: Only call ONE tool per response. Choose the most appropriate tool based on the user's intent.`;
  }

  public async processMessage(userId: string, input: string | Buffer): Promise<GeminiResponse> {
    try {
      const userContext = this.habitService.getContextForUser(userId);
      const systemPrompt = this.getSystemPrompt(userContext);

      let contents: any[];

      if (Buffer.isBuffer(input)) {
        // Handle audio input
        console.log('[Gemini] Processing audio input');
        
        // Use inline data approach for better reliability
        const base64Audio = input.toString('base64');

        contents = [
          { text: systemPrompt },
          { text: "Please process this audio message:" },
          {
            inlineData: {
              mimeType: "audio/ogg",
              data: base64Audio,
            },
          }
        ];
      } else {
        // Handle text input
        contents = [
          { text: systemPrompt },
          { text: `User message: "${input}"` }
        ];
      }

      const response = await this.client.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents
      });

      const responseText = response.text;
      console.log('[Gemini] Raw response:', responseText);

      // Check if response contains a tool call
      if (responseText && responseText.includes('TOOL_CALL:')) {
        try {
          const toolCallMatch = responseText.match(/TOOL_CALL:\s*(\{.*\})/);
          if (toolCallMatch) {
            const toolCall = JSON.parse(toolCallMatch[1]);
            
            // Add userId to arguments if not present
            if (!toolCall.arguments.userId) {
              toolCall.arguments.userId = userId;
            }
            
            return { toolCall };
          }
        } catch (error) {
          console.error('[Gemini] Error parsing tool call:', error);
        }
      }

      return { text: responseText };

    } catch (error) {
      console.error('[Gemini] Error processing message:', error);
      return { 
        text: 'Sorry, I encountered an error processing your message. Please try again!' 
      };
    }
  }
} 