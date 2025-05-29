import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Tv } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTeamsCount, getMatchesCount } from "@/lib/data"

export default async function Dashboard() {
  const teamsCount = await getTeamsCount()
  const matchesCount = await getMatchesCount()

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your football streaming admin dashboard</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamsCount}</div>
              <p className="text-xs text-muted-foreground">Football teams in database</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/dashboard/teams">Manage Teams</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Tv className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matchesCount}</div>
              <p className="text-xs text-muted-foreground">Configured match streams</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/dashboard/matches">Manage Matches</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
