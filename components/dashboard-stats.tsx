"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface Stat {
  title: string
  value: number | string
  description: string
  icon: any
  color: string
  bgColor: string
  href: string
  change: string
}

interface DashboardStatsProps {
  initialStats: Stat[]
}

export default function DashboardStats({ initialStats }: DashboardStatsProps) {
  const [stats, setStats] = useState(initialStats)

  const fetchUpdatedStats = async () => {
    try {
      // Fetch updated counts
      const [teamsRes, channelsRes, matchesRes, liveMatchesRes] = await Promise.all([
        fetch("/api/teams"),
        fetch("/api/channels"),
        fetch("/api/matches"),
        fetch("/api/live-matches"),
      ])

      if (teamsRes.ok && channelsRes.ok && matchesRes.ok && liveMatchesRes.ok) {
        const [teams, channels, matches, liveMatches] = await Promise.all([
          teamsRes.json(),
          channelsRes.json(),
          matchesRes.json(),
          liveMatchesRes.json(),
        ])

        const updatedStats = stats.map((stat) => {
          switch (stat.title) {
            case "Total Teams":
              return { ...stat, value: teams.length }
            case "Total Channels":
              return { ...stat, value: channels.length }
            case "Total Matches":
              return { ...stat, value: matches.length }
            case "Live Matches":
              return { ...stat, value: liveMatches.length }
            default:
              return stat
          }
        })

        setStats(updatedStats)
      }
    } catch (error) {
      console.error("Failed to fetch updated stats:", error)
    }
  }

  useEffect(() => {
    const handleDataUpdate = () => {
      fetchUpdatedStats()
    }

    // Listen for data updates
    window.addEventListener("dataUpdated", handleDataUpdate)

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchUpdatedStats, 30000)

    return () => {
      window.removeEventListener("dataUpdated", handleDataUpdate)
      clearInterval(interval)
    }
  }, [stats])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="dashboard-card hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">{stat.description}</p>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.change === "Live" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
              >
                {stat.change}
              </span>
              <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link href={stat.href}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
