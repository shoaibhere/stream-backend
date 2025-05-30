
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Tv, Play, TrendingUp, Plus, Activity } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTeamsCount, getMatchesCount, getLiveMatches } from "@/lib/data"

export default async function Dashboard() {
  const teamsCount = await getTeamsCount()
  const matchesCount = await getMatchesCount()
  const liveMatches = await getLiveMatches()
  const liveMatchesCount = liveMatches.length

  const stats = [
    {
      title: "Total Teams",
      value: teamsCount,
      description: "Football teams in database",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100/80",
      href: "/dashboard/teams",
      buttonText: "Manage Teams",
      trend: "12% increase",
    },
    {
      title: "Total Matches",
      value: matchesCount,
      description: "Configured match streams",
      icon: Tv,
      color: "text-green-600",
      bgColor: "bg-green-100/80",
      href: "/dashboard/matches",
      buttonText: "Manage Matches",
      trend: "5 new this week",
    },
    {
      title: "Live Matches",
      value: liveMatchesCount,
      description: "Currently streaming",
      icon: Play,
      color: "text-red-600",
      bgColor: "bg-red-100/80",
      href: "/dashboard/matches?status=live",
      buttonText: "View Live",
      trend: `${liveMatchesCount > 0 ? "Active now" : "None live"}`,
    },
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome to your football streaming admin dashboard</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card 
                key={stat.title} 
                className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                    <p className="text-xs font-medium text-gray-400 mt-1">{stat.trend}</p>
                  </div>
                  <Button asChild size="sm" className="w-full mt-2" variant="outline">
                    <Link href={stat.href} className="flex items-center">
                      {stat.buttonText}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Two-column section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Actions */}
            <Card className="lg:col-span-2 border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Button asChild className="w-full h-24 flex-col gap-2" variant="outline">
                  <Link href="/dashboard/teams" className="flex flex-col items-center justify-center">
                    <div className="p-3 rounded-full bg-white text-blue-600">
                      <Plus className="h-6 w-6" />
                    </div>
                    <span>Add New Team</span>
                  </Link>
                </Button>
                <Button asChild className="w-full h-24 flex-col gap-2" variant="outline">
                  <Link href="/dashboard/matches" className="flex flex-col items-center justify-center">
                    <div className="p-3 rounded-full bg-white text-green-600">
                      <Tv className="h-6 w-6" />
                    </div>
                    <span>Create Match</span>
                  </Link>
                </Button>
                <Button asChild className="w-full h-24 flex-col gap-2" variant="outline">
                  <Link href="/dashboard/matches?status=live" className="flex flex-col items-center justify-center">
                    <div className="p-3 rounded-full bg-white text-red-600">
                      <Play className="h-6 w-6" />
                    </div>
                    <span>Live Controls</span>
                  </Link>
                </Button>
                <Button asChild className="w-full h-24 flex-col gap-2" variant="outline">
                  <Link href="/dashboard/teams" className="flex flex-col items-center justify-center">
                    <div className="p-3 rounded-full bg-white text-purple-600">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <span>View Teams</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-1 rounded-full bg-green-100 text-green-600">
                    <Activity className="h-4 w-4" />
                  </div>
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100/50">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Database</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100/50">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Cloudinary</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-100/50">
                      <div className={`w-2 h-2 rounded-full ${liveMatchesCount > 0 ? "bg-red-600" : "bg-yellow-500"}`}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Live Streams</span>
                  </div>
                  <span className={`text-sm font-medium ${liveMatchesCount > 0 ? "text-red-600" : "text-yellow-600"}`}>
                    {liveMatchesCount > 0 ? `${liveMatchesCount} Active` : "Standby"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-100/50">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">API Service</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}