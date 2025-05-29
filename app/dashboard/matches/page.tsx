import DashboardLayout from "@/components/dashboard-layout"
import { getMatches, getTeams } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import MatchDialog from "@/components/match-dialog"
import DeleteMatchDialog from "@/components/delete-match-dialog"
import ToggleLiveStatus from "@/components/toggle-live-status"

export default async function MatchesPage() {
  const matches = await getMatches()
  const teams = await getTeams()

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Live Matches Management</h1>
          <MatchDialog teams={teams}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Match
            </Button>
          </MatchDialog>
        </div>

        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Match Title</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Team 1</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Team 2</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stream URL</th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Live Status</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      No matches found. Add your first match.
                    </td>
                  </tr>
                ) : (
                  matches.map((match) => {
                    const team1 = teams.find((t) => t._id === match.team1Id)
                    const team2 = teams.find((t) => t._id === match.team2Id)

                    return (
                      <tr key={match._id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{match.title}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            {team1?.crestUrl && (
                              <div className="relative h-6 w-6">
                                <Image
                                  src={team1.crestUrl || "/placeholder.svg"}
                                  alt={team1.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <span>{team1?.name || "Unknown Team"}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            {team2?.crestUrl && (
                              <div className="relative h-6 w-6">
                                <Image
                                  src={team2.crestUrl || "/placeholder.svg"}
                                  alt={team2.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <span>{team2?.name || "Unknown Team"}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="max-w-[200px] truncate" title={match.streamUrl}>
                            {match.streamUrl}
                          </div>
                        </td>
                        <td className="p-4 align-middle text-center">
                          <ToggleLiveStatus match={match} />
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            <MatchDialog matchId={match._id} teams={teams}>
                              <Button size="sm" variant="outline">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </MatchDialog>
                            <DeleteMatchDialog matchId={match._id} matchTitle={match.title}>
                              <Button size="sm" variant="outline" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </DeleteMatchDialog>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
