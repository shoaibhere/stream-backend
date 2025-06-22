"use client"

import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import CampaignDialog from "./campaign-dialog"

interface InstantCampaignButtonProps {
  matchId: string
  matchTitle: string
  isLive: boolean
  size?: "sm" | "default"
  variant?: "default" | "outline" | "secondary"
  className?: string
}

export default function InstantCampaignButton({
  matchId,
  matchTitle,
  isLive,
  size = "sm",
  variant = "outline",
  className = "",
}: InstantCampaignButtonProps) {
  // Generate dynamic title and description based on match status
  const notificationTitle = isLive 
    ? `⚽ ${matchTitle} - LIVE NOW!` 
    : `🔜 ${matchTitle} - Starting Soon!`
  
  const notificationBody = isLive
    ? `Don't miss the live action of ${matchTitle}. Watch now! ⚽🔥`
    : `${matchTitle} will start shortly. Get ready! ⏳`

  return (
    <CampaignDialog 
      matchId={matchId} 
      isInstant={true}
      initialData={{
        title: isLive ? `Live: ${matchTitle}` : `Upcoming: ${matchTitle}`,
        messageTitle: notificationTitle,
        messageBody: notificationBody,
        targetAudience: "all-users"
      }}
    >
      <Button
        size={size}
        variant={variant}
        className={`${className} hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700`}
      >
        <Bell className="h-4 w-4 mr-1" />
      </Button>
    </CampaignDialog>
  )
}