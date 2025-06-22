"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Radio } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Team {
  _id: string
  name: string
  crestUrl?: string
}

interface Match {
  _id: string
  title: string
  team1Id: string
  team2Id: string
  isLive: boolean
  notificationsEnabled?: boolean
  createdAt: string
}

interface NotificationManagementDialogProps {
  teams: Team[]
}

export default function NotificationManagementDialog({ teams }: NotificationManagementDialogProps) {
  const [open, setOpen] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchMatches = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/matches")
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
        setFilteredMatches(data)
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error)
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchMatches()
    }
  }, [open])

  useEffect(() => {
    const filtered = matches.filter((match) => match.title.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredMatches(filtered)
  }, [searchQuery, matches])

  const toggleNotifications = async (matchId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/notifications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationsEnabled: enabled }),
      })

      if (response.ok) {
        setMatches((prev) =>
          prev.map((match) => (match._id === matchId ? { ...match, notificationsEnabled: enabled } : match)),
        )
        toast({
          title: "Success",
          description: `Notifications ${enabled ? "enabled" : "disabled"} for match`,
        })
      } else {
        throw new Error("Failed to update notifications")
      }
    } catch (error) {
      console.error("Failed to toggle notifications:", error)
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      })
    }
  }

  const getTeamName = (teamId: string) => {
    return teams.find((team) => team._id === teamId)?.name || "Unknown"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="dashboard-button-secondary">
          <Bell className="mr-2 h-4 w-4" />
          Manage Notifications
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Manage Match Notifications
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? "No matches found" : "No matches available"}
              </div>
            ) : (
              filteredMatches.map((match) => (
                <div
                  key={match._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{match.title}</h3>
                      <Badge
                        variant={match.isLive ? "default" : "secondary"}
                        className={match.isLive ? "bg-red-100 text-red-700 border-red-200" : ""}
                      >
                        {match.isLive ? (
                          <>
                            <Radio className="h-3 w-3 mr-1 animate-pulse" />
                            Live
                          </>
                        ) : (
                          "Offline"
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {getTeamName(match.team1Id)} vs {getTeamName(match.team2Id)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(match.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{match.notificationsEnabled ? "Enabled" : "Disabled"}</span>
                    <Switch
                      checked={match.notificationsEnabled || false}
                      onCheckedChange={(checked) => toggleNotifications(match._id, checked)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
