"use client"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

interface ActivityGridProps {
  userData: UserData | null
}

export function ActivityGrid({ userData }: ActivityGridProps) {
  // Generate last 365 days organized by weeks
  const generateWeeks = () => {
    const weeks = []
    const today = new Date()

    // Start from 52 weeks ago
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 364)

    // Find the Sunday before the start date
    const startSunday = new Date(startDate)
    startSunday.setDate(startDate.getDate() - startDate.getDay())

    for (let week = 0; week < 53; week++) {
      const weekDays = []
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startSunday)
        currentDate.setDate(startSunday.getDate() + week * 7 + day)
        weekDays.push(currentDate)
      }
      weeks.push(weekDays)
    }

    return weeks
  }

  const weeks = generateWeeks()

  const getActivityLevel = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    const today = new Date().toISOString().split("T")[0]

    // Don't show activity for future dates
    if (dateStr > today) return 0

    // Check if pills were taken
    const pillsTaken = userData?.habits.take_pills?.lastCompleted === dateStr

    // Check if there are activities on this date
    const hasActivity = userData?.activities.some((activity) => activity.date === dateStr)

    // Simulate some activity data based on date patterns
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const randomFactor = Math.sin(date.getTime() / 86400000) * 0.5 + 0.5

    if (pillsTaken && hasActivity) return 4 // High activity
    if (pillsTaken || hasActivity) return 3 // Medium-high
    if (!isWeekend && randomFactor > 0.7) return 2 // Medium
    if (randomFactor > 0.85) return 1 // Low activity
    return 0 // No activity
  }

  const getColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-gray-100 dark:bg-gray-800"
      case 1:
        return "bg-green-200 dark:bg-green-900"
      case 2:
        return "bg-green-300 dark:bg-green-700"
      case 3:
        return "bg-green-500 dark:bg-green-600"
      case 4:
        return "bg-green-700 dark:bg-green-500"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Legend */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Less</span>
          <div className="flex items-center space-x-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getColor(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>

        {/* Month labels */}
        <div className="flex justify-start ml-8">
          <div className="grid grid-cols-12 gap-4 text-xs text-muted-foreground w-full">
            {monthLabels.map((month, index) => (
              <span key={index} className="text-center">
                {month}
              </span>
            ))}
          </div>
        </div>

        {/* Grid container */}
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col justify-between text-xs text-muted-foreground mr-2 h-24">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* Activity grid */}
          <div className="flex gap-1 overflow-x-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const level = getActivityLevel(day)
                  const dateStr = day.toLocaleDateString()
                  const isToday = day.toDateString() === new Date().toDateString()

                  return (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger>
                        <div
                          className={`w-3 h-3 rounded-sm ${getColor(level)} hover:ring-2 hover:ring-blue-500 transition-all ${
                            isToday ? "ring-2 ring-blue-400" : ""
                          }`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-medium">{dateStr}</p>
                          <p className="text-sm">
                            {level === 0
                              ? "No activity"
                              : level === 1
                                ? "Low activity"
                                : level === 2
                                  ? "Medium activity"
                                  : level === 3
                                    ? "High activity"
                                    : "Very high activity"}
                          </p>
                          {level > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Pills:{" "}
                              {userData?.habits.take_pills?.lastCompleted === day.toISOString().split("T")[0]
                                ? "✓"
                                : "✗"}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-lg">{userData?.habits.take_pills?.streak || 0}</div>
            <div className="text-muted-foreground">Current streak</div>
          </div>
          <div>
            <div className="font-semibold text-lg">
              {weeks.flat().filter((day) => getActivityLevel(day) > 0 && day <= new Date()).length}
            </div>
            <div className="text-muted-foreground">Active days</div>
          </div>
          <div>
            <div className="font-semibold text-lg">
              {Math.round(
                (weeks.flat().filter((day) => getActivityLevel(day) > 0 && day <= new Date()).length / 365) * 100,
              )}
              %
            </div>
            <div className="text-muted-foreground">Activity rate</div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
