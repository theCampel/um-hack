import { Message } from 'whatsapp-web.js';
import { GeminiService } from './services/gemini.service';
import { HabitService } from './services/habit.service';
import { tools, ToolName, ToolResult } from './tools';

export class MessageRouter {
  private geminiService: GeminiService;
  private habitService: HabitService;

  constructor() {
    this.geminiService = new GeminiService();
    this.habitService = new HabitService();
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

      if (geminiResponse.toolCalls) {
        // Execute multiple tools
        console.log(`[MessageRouter] Executing ${geminiResponse.toolCalls.length} tools`);
        const results = [];
        
        for (const toolCall of geminiResponse.toolCalls) {
          console.log(`[MessageRouter] Executing tool: ${toolCall.name}`);
          const toolResult = await this.executeTool(toolCall.name as ToolName, toolCall.arguments);
          results.push({ toolName: toolCall.name, result: toolResult });
        }
        
        // Format combined response
        const successResults = results.filter(r => r.result.success);
        const failedResults = results.filter(r => !r.result.success);
        
        let responseMessage = '';
        
        if (successResults.length > 0) {
          responseMessage += successResults
            .map(r => this.formatSuccessResponse(r.toolName, r.result))
            .join('\n\n');
        }
        
        if (failedResults.length > 0) {
          responseMessage += (responseMessage ? '\n\n' : '') + 
            failedResults.map(r => `❌ ${r.result.message}`).join('\n');
        }
        
        await message.reply(responseMessage || 'All tasks completed!');
        
        // Check if any of the tools was research, then check habits
        const hasResearch = geminiResponse.toolCalls.some(tc => tc.name === 'research');
        if (hasResearch) {
          await this.checkAndSendHabitReminder(message, userId);
        }
        
      } else if (geminiResponse.toolCall) {
        // Execute single tool
        console.log(`[MessageRouter] Executing tool: ${geminiResponse.toolCall.name}`);
        const toolResult = await this.executeTool(geminiResponse.toolCall.name as ToolName, geminiResponse.toolCall.arguments);
        
        if (toolResult.success) {
          await message.reply(this.formatSuccessResponse(geminiResponse.toolCall.name, toolResult));
        } else {
          await message.reply(`❌ ${toolResult.message}`);
        }

        // Check habits after research
        if (geminiResponse.toolCall.name === 'research') {
          await this.checkAndSendHabitReminder(message, userId);
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
          result = await tools.research(args.userId, args.topic);
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
        
        // Check if it was already completed today vs newly completed
        if (result.message.includes('Current streak:')) {
          return `${streakEmoji} ${result.message} - Keep it up!`;
        } else {
          return `${streakEmoji} Awesome! Your streak is now ${streak} days strong!`;
        }
      
      case 'logActivity':
        return `📝 Activity logged! Keep tracking your progress.`;
      
      case 'research':
        return result.message;
      
      case 'getHabitStatus':
        return result.message;
      
      default:
        return result.message;
    }
  }

  private async checkAndSendHabitReminder(message: Message, userId: string): Promise<void> {
    try {
      // Small delay to let the research response be sent first
      setTimeout(async () => {
        const habitCheck = this.habitService.checkMissedHabitsToday(userId);
        
        if (habitCheck.hasMissedHabits) {
          const habitMessage = this.habitService.formatMissedHabitsMessage(
            habitCheck.missedHabits, 
            habitCheck.suggestions
          );
          
          if (habitMessage) {
            console.log('[MessageRouter] Sending habit reminder');
            await message.reply(habitMessage);
          }
        }
      }, 2000); // 2 second delay
      
    } catch (error) {
      console.error('[MessageRouter] Error checking habits:', error);
      // Don't throw error - habit checking is optional
    }
  }
} 