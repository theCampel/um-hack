"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Heart, Pill, Utensils } from "lucide-react"

interface UserData {
  name: string
  habits: {
    [key: string]: {
      streak: number
      lastCompleted: string
      description: string
    }
  }
  activities: Array<{
    date: string
    type: string
    details: string
    mood: string
  }>
}

interface TimelineViewProps {
  userData: UserData | null
}

export function TimelineView({ userData }: TimelineViewProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "exercise":
        return <Activity className="h-4 w-4 text-blue-600" />
      case "nutrition":
        return <Utensils className="h-4 w-4 text-green-600" />
      case "medication":
        return <Pill className="h-4 w-4 text-purple-600" />
      default:
        return <Heart className="h-4 w-4 text-red-600" />
    }
  }

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "neutral":
        return "bg-gray-100 text-gray-800"
      case "negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  // Combine activities with habit completions
  const timelineItems = [
    ...(userData?.activities || []).map((activity) => ({
      ...activity,
      timestamp: new Date(activity.date).toLocaleString(),
    })),
    // Add recent habit completions
    ...Object.entries(userData?.habits || {}).map(([key, habit]) => ({
      date: habit.lastCompleted,
      type: "habit",
      details: `Completed: ${habit.description}`,
      mood: "positive",
      timestamp: new Date(habit.lastCompleted).toLocaleString(),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {timelineItems.slice(0, 10).map((item, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
            <div className="flex-shrink-0 mt-1">{getIcon(item.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{item.details}</p>
                <Badge className={getMoodColor(item.mood)}>{item.mood}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
