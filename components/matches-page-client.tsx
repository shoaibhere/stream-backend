"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Tv, Radio } from "lucide-react"
import Image from "next/image"
import MatchDialog from "@/components/match-dialog"
import DeleteMatchDialog from "@/components/delete-match-dialog"
import ToggleLiveStatus from "@/components/toggle-live-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Team {
  _id: string
  name: string
  crestUrl?: string
}

interface Channel {
  _id: string
  name: string
  m3u8Url: string
  headers?: Array<{ name: string; value: string }>
}

interface Match {
  _id: string
  title: string
  team1Id: string
  team2Id: string
  channelIds: string[]
  isLive: boolean
  createdAt: string
}

export default function MatchesPageClient() {
  const [matches, setMatches] = useState<Match[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAllData = async () => {
    try {
      setIsLoading(true)
      const [matchesRes, teamsRes, channelsRes] = await Promise.all([
        fetch("/api/matches"),
        fetch("/api/teams"),
        fetch("/api/channels")
      ])

      if (matchesRes.ok && teamsRes.ok && channelsRes.ok) {
        const [matchesData, teamsData, channelsData] = await Promise.all([
          matchesRes.json(),
          teamsRes.json(),
          channelsRes.json()
        ])
        setMatches(matchesData)
        setTeams(teamsData)
        setChannels(channelsData)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()

    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail.type === "match" || 
          event.detail.type === "team" || 
          event.detail.type === "channel") {
        fetchAllData()
      }
    }

    window.addEventListener("dataUpdated", handleDataUpdate as EventListener)
    return () => window.removeEventListener("dataUpdated", handleDataUpdate as EventListener)
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Live Matches</h1>
          <p className="text-gray-600">Manage football matches and streaming configurations</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <MatchDialog teams={teams}>
            <Button className="dashboard-button-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Match
            </Button>
          </MatchDialog>
        </div>
      </div>

      {/* Matches Content */}
      {matches.length === 0 ? (
        <Card className="dashboard-card">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <Tv className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-500 text-center mb-8 max-w-md">
              Create your first match to start streaming football games to your audience
            </p>
            <MatchDialog teams={teams}>
              <Button className="dashboard-button-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Match
              </Button>
            </MatchDialog>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Card className="dashboard-card">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <Tv className="h-5 w-5" />
                  All Matches ({matches.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Match</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Teams</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Channels</th>
                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                        <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {matches.map((match) => {
                        const team1 = teams.find((t) => t._id === match.team1Id)
                        const team2 = teams.find((t) => t._id === match.team2Id)
                        const matchChannels = channels.filter((c) => match.channelIds?.includes(c._id))

                        return (
                          <tr key={match._id} className="dashboard-table-row">
                            <td className="py-4 px-6">
                              <div className="font-semibold text-gray-900">{match.title}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(match.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  {team1?.crestUrl && (
                                    <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-gray-200">
                                      <Image
                                        src={team1.crestUrl || "/placeholder.svg"}
                                        alt={team1.name}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                  )}
                                  <span className="font-medium text-gray-700">{team1?.name || "Unknown"}</span>
                                </div>
                                <span className="text-gray-400 font-medium">vs</span>
                                <div className="flex items-center gap-2">
                                  {team2?.crestUrl && (
                                    <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-gray-200">
                                      <Image
                                        src={team2.crestUrl || "/placeholder.svg"}
                                        alt={team2.name}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                  )}
                                  <span className="font-medium text-gray-700">{team2?.name || "Unknown"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-wrap gap-1">
                                {matchChannels.length > 0 ? (
                                  matchChannels.slice(0, 2).map((channel) => (
                                    <Badge key={channel._id} variant="secondary" className="text-xs">
                                      {channel.name}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-400">No channels</span>
                                )}
                                {matchChannels.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{matchChannels.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex flex-col items-center gap-3">
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
                                <ToggleLiveStatus match={match} />
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-end gap-2">
                                <MatchDialog matchId={match._id} teams={teams}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </MatchDialog>
                                <DeleteMatchDialog matchId={match._id} matchTitle={match.title}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DeleteMatchDialog>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          // Update the mobile cards section
<div className="lg:hidden space-y-4">
  {matches.map((match) => {
    const team1 = teams.find((t) => t._id === match.team1Id)
    const team2 = teams.find((t) => t._id === match.team2Id)
    const matchChannels = channels.filter((c) => match.channelIds?.includes(c._id))

    return (
      <Card key={match._id} className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 text-lg">{match.title}</h3>
            <p className="text-sm text-gray-500">
              {new Date(match.createdAt).toLocaleDateString()}
            </p>
          </div>
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

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {team1?.crestUrl && (
                <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={team1.crestUrl || "/placeholder.svg"}
                    alt={team1.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <span className="font-medium text-gray-700">{team1?.name || "Unknown"}</span>
            </div>
            <span className="text-gray-400 font-medium">vs</span>
            <div className="flex items-center gap-2">
              {team2?.crestUrl && (
                <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={team2.crestUrl || "/placeholder.svg"}
                    alt={team2.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <span className="font-medium text-gray-700">{team2?.name || "Unknown"}</span>
            </div>
          </div>
        </div>

        {matchChannels.length > 0 && (
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Channels
            </label>
            <div className="flex flex-wrap gap-1 mt-1">
              {matchChannels.map((channel) => (
                <Badge key={channel._id} variant="secondary" className="text-xs">
                  {channel.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide m-0">
            Live/Offline
          </label>
          <ToggleLiveStatus match={match} />
          <div className="flex gap-2">
            <MatchDialog matchId={match._id} teams={teams}>
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </MatchDialog>
            <DeleteMatchDialog matchId={match._id} matchTitle={match.title}>
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DeleteMatchDialog>
          </div>
        </div>
      </Card>
    )
  })}
</div>
        </>
      )}
    </div>
  )
}
