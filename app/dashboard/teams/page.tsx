import DashboardLayout from "@/components/dashboard-layout"
import { getTeams } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import TeamDialog from "@/components/team-dialog"
import DeleteTeamDialog from "@/components/delete-team-dialog"

export default async function TeamsPage() {
  const teams = await getTeams()

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Teams Management</h1>
          <TeamDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </TeamDialog>
        </div>

        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Team</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Club Crest</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-muted-foreground">
                      No teams found. Add your first team.
                    </td>
                  </tr>
                ) : (
                  teams.map((team) => (
                    <tr key={team._id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">{team.name}</td>
                      <td className="p-4 align-middle">
                        {team.crestUrl ? (
                          <div className="relative h-10 w-10">
                            <Image
                              src={team.crestUrl || "/placeholder.svg"}
                              alt={team.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No crest</span>
                        )}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex justify-end gap-2">
                          <TeamDialog teamId={team._id}>
                            <Button size="sm" variant="outline">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </TeamDialog>
                          <DeleteTeamDialog teamId={team._id} teamName={team.name}>
                            <Button size="sm" variant="outline" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </DeleteTeamDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
