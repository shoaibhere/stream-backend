import DashboardLayout from "@/components/dashboard-layout"
import { getTeams } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Users } from "lucide-react"
import Image from "next/image"
import TeamDialog from "@/components/team-dialog"
import DeleteTeamDialog from "@/components/delete-team-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TeamsPage() {
  const teams = await getTeams()

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white w-full">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">Teams Management</h1>
              <p className="text-slate-600">Manage football teams and their club crests</p>
            </div>
            <TeamDialog>
              <Button className="admin-button-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Team
              </Button>
            </TeamDialog>
          </div>

          {/* Teams Table */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Users className="h-5 w-5" />
                All Teams ({teams.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {teams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No teams found</h3>
                  <p className="text-slate-500 text-center mb-6">Get started by adding your first football team</p>
                  <TeamDialog>
                    <Button className="admin-button-primary">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Team
                    </Button>
                  </TeamDialog>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">Team</th>
                        <th className="text-left py-4 px-6 font-medium text-slate-700">Club Crest</th>
                        <th className="text-right py-4 px-6 font-medium text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teams.map((team) => (
                        <tr key={team._id} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="py-4 px-6">
                            <div className="font-medium text-slate-800">{team.name}</div>
                          </td>
                          <td className="py-4 px-6">
                            {team.crestUrl ? (
                              <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                <Image
                                  src={team.crestUrl || "/placeholder.svg"}
                                  alt={team.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                <Users className="h-6 w-6 text-slate-400" />
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end gap-2">
                              <TeamDialog teamId={team._id}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </TeamDialog>
                              <DeleteTeamDialog teamId={team._id} teamName={team.name}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </DeleteTeamDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
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