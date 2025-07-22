"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Activity, Heart, Pill, Target, TrendingUp, Calendar, MessageSquare } from "lucide-react"

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

interface HealthSidebarProps {
  userData: UserData | null
}

export function HealthSidebar({ userData }: HealthSidebarProps) {
  const menuItems = [
    { icon: Activity, label: "Dashboard", active: true },
    { icon: Heart, label: "Health Metrics" },
    { icon: Pill, label: "Medications" },
    { icon: Target, label: "Goals" },
    { icon: TrendingUp, label: "Analytics" },
    { icon: Calendar, label: "Timeline" },
    { icon: MessageSquare, label: "WhatsApp Sync" },
  ]

  return (
    <div className="w-64 h-full border-r bg-background">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg?height=48&width=48&text=LC" />
            <AvatarFallback className="bg-blue-600 text-white">
              {userData?.name
                .split(" ")
                .map((n) => n[0])
                .join("") || "LC"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{userData?.name || "Loading..."}</h2>
            <p className="text-sm text-muted-foreground">Health Dashboard</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 h-full overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Navigation</h3>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    item.active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {userData && (
            <>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Streaks</h3>
                <div className="space-y-2">
                  {Object.entries(userData.habits).map(([key, habit]) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-2">
                        <Pill className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          {key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <Badge variant={habit.streak > 0 ? "default" : "secondary"}>{habit.streak} days</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Goals</h3>
                <div className="space-y-1">
                  {userData.preferences.goals.map((goal, index) => (
                    <div key={index} className="text-sm p-2 rounded bg-muted/30">
                      {goal}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
