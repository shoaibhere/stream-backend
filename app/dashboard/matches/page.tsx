import DashboardLayout from "@/components/dashboard-layout"
import { getMatches, getTeams } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Tv, Radio } from "lucide-react"
import Image from "next/image"
import MatchDialog from "@/components/match-dialog"
import DeleteMatchDialog from "@/components/delete-match-dialog"
import ToggleLiveStatus from "@/components/toggle-live-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function MatchesPage() {
  const matches = await getMatches()
  const teams = await getTeams()

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Live Matches Management</h1>
            <p className="text-slate-600">Manage football matches and streaming configurations</p>
          </div>
          <MatchDialog teams={teams}>
            <Button className="admin-button-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Match
            </Button>
          </MatchDialog>
        </div>

        {/* Matches Table */}
        <Card className="admin-card">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Tv className="h-5 w-5" />
              All Matches ({matches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <Tv className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">No matches found</h3>
                <p className="text-slate-500 text-center mb-6">Create your first match to start streaming</p>
                <MatchDialog teams={teams}>
                  <Button className="admin-button-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Match
                  </Button>
                </MatchDialog>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-medium text-slate-700">Match</th>
                      <th className="text-left py-4 px-6 font-medium text-slate-700 hidden md:table-cell">Teams</th>
                      <th className="text-left py-4 px-6 font-medium text-slate-700 hidden lg:table-cell">
                        Stream URL
                      </th>
                      <th className="text-center py-4 px-6 font-medium text-slate-700">Status</th>
                      <th className="text-right py-4 px-6 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {matches.map((match) => {
                      const team1 = teams.find((t) => t._id === match.team1Id)
                      const team2 = teams.find((t) => t._id === match.team2Id)

                      return (
                        <tr key={match._id} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="font-medium text-slate-800">{match.title}</div>
                              <div className="md:hidden flex items-center gap-2 text-sm text-slate-500">
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
                                  <span>{team1?.name || "Unknown"}</span>
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
                                  <span>{team2?.name || "Unknown"}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {team1?.crestUrl && (
                                  <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-slate-200">
                                    <Image
                                      src={team1.crestUrl || "/placeholder.svg"}
                                      alt={team1.name}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                )}
                                <span className="font-medium text-slate-700">{team1?.name || "Unknown Team"}</span>
                              </div>
                              <span className="text-slate-400 font-medium">vs</span>
                              <div className="flex items-center gap-2">
                                {team2?.crestUrl && (
                                  <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-slate-200">
                                    <Image
                                      src={team2.crestUrl || "/placeholder.svg"}
                                      alt={team2.name}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                )}
                                <span className="font-medium text-slate-700">{team2?.name || "Unknown Team"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden lg:table-cell">
                            <div
                              className="max-w-[200px] truncate text-sm text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded"
                              title={match.streamUrl}
                            >
                              {match.streamUrl}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Badge
                                variant={match.isLive ? "default" : "secondary"}
                                className={match.isLive ? "bg-red-100 text-red-700 border-red-200" : ""}
                              >
                                {match.isLive ? (
                                  <>
                                    <Radio className="h-3 w-3 mr-1" />
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
                                  className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </MatchDialog>
                              <DeleteMatchDialog matchId={match._id} matchTitle={match.title}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
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
    </DashboardLayout>
  )
}
