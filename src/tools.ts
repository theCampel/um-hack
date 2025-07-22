import { HabitService } from './services/habit.service';
import { YouTubeService } from './services/youtube.service';

const habitService = new HabitService();
const youtubeService = new YouTubeService();

// Fallback responses when YouTube API is not available
async function getFallbackResponse(topic: string): Promise<ToolResult> {
  const responses: Record<string, string> = {
    'ultramarathon': 'Here are some great ultramarathon resources:\n\n1. **The Ultrarunning Podcast** - Interviews with elite ultrarunners\n2. **Trails and Tribulations** - Stories from the trail running community\n3. **Endurance Planet** - Training tips and race reports\n\nWould you like me to find specific episodes on any topic?',
    'running': 'Here\'s a basic training plan:\n\n**Week 1-2:** Build base (3-4 runs/week, easy pace)\n**Week 3-4:** Add tempo runs (1x/week)\n**Week 5-6:** Include intervals\n**Week 7:** Taper for race\n\nRemember: 80% easy, 20% hard!',
    'nutrition': 'Here are some nutritious meal ideas:\n\n• **Overnight oats** with berries and nuts\n• **Greek yogurt** with granola and honey\n• **Avocado toast** with eggs\n• **Smoothie bowl** with protein powder\n\nAll provide sustained energy for your day!'
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
    message: `I'd be happy to research "${topic}" for you! To get YouTube video recommendations, please add your YouTube API key to the .env file. For now, I can provide general guidance on topics like ultramarathons, running, and nutrition.`
  };
}

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

  research: async (userId: string, topic: string): Promise<ToolResult> => {
    console.log(`[Tools] Researching: ${topic}`);
    
    try {
      // Check if YouTube API key is available
      if (!process.env.YOUTUBE_API_KEY) {
        console.warn('[Tools] YouTube API key not found, using fallback responses');
        return await getFallbackResponse(topic);
      }

      // Enhance the search query for better results
      const enhancedQuery = youtubeService.enhanceSearchQuery(topic);
      
      // Search YouTube for videos
      const videos = await youtubeService.searchVideos(enhancedQuery, 1);
      
      if (videos.length > 0) {
        // Save the video recommendation to user data
        const saveResult = habitService.logVideoRecommendation(userId, topic, videos[0]);
        if (saveResult.success) {
          console.log('[Tools] Video recommendation saved to user data');
        }
      }
      
      // Format the results
      const formattedResults = youtubeService.formatVideoResults(videos, topic);
      
      return {
        success: true,
        message: formattedResults
      };

    } catch (error) {
      console.error('[Tools] Error in YouTube research:', error);
      return await getFallbackResponse(topic);
    }
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