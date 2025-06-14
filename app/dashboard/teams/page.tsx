import DashboardLayout from "@/components/dashboard-layout"
import TeamsPageClient from "@/components/teams-page-client"
import { getTeams } from "@/lib/data"

export default async function TeamsPage() {
  const initialTeams = await getTeams()

  return (
    <DashboardLayout>
      <TeamsPageClient initialTeams={initialTeams} />
    </DashboardLayout>
  )
}
