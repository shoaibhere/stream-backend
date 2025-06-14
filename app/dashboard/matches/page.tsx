import DashboardLayout from "@/components/dashboard-layout"
import MatchesPageClient from "@/components/matches-page-client"

export default async function MatchesPage() {
  return (
    <DashboardLayout>
      <MatchesPageClient />
    </DashboardLayout>
  )
}
