"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SendNotificationButtonProps {
  matchId: string
  size?: "sm" | "default"
  variant?: "default" | "outline" | "secondary"
  className?: string
}

export default function SendNotificationButton({
  matchId,
  size = "sm",
  variant = "outline",
  className = "",
}: SendNotificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const sendNotification = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/send-ad-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matchId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notification sent successfully!",
        })
      } else {
        throw new Error(data.error || "Failed to send notification")
      }
    } catch (error) {
      console.error("Failed to send notification:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={sendNotification}
      disabled={isLoading}
      className={`${className} hover:bg-green-50 hover:border-green-200 hover:text-green-700`}
    >
      <Send className="h-4 w-4" />
      {isLoading ? "Sending..." : "Send Notification"}
    </Button>
  )
}
