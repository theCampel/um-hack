import * as fs from 'fs';
import * as path from 'path';

interface Habit {
  streak: number;
  lastCompleted: string;
  description: string;
}

interface Activity {
  date: string;
  type: string;
  details: string;
  mood?: string;
}

interface VideoRecommendation {
  date: string;
  query: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  videoId: string;
  url: string;
  thumbnailUrl: string;
}

interface UserData {
  name: string;
  habits: Record<string, Habit>;
  activities: Activity[];
  videoRecommendations: VideoRecommendation[];
  preferences: {
    interests: string[];
    goals: string[];
  };
}

interface HabitsData {
  [userId: string]: UserData;
}

export class HabitService {
  private dataPath = path.join(process.cwd(), 'data', 'habits.json');

  private loadData(): HabitsData {
    try {
      const data = fs.readFileSync(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading habits data:', error);
      return {};
    }
  }

  private saveData(data: HabitsData): void {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving habits data:', error);
    }
  }

  public getUserData(userId: string): UserData | null {
    const data = this.loadData();
    return data[userId] || null;
  }

  public updateHabit(userId: string, habitName: string): { success: boolean; message: string; newStreak: number } {
    const data = this.loadData();
    const today = new Date().toISOString().split('T')[0];

    if (!data[userId]) {
      return { success: false, message: 'User not found', newStreak: 0 };
    }

    if (!data[userId].habits[habitName]) {
      // Create new habit
      data[userId].habits[habitName] = {
        streak: 1,
        lastCompleted: today,
        description: habitName
      };
      
      this.saveData(data);
      return { 
        success: true, 
        message: `New habit started! Day 1 complete.`, 
        newStreak: 1 
      };
    } else {
      const habit = data[userId].habits[habitName];
      const lastCompleted = new Date(habit.lastCompleted);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        return { success: true, message: `Current streak: ${habit.streak} days`, newStreak: habit.streak };
      } else if (daysDiff === 1) {
        // Continue streak
        habit.streak += 1;
        habit.lastCompleted = today;
      } else {
        // Reset streak
        habit.streak = 1;
        habit.lastCompleted = today;
      }

      this.saveData(data);
      const finalStreak = data[userId].habits[habitName].streak;
      
      let message = 'Habit updated successfully';
      if (daysDiff > 1) {
        message = `Streak reset - back to day 1! Let's build it up again.`;
      } else if (daysDiff === 1) {
        message = `Streak continued! ${finalStreak} days and counting.`;
      }
      
      return { 
        success: true, 
        message, 
        newStreak: finalStreak 
      };
    }
  }

  public logActivity(userId: string, type: string, details: string, mood?: string): { success: boolean; message: string } {
    const data = this.loadData();
    const today = new Date().toISOString().split('T')[0];

    if (!data[userId]) {
      return { success: false, message: 'User not found' };
    }

    const activity: Activity = {
      date: today,
      type,
      details,
      mood
    };

    data[userId].activities.push(activity);
    this.saveData(data);

    return { success: true, message: 'Activity logged successfully' };
  }

  public logVideoRecommendation(userId: string, query: string, video: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    videoId: string;
    thumbnailUrl: string;
  }): { success: boolean; message: string } {
    const data = this.loadData();
    const today = new Date().toISOString().split('T')[0];

    if (!data[userId]) {
      return { success: false, message: 'User not found' };
    }

    // Initialize videoRecommendations array if it doesn't exist
    if (!data[userId].videoRecommendations) {
      data[userId].videoRecommendations = [];
    }

    const videoRecommendation: VideoRecommendation = {
      date: today,
      query,
      title: video.title,
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      videoId: video.videoId,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      thumbnailUrl: video.thumbnailUrl
    };

    data[userId].videoRecommendations.unshift(videoRecommendation); // Add to beginning
    
    // Keep only the last 20 recommendations to avoid file getting too large
    if (data[userId].videoRecommendations.length > 20) {
      data[userId].videoRecommendations = data[userId].videoRecommendations.slice(0, 20);
    }

    this.saveData(data);
    return { success: true, message: 'Video recommendation saved' };
  }

  public checkMissedHabitsToday(userId: string): { hasMissedHabits: boolean; missedHabits: string[]; suggestions: string[] } {
    const userData = this.getUserData(userId);
    if (!userData) {
      return { hasMissedHabits: false, missedHabits: [], suggestions: [] };
    }

    const today = new Date().toISOString().split('T')[0];
    const missedHabits: string[] = [];
    const suggestions: string[] = [];

    // Check each habit to see if it's been completed today
    Object.entries(userData.habits).forEach(([habitName, habit]) => {
      if (habit.lastCompleted !== today) {
        missedHabits.push(habitName);
        
        // Add contextual suggestions based on habit type and time of day
        const suggestion = this.getContextualSuggestion(habitName, userData.preferences.interests);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    });

    return {
      hasMissedHabits: missedHabits.length > 0,
      missedHabits,
      suggestions
    };
  }

  private getContextualSuggestion(habitName: string, interests: string[]): string | null {
    const currentHour = new Date().getHours();
    const isRunnerInterested = interests.some(interest => 
      interest.toLowerCase().includes('running') || 
      interest.toLowerCase().includes('ultramarathon') ||
      interest.toLowerCase().includes('health')
    );

    switch (habitName) {
      case 'take_pills':
        if (currentHour < 10) {
          return "Perfect time to take your morning vitamins with breakfast! 💊";
        } else if (currentHour < 14) {
          return "Don't forget your vitamins - take them with lunch for better absorption! 💊";
        } else {
          return "Still time for your daily vitamins - pair them with dinner! 💊";
        }

      case 'morning_run':
        if (currentHour < 9) {
          if (isRunnerInterested) {
            return "Great weather for a morning run! 🏃‍♂️ Maybe try that new route you've been thinking about?";
          } else {
            return "Perfect time for some movement - even a 10-minute walk will boost your energy! 🚶‍♂️";
          }
        } else if (currentHour < 12) {
          return "Still time for morning exercise! A quick bike ride to work could be perfect 🚴‍♂️";
        } else {
          return "Consider an evening run instead - great way to unwind after the day! 🌅";
        }

      case 'meditation':
        if (currentHour < 10) {
          return "Start your day mindfully - just 5 minutes of meditation can set a positive tone! 🧘‍♂️";
        } else if (currentHour < 17) {
          return "Midday meditation break? Perfect for resetting your focus and energy! 🧘‍♂️";
        } else {
          return "Evening meditation is great for winding down and better sleep! 🧘‍♂️";
        }

      default:
        // Generic suggestion based on time
        if (currentHour < 12) {
          return `Morning is a great time for ${habitName.replace('_', ' ')} - you've got this! ✨`;
        } else {
          return `Don't forget about ${habitName.replace('_', ' ')} today - still plenty of time! ✨`;
        }
    }
  }

  public formatMissedHabitsMessage(missedHabits: string[], suggestions: string[]): string {
    if (missedHabits.length === 0) return '';

    let message = `\n\n🎯 **Quick check-in:** I noticed you haven't completed some habits today:\n\n`;
    
    suggestions.forEach((suggestion, index) => {
      message += `• ${suggestion}\n`;
    });

    message += `\nYou're doing great - small consistent steps lead to big wins! 💪`;
    
    return message;
  }

  public getContextForUser(userId: string): string {
    const userData = this.getUserData(userId);
    if (!userData) {
      return 'No user data found';
    }

    const habitsSummary = Object.entries(userData.habits)
      .map(([name, habit]) => `${name}: ${habit.streak} day streak (last: ${habit.lastCompleted})`)
      .join(', ');

    const recentActivities = userData.activities
      .slice(-5)
      .map(activity => `${activity.date}: ${activity.type} - ${activity.details}`)
      .join('; ');

    return `User: ${userData.name}. Current habits: ${habitsSummary}. Recent activities: ${recentActivities}. Interests: ${userData.preferences.interests.join(', ')}. Goals: ${userData.preferences.goals.join(', ')}.`;
  }
} 