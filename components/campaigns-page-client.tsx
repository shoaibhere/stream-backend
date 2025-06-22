"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Send, Pencil, Trash2, Play, Pause, TestTube } from "lucide-react"
import CampaignDialog from "@/components/campaign-dialog"
import DeleteCampaignDialog from "@/components/delete-campaign-dialog"
import TestNotificationSender from "@/components/test-notification-sender"
import { useToast } from "@/hooks/use-toast"

interface Campaign {
  _id: string
  title: string
  message: {
    title: string
    body: string
  }
  targetAudience: "all" | "live-matches" | "custom"
  customTopic?: string
  status: "sent" | "failed"
  createdAt: string
  matchId?: string
  campaignType: "instant" | "scheduled"
  messageId?: string
  stats?: {
    sent: number
    delivered: number
    opened: number
  }
}

export default function CampaignsPageClient() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTestSender, setShowTestSender] = useState(false)
  const { toast } = useToast()

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/campaigns")
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data)
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error)
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()

    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail.type === "campaign") {
        fetchCampaigns()
      }
    }

    window.addEventListener("dataUpdated", handleDataUpdate as EventListener)
    return () => window.removeEventListener("dataUpdated", handleDataUpdate as EventListener)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-700"
      case "failed":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notification Campaigns</h1>
          <p className="text-sm sm:text-base text-gray-600">Create and manage instant push notifications</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button 
            variant="outline" 
            onClick={() => setShowTestSender(!showTestSender)}
            className="text-sm sm:text-base"
          >
            <TestTube className="mr-2 h-4 w-4" />
            {showTestSender ? "Hide Test Sender" : "Test Notifications"}
          </Button>
          <CampaignDialog isInstant>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </CampaignDialog>
        </div>
      </div>

      {showTestSender && <TestNotificationSender />}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Sent</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {campaigns.filter((c) => c.status === "sent").length}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Send className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Failed</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {campaigns.filter((c) => c.status === "failed").length}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Pause className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Send className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-sm sm:text-base text-gray-500 text-center mb-6 sm:mb-8 max-w-md">
              Create your first notification campaign to engage with your audience
            </p>
            <CampaignDialog isInstant>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Campaign
              </Button>
            </CampaignDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign._id} className="hover:shadow-md transition-shadow border border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Send className="h-4 w-4 text-gray-500" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{campaign.title}</h3>
                      <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3 sm:mb-4">
                      <p className="text-sm font-medium text-gray-700">{campaign.message.title}</p>
                      <p className="text-sm text-gray-600">{campaign.message.body}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
                      <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                      {campaign.messageId && (
                        <span className="truncate">Message ID: {campaign.messageId.substring(0, 12)}...</span>
                      )}
                    </div>

                    {campaign.stats && (
                      <div className="flex flex-wrap gap-3 sm:gap-6 mt-3 text-xs sm:text-sm">
                        <span className="text-gray-600">
                          Sent: <span className="font-medium text-gray-900">{campaign.stats.sent}</span>
                        </span>
                        <span className="text-gray-600">
                          Delivered: <span className="font-medium text-gray-900">{campaign.stats.delivered}</span>
                        </span>
                        <span className="text-gray-600">
                          Opened: <span className="font-medium text-gray-900">{campaign.stats.opened}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:ml-4">
                    <CampaignDialog campaignId={campaign._id} isInstant>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </CampaignDialog>
                    <DeleteCampaignDialog campaignId={campaign._id} campaignTitle={campaign.title}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 sm:h-9 sm:w-9 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DeleteCampaignDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}