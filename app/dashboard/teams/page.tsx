import DashboardLayout from "@/components/dashboard-layout"
import TeamsPageClient from "@/components/teams-page-client"

export default async function TeamsPage() {

  return (
    <DashboardLayout>
      <TeamsPageClient/>
    </DashboardLayout>
  )
}
