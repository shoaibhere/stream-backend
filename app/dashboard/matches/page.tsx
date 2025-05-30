"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Tv, Radio, Calendar, Clock, Link2 } from "lucide-react"
import Image from "next/image"
import MatchDialog from "@/components/match-dialog"
import DeleteMatchDialog from "@/components/delete-match-dialog"
import ToggleLiveStatus from "@/components/toggle-live-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [matchesRes, teamsRes] = await Promise.all([
        fetch('/api/matches'),
        fetch('/api/teams')
      ])
      
      if (!matchesRes.ok || !teamsRes.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const [matchesData, teamsData] = await Promise.all([
        matchesRes.json(),
        teamsRes.json()
      ])
      
      setMatches(matchesData)
      setTeams(teamsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch matches data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleMatchCreated = () => {
    fetchData()
    toast({
      title: "Success",
      description: "Match created successfully",
    })
  }

  const handleMatchDeleted = () => {
    fetchData()
    toast({
      title: "Success",
      description: "Match deleted successfully",
    })
  }

  const handleMatchUpdated = () => {
    fetchData()
    toast({
      title: "Success",
      description: "Match updated successfully",
    })
  }

  const handleLiveStatusChanged = () => {
    fetchData()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
      )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Live Matches Management</h1>
              <p className="text-gray-600">Manage football matches and streaming configurations</p>
            </div>
            <MatchDialog teams={teams} onSuccess={handleMatchCreated}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Match
              </Button>
            </MatchDialog>
          </div>

          {/* Matches Table */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Tv className="h-5 w-5 text-blue-600" />
                All Matches ({matches.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-blue-100/50 p-4 rounded-full mb-4">
                    <Tv className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
                  <p className="text-gray-500 text-center mb-6">Create your first match to start streaming</p>
                  <MatchDialog teams={teams} onSuccess={handleMatchCreated}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Match
                    </Button>
                  </MatchDialog>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Teams</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Details</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {matches.map((match) => {
                        const team1 = teams.find((t) => t._id === match.team1Id)
                        const team2 = teams.find((t) => t._id === match.team2Id)
                        const matchDate = match.date ? new Date(match.date) : null

                        return (
                          <tr key={match._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900">{match.title}</div>
                                <div className="md:hidden flex items-center gap-2 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    {team1?.crestUrl && (
                                      <div className="relative h-4 w-4">
                                        <Image
                                          src={team1.crestUrl || "/placeholder.svg"}
                                          alt={team1.name}
                                          fill
                                          className="object-contain"
                                        />
                                      </div>
                                    )}
                                    <span className="truncate max-w-[80px]">{team1?.name || "Unknown"}</span>
                                  </div>
                                  <span>vs</span>
                                  <div className="flex items-center gap-1">
                                    {team2?.crestUrl && (
                                      <div className="relative h-4 w-4">
                                        <Image
                                          src={team2.crestUrl || "/placeholder.svg"}
                                          alt={team2.name}
                                          fill
                                          className="object-contain"
                                        />
                                      </div>
                                    )}
                                    <span className="truncate max-w-[80px]">{team2?.name || "Unknown"}</span>
                                  </div>
                                </div>
                                {matchDate && (
                                  <div className="flex items-center text-xs text-gray-500 md:hidden">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {format(matchDate, 'MMM d, yyyy')}
                                    <Clock className="h-3 w-3 ml-2 mr-1" />
                                    {format(matchDate, 'h:mm a')}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
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
                                  <span className="font-medium text-gray-700 truncate max-w-[120px]">
                                    {team1?.name || "Unknown Team"}
                                  </span>
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
                                  <span className="font-medium text-gray-700 truncate max-w-[120px]">
                                    {team2?.name || "Unknown Team"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell">
                              <div className="space-y-2">
                                {matchDate && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    {format(matchDate, 'MMMM d, yyyy')} at {format(matchDate, 'h:mm a')}
                                  </div>
                                )}
                                {match.streamUrl && (
                                  <div className="flex items-center">
                                    <Link2 className="h-4 w-4 mr-2 text-gray-400" />
                                    <div 
                                      className="max-w-[200px] truncate text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded"
                                      title={match.streamUrl}
                                    >
                                      {match.streamUrl}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Badge
                                  variant={match.isLive ? "default" : "secondary"}
                                  className={`flex items-center ${match.isLive ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-700"}`}
                                >
                                  {match.isLive ? (
                                    <>
                                      <Radio className="h-3 w-3 mr-1.5 animate-pulse" />
                                      Live Now
                                    </>
                                  ) : (
                                    "Offline"
                                  )}
                                </Badge>
                                <ToggleLiveStatus match={match} onStatusChange={handleLiveStatusChanged} />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end gap-2">
                                <MatchDialog matchId={match._id} teams={teams} onSuccess={handleMatchUpdated}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-300 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </MatchDialog>
                                <DeleteMatchDialog matchId={match._id} matchTitle={match.title} onSuccess={handleMatchDeleted}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-300 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}