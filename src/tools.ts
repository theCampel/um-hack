import { HabitService } from './services/habit.service';

const habitService = new HabitService();

export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
}

export const tools = {
  logActivity: async (userId: string, type: string, details: string, mood?: string): Promise<ToolResult> => {
    console.log(`[Tools] Logging activity: ${type} - ${details}`);
    const result = habitService.logActivity(userId, type, details, mood);
    return result;
  },

  updateHabit: async (userId: string, habitName: string): Promise<ToolResult> => {
    console.log(`[Tools] Updating habit: ${habitName}`);
    const result = habitService.updateHabit(userId, habitName);
    return {
      success: result.success,
      message: result.message,
      data: { streak: result.newStreak }
    };
  },

  research: async (topic: string): Promise<ToolResult> => {
    console.log(`[Tools] Researching: ${topic}`);
    
    // For hackathon demo - hardcoded responses for common topics
    const responses: Record<string, string> = {
      'ultramarathon podcasts': 'Here are some great ultramarathon podcasts:\n\n1. **The Ultrarunning Podcast** - Interviews with elite ultrarunners\n2. **Trails and Tribulations** - Stories from the trail running community\n3. **Endurance Planet** - Training tips and race reports\n\nWould you like me to find specific episodes on any topic?',
      'running training': 'Here\'s a basic training plan:\n\n**Week 1-2:** Build base (3-4 runs/week, easy pace)\n**Week 3-4:** Add tempo runs (1x/week)\n**Week 5-6:** Include intervals\n**Week 7:** Taper for race\n\nRemember: 80% easy, 20% hard!',
      'healthy breakfast': 'Here are some nutritious breakfast ideas:\n\n• **Overnight oats** with berries and nuts\n• **Greek yogurt** with granola and honey\n• **Avocado toast** with eggs\n• **Smoothie bowl** with protein powder\n\nAll provide sustained energy for your day!'
    };

    const lowerTopic = topic.toLowerCase();
    const response = Object.keys(responses).find(key => lowerTopic.includes(key));
    
    if (response) {
      return {
        success: true,
        message: responses[response]
      };
    }

    return {
      success: true,
      message: `I'd be happy to research "${topic}" for you! For this demo, I have pre-loaded responses for ultramarathon podcasts, running training, and healthy breakfast ideas. In the full version, I would search the web for the latest information on your topic.`
    };
  },

  getHabitStatus: async (userId: string): Promise<ToolResult> => {
    console.log(`[Tools] Getting habit status for user: ${userId}`);
    const userData = habitService.getUserData(userId);
    
    if (!userData) {
      return {
        success: false,
        message: 'User data not found'
      };
    }

    const habitsList = Object.entries(userData.habits)
      .map(([name, habit]) => `• **${name}**: ${habit.streak} day streak`)
      .join('\n');

    return {
      success: true,
      message: `Here are your current habits:\n\n${habitsList}\n\nKeep up the great work! 🎯`
    };
  }
};

export type ToolName = keyof typeof tools; 