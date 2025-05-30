"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface Match {
  _id: string
  isLive: boolean
  title: string
}

interface ToggleLiveStatusProps {
  match: Match
  onStatusChange: () => void
}

export default function ToggleLiveStatus({ match, onStatusChange }: ToggleLiveStatusProps) {
  const [isLive, setIsLive] = useState(match.isLive)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const toggleLiveStatus = async () => {
    setIsLoading(true)

    try {
      const newStatus = !isLive

      const response = await fetch(`/api/matches/${match._id}/toggle-live`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isLive: newStatus }),
      })

      if (response.ok) {
        setIsLive(newStatus)
        toast({
          title: `Match ${newStatus ? "is now live" : "is no longer live"}`,
          description: `${match.title} has been ${newStatus ? "set to live" : "set to not live"}`,
        })

        onStatusChange?.() // ✅ invoke the callback here
        router.refresh()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to update live status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update live status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <Switch
      checked={isLive}
      onCheckedChange={toggleLiveStatus}
      disabled={isLoading}
      aria-label="Toggle live status"
      className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-slate-200"
    />
  )
}
