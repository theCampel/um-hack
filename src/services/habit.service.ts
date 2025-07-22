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

interface UserData {
  name: string;
  habits: Record<string, Habit>;
  activities: Activity[];
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
    } else {
      const habit = data[userId].habits[habitName];
      const lastCompleted = new Date(habit.lastCompleted);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        return { success: false, message: 'Habit already completed today', newStreak: habit.streak };
      } else if (daysDiff === 1) {
        // Continue streak
        habit.streak += 1;
        habit.lastCompleted = today;
      } else {
        // Reset streak
        habit.streak = 1;
        habit.lastCompleted = today;
      }
    }

    this.saveData(data);
    return { 
      success: true, 
      message: 'Habit updated successfully', 
      newStreak: data[userId].habits[habitName].streak 
    };
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