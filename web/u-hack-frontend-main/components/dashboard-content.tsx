"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ActivityGrid } from "@/components/activity-grid"
import { TimelineView } from "@/components/timeline-view"
import { HealthTips } from "@/components/health-tips"
import { Heart, Activity, Moon, Pill, Target, MessageSquare, Clock } from "lucide-react"

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

interface DashboardContentProps {
  userData: UserData | null
}

export function DashboardContent({ userData }: DashboardContentProps) {
  const lastUpdated = new Date().toLocaleString()

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-xl font-semibold">Health Dashboard</h1>
          <Badge variant="outline" className="ml-auto">
            <MessageSquare className="h-3 w-3 mr-1" />
            Last updated via WhatsApp: {lastUpdated}
          </Badge>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Health Metrics Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Steps Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,547</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
              <Progress value={85} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">72 BPM</div>
              <p className="text-xs text-muted-foreground">Resting rate</p>
              <div className="flex items-center mt-2">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-green-600">Normal</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sleep</CardTitle>
              <Moon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7h 23m</div>
              <p className="text-xs text-muted-foreground">Last night</p>
              <div className="flex items-center mt-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-blue-600">Good quality</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pills Taken</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData?.habits.take_pills?.streak || 0}</div>
              <p className="text-xs text-muted-foreground">Day streak</p>
              <div className="flex items-center mt-2">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-green-600">On track</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Grid and Timeline */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityGrid userData={userData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineView userData={userData} />
            </CardContent>
          </Card>
        </div>

        {/* Health Tips */}
        <HealthTips userData={userData} />
      </main>
    </div>
  )
}
