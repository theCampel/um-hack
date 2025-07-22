import { Message } from 'whatsapp-web.js';
import { GeminiService } from './services/gemini.service';
import { tools, ToolName, ToolResult } from './tools';

export class MessageRouter {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  public async handle(message: Message): Promise<void> {
    try {
      const userId = message.from;
      let input: string | Buffer;

      // Handle different message types
      if (message.type === 'chat') {
        // Text message
        input = message.body;
        console.log(`[MessageRouter] Processing text message: "${input}"`);
      } else if (message.type === 'ptt') {
        // Voice message (Push-to-Talk)
        console.log('[MessageRouter] Processing voice message');
        
        if (message.hasMedia) {
          try {
            const media = await message.downloadMedia();
            input = Buffer.from(media.data, 'base64');
            console.log(`[MessageRouter] Downloaded audio: ${input.length} bytes`);
          } catch (error) {
            console.error('[MessageRouter] Error downloading audio:', error);
            await message.reply('Sorry, I had trouble processing your voice message. Could you try again?');
            return;
          }
        } else {
          console.error('[MessageRouter] Voice message has no media');
          await message.reply('I received a voice message but couldn\'t access the audio. Please try sending it again.');
          return;
        }
      } else {
        console.log(`[MessageRouter] Unsupported message type: ${message.type}`);
        await message.reply('I can only process text messages and voice notes right now. Please try one of those!');
        return;
      }

      // Send typing indicator
      await message.getChat().then(chat => chat.sendStateTyping());

      // Process with Gemini
      const geminiResponse = await this.geminiService.processMessage(userId, input);

      if (geminiResponse.toolCall) {
        // Execute the tool
        console.log(`[MessageRouter] Executing tool: ${geminiResponse.toolCall.name}`);
        const toolResult = await this.executeTool(geminiResponse.toolCall.name as ToolName, geminiResponse.toolCall.arguments);
        
        if (toolResult.success) {
          await message.reply(this.formatSuccessResponse(geminiResponse.toolCall.name, toolResult));
        } else {
          await message.reply(`❌ ${toolResult.message}`);
        }
      } else if (geminiResponse.text) {
        // Direct conversational response
        await message.reply(geminiResponse.text);
      } else {
        // Fallback
        await message.reply('I\'m not sure how to help with that. Could you try rephrasing your message?');
      }

    } catch (error) {
      console.error('[MessageRouter] Error handling message:', error);
      await message.reply('Sorry, I encountered an error processing your message. Please try again!');
    }
  }

  private async executeTool(toolName: ToolName, args: Record<string, any>): Promise<ToolResult> {
    try {
      const tool = tools[toolName];
      if (!tool) {
        return {
          success: false,
          message: `Tool "${toolName}" not found`
        };
      }

      // Execute the tool based on the specific tool name
      let result: ToolResult;
      switch (toolName) {
        case 'logActivity':
          result = await tools.logActivity(args.userId, args.type, args.details, args.mood);
          break;
        case 'updateHabit':
          result = await tools.updateHabit(args.userId, args.habitName);
          break;
        case 'research':
          result = await tools.research(args.topic);
          break;
        case 'getHabitStatus':
          result = await tools.getHabitStatus(args.userId);
          break;
        default:
          result = {
            success: false,
            message: `Unknown tool: ${toolName}`
          };
      }
      
      return result;
    } catch (error) {
      console.error(`[MessageRouter] Error executing tool ${toolName}:`, error);
      return {
        success: false,
        message: 'An error occurred while processing your request'
      };
    }
  }

  private formatSuccessResponse(toolName: string, result: ToolResult): string {
    switch (toolName) {
      case 'updateHabit':
        const streak = result.data?.streak || 0;
        const streakEmoji = streak >= 7 ? '🔥' : streak >= 3 ? '⭐' : '✅';
        return `${streakEmoji} Great job! Your streak is now ${streak} days. ${result.message}`;
      
      case 'logActivity':
        return `📝 ${result.message} Keep tracking your progress!`;
      
      case 'research':
        return result.message;
      
      case 'getHabitStatus':
        return result.message;
      
      default:
        return result.message;
    }
  }
} 