"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb } from "lucide-react"

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
  preferences: {
    interests: string[]
    goals: string[]
  }
}

interface HealthTipsProps {
  userData: UserData | null
}

export function HealthTips({ userData }: HealthTipsProps) {
  const generatePersonalizedTips = () => {
    const tips = []

    if (userData?.habits.meditation?.streak === 0) {
      tips.push({
        title: "Start Your Meditation Journey",
        description: "You haven't meditated recently. Try starting with just 5 minutes a day.",
        type: "mindfulness",
        priority: "high",
      })
    }

    if (userData?.preferences.interests.includes("ultramarathons")) {
      tips.push({
        title: "Ultramarathon Training Tip",
        description: "Focus on building your aerobic base with longer, slower runs.",
        type: "exercise",
        priority: "medium",
      })
    }

    tips.push({
      title: "Hydration Reminder",
      description: "Aim for 8 glasses of water daily, especially after your morning runs.",
      type: "nutrition",
      priority: "medium",
    })

    tips.push({
      title: "Sleep Optimization",
      description: "Your sleep quality is good! Try to maintain consistent bedtime hours.",
      type: "sleep",
      priority: "low",
    })

    return tips
  }

  const tips = generatePersonalizedTips()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Personalized Health Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {tips.map((tip, index) => (
            <div key={index} className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{tip.title}</h4>
                <Badge className={getPriorityColor(tip.priority)}>{tip.priority}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{tip.description}</p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {tip.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
