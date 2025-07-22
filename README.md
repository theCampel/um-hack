# Aura - Your AI Life Copilot

Aura is an intelligent WhatsApp bot that helps you track habits, log activities, and research information using voice messages and text. Built with Gemini 2.0 Flash for natural conversation and tool calling.

## ✨ Features

- 🎤 **Voice Message Support** - Send voice notes, Aura understands them natively
- 📝 **Activity Logging** - Log meals, workouts, and daily activities
- 🎯 **Habit Tracking** - Track streaks for pills, meditation, exercise, etc.
- 🔍 **YouTube Research** - Get real YouTube video recommendations for any topic
- 📊 **Streak Management** - Visual feedback for habit consistency
- 🤖 **Natural Conversation** - Powered by Gemini 2.0 Flash with tool calling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- WhatsApp account
- Google AI Studio API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd um-hack
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   APP_ENV=development
   GEMINI_API_KEY=your_gemini_api_key_here
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

4. **Get your API keys**
   - **Gemini API key**: Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **YouTube API key**: Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
     - Enable the YouTube Data API v3
     - Create credentials (API key)
     - Copy both keys to your `.env` file

5. **Update the phone number**
   
   In `src/app.ts`, replace the phone number with yours:
   ```typescript
   if (message.from === 'YOUR_PHONE_NUMBER@c.us') {
   ```

6. **Start the bot**
   ```bash
   pnpm dev
   ```

7. **Scan the QR code**
   - A QR code will appear in your terminal
   - Open WhatsApp on your phone
   - Go to Settings > Linked Devices > Link a Device
   - Scan the QR code

## 🎯 Usage Examples

### Habit Tracking
- **Text**: "I just took my daily vitamins"
- **Voice**: *Record a voice note saying "Just finished my morning meditation"*

### Activity Logging  
- **Text**: "I had oatmeal and berries for breakfast, feeling energized"
- **Voice**: *"Just completed a 5k run, felt amazing!"*

### Research (YouTube Integration)
- **Text**: "I want to learn more about ultramarathons"
- **Voice**: *"Find me beginner guides for meditation"*
- **Response**: Real YouTube videos with titles, channels, and links!

### Check Progress
- **Text**: "How are my habits going?"
- **Voice**: *"Show me my current streaks"*

## 🏗️ Architecture

```
src/
├── app.ts                 # Main WhatsApp client setup
├── message-router.ts      # Routes messages to appropriate handlers
├── tools.ts              # Available tools for the AI agent
├── services/
│   ├── gemini.service.ts  # Gemini AI integration
│   └── habit.service.ts   # Habit tracking logic
└── data/
    └── habits.json        # User data storage
```

## 🔧 Configuration

### Supported Message Types
- **Text messages** (`chat`)
- **Voice messages** (`ptt` - Push-to-Talk)

### Available Tools
1. **logActivity** - Log daily activities with mood tracking
2. **updateHabit** - Mark habits as complete and track streaks
3. **research** - Get information on various topics
4. **getHabitStatus** - View current habit streaks

### Habit Data Structure
```json
{
  "user_id": {
    "name": "User Name",
    "habits": {
      "take_pills": {
        "streak": 7,
        "lastCompleted": "2025-01-21",
        "description": "Daily vitamins"
      }
    },
    "activities": [...],
    "preferences": {...}
  }
}
```

## 🛠️ Development

### Adding New Tools
1. Define the tool in `src/tools.ts`
2. Add it to the system prompt in `src/services/gemini.service.ts`
3. Update the tool execution switch in `src/message-router.ts`

### Testing
```bash
# Build the project
pnpm build

# Start in development mode
pnpm dev
```

## 📱 Phone Number Format

WhatsApp uses the format: `[country_code][phone_number]@c.us`

Examples:
- UK: `447927612815@c.us`
- US: `15551234567@c.us`

## 🎨 Customization

### Adding New Habit Types
Edit `data/habits.json` to add new habits for users.

### Modifying AI Behavior
Update the system prompt in `src/services/gemini.service.ts` to change how Aura responds.

### Research Topics
Add new hardcoded responses in `src/tools.ts` for demo purposes, or integrate with real APIs.

## 🚨 Troubleshooting

### QR Code Issues
- Make sure WhatsApp Web isn't already open elsewhere
- Clear browser cache and restart the bot
- Check that puppeteer dependencies are installed correctly

### API Errors
- Verify your `GEMINI_API_KEY` is correct
- Check that you have credits in Google AI Studio
- Ensure your API key has the necessary permissions

### Voice Message Issues
- Check that the audio file is being downloaded correctly
- Verify the temp file permissions
- Make sure the audio format is supported

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built for the hackathon with ❤️ - Aura makes habit tracking effortless through natural conversation.** 