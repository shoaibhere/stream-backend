import { Suspense } from "react"
import CampaignsPageClient from "@/components/campaigns-page-client"
import DashboardLayout from "@/components/dashboard-layout"
export default function CampaignsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardLayout>
      <Suspense fallback={<div>Loading campaigns...</div>}>
        <CampaignsPageClient />
      </Suspense>
      </DashboardLayout>
    </div>
  )
}
