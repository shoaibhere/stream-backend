import DashboardLayout from "@/components/dashboard-layout"
import MatchesPageClient from "@/components/matches-page-client"
import { getMatches, getTeams, getChannels } from "@/lib/data"

export default async function MatchesPage() {
  const initialMatches = await getMatches()
  const teams = await getTeams()
  const channels = await getChannels()

  return (
    <DashboardLayout>
      <MatchesPageClient initialMatches={initialMatches} teams={teams} channels={channels} />
    </DashboardLayout>
  )
}
