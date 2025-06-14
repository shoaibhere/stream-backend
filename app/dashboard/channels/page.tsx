import DashboardLayout from "@/components/dashboard-layout"
import ChannelsPageClient from "@/components/channels-page-client"
import { getChannels } from "@/lib/data"

export default async function ChannelsPage() {
  const initialChannels = await getChannels()

  return (
    <DashboardLayout>
      <ChannelsPageClient initialChannels={initialChannels} />
    </DashboardLayout>
  )
}
