import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Tv, Play, TrendingUp } from "lucide-react"
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
      bgColor: "bg-blue-100",
      href: "/dashboard/teams",
      buttonText: "Manage Teams",
    },
    {
      title: "Total Matches",
      value: matchesCount,
      description: "Configured match streams",
      icon: Tv,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/dashboard/matches",
      buttonText: "Manage Matches",
    },
    {
      title: "Live Matches",
      value: liveMatchesCount,
      description: "Currently streaming",
      icon: Play,
      color: "text-red-600",
      bgColor: "bg-red-100",
      href: "/dashboard/matches",
      buttonText: "View Live",
    },
    {
      title: "Total Streams",
      value: liveMatchesCount + matchesCount,
      description: "All time streams",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/dashboard/matches",
      buttonText: "View All",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-600">Welcome to your football streaming admin dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="admin-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                  <p className="text-sm text-slate-500">{stat.description}</p>
                </div>
                <Button asChild size="sm" className="w-full admin-button-primary">
                  <Link href={stat.href}>{stat.buttonText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full admin-button-primary justify-start">
                <Link href="/dashboard/teams">
                  <Users className="h-4 w-4 mr-2" />
                  Add New Team
                </Link>
              </Button>
              <Button asChild className="w-full admin-button-secondary justify-start">
                <Link href="/dashboard/matches">
                  <Tv className="h-4 w-4 mr-2" />
                  Create Match
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Database</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Cloudinary</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Live Streams</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${liveMatchesCount > 0 ? "bg-green-500" : "bg-yellow-500"}`}
                  ></div>
                  <span
                    className={`text-sm font-medium ${liveMatchesCount > 0 ? "text-green-600" : "text-yellow-600"}`}
                  >
                    {liveMatchesCount > 0 ? `${liveMatchesCount} Active` : "None Active"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
