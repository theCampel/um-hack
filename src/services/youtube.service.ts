import { google } from 'googleapis';

interface YouTubeVideo {
  title: string;
  channelTitle: string;
  publishedAt: string;
  videoId: string;
  description: string;
  thumbnailUrl: string;
}

export class YouTubeService {
  private youtube;

  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
  }

  public async searchVideos(query: string, maxResults: number = 1): Promise<YouTubeVideo[]> {
    try {
      console.log(`[YouTube] Searching for: "${query}"`);

      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults,
        order: 'relevance',
        safeSearch: 'strict',
        videoDefinition: 'any',
        videoDuration: 'any'
      });

      if (!response.data.items || response.data.items.length === 0) {
        console.log('[YouTube] No videos found');
        return [];
      }

      const videos: YouTubeVideo[] = response.data.items.map(item => ({
        title: item.snippet?.title || 'No title',
        channelTitle: item.snippet?.channelTitle || 'Unknown channel',
        publishedAt: item.snippet?.publishedAt || '',
        videoId: item.id?.videoId || '',
        description: item.snippet?.description || '',
        thumbnailUrl: item.snippet?.thumbnails?.medium?.url || ''
      }));

      console.log(`[YouTube] Found ${videos.length} videos`);
      return videos;

    } catch (error) {
      console.error('[YouTube] Error searching videos:', error);
      return [];
    }
  }

  public formatVideoResults(videos: YouTubeVideo[], originalQuery: string): string {
    if (videos.length === 0) {
      return `I couldn't find any YouTube videos for "${originalQuery}". Try rephrasing your search or being more specific!`;
    }

    const video = videos[0];
    const publishDate = new Date(video.publishedAt).toLocaleDateString();
    
    let result = `🎥 Found a great video about "${originalQuery}":\n\n`;
    result += `**${video.title}**\n`;
    result += `📺 Channel: ${video.channelTitle}\n`;
    result += `📅 Published: ${publishDate}\n`;
    result += `🔗 https://www.youtube.com/watch?v=${video.videoId}\n\n`;
    result += `Happy learning! 🚀`;
    return result;
  }

  public enhanceSearchQuery(originalQuery: string): string {
    // Add keywords to improve search results
    const enhancements: Record<string, string> = {
      'ultramarathon': 'ultramarathon beginner guide training tips',
      'running': 'running training tips guide',
      'meditation': 'meditation for beginners guide',
      'nutrition': 'healthy nutrition guide tips',
      'workout': 'workout routine guide fitness',
      'stretching': 'stretching routine guide flexibility',
      'sleep': 'better sleep tips guide',
      'productivity': 'productivity tips guide habits',
      'mindfulness': 'mindfulness meditation guide',
      'strength training': 'strength training beginner guide'
    };

    const lowerQuery = originalQuery.toLowerCase();
    
    // Find matching enhancement
    for (const [key, enhancement] of Object.entries(enhancements)) {
      if (lowerQuery.includes(key)) {
        console.log(`[YouTube] Enhanced query from "${originalQuery}" to "${enhancement}"`);
        return enhancement;
      }
    }

    // Default enhancement - add "guide" or "tutorial" if not present
    if (!lowerQuery.includes('guide') && !lowerQuery.includes('tutorial') && !lowerQuery.includes('tips')) {
      return `${originalQuery} guide tutorial`;
    }

    return originalQuery;
  }
} 