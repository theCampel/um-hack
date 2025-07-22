"use client"

import { useState, useEffect } from "react"
import { HealthSidebar } from "@/components/health-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { SidebarProvider } from "@/components/ui/sidebar"

interface HabitsData {
  [key: string]: {
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
}

export default function HealthDashboard() {
  const [habitsData, setHabitsData] = useState<HabitsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDataAsync = async () => {
      try {
        const data = await loadData()
        setHabitsData(data)
      } catch (error) {
        console.error("Failed to load habits data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDataAsync()
  }, [])

  /** Reads the JSON from /public - returns the parsed habits object */
  async function loadData() {
    const res = await fetch("/habits.json")
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as HabitsData
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const userData = habitsData ? Object.values(habitsData)[0] : null

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <HealthSidebar userData={userData} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardContent userData={userData} />
        </div>
      </div>
    </SidebarProvider>
  )
}
