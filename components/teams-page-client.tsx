"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Users, Search } from "lucide-react"
import Image from "next/image"
import TeamDialog from "@/components/team-dialog"
import DeleteTeamDialog from "@/components/delete-team-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Team {
  _id: string
  name: string
  crestUrl?: string
  createdAt: string
}
export default function TeamsPageClient() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true)

    const fetchAllData = async () => {
    try {
      setIsLoading(true)
      const [teamsRes] = await Promise.all([
        fetch("/api/teams"),
      ])

      if (teamsRes.ok ) {
        const [teamsData] = await Promise.all([
          teamsRes.json(),
        ])
        setTeams(teamsData)
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
      if (event.detail.type === "team") {
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
          <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
          <p className="text-gray-600">Manage football teams and their club crests</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <TeamDialog>
            <Button className="dashboard-button-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </TeamDialog>
        </div>
      </div>

      {/* Teams Content */}
      {teams.length === 0 ? (
        <Card className="dashboard-card">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-500 text-center mb-8 max-w-md">
              Get started by adding your first football team to begin managing matches and streams
            </p>
            <TeamDialog>
              <Button className="dashboard-button-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Team
              </Button>
            </TeamDialog>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Card className="dashboard-card">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <Users className="h-5 w-5" />
                  All Teams ({teams.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Team</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Club Crest</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Created</th>
                        <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {teams.map((team) => (
                        <tr key={team._id} className="dashboard-table-row">
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-900">{team.name}</div>
                          </td>
                          <td className="py-4 px-6">
                            {team.crestUrl ? (
                              <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                <Image
                                  src={team.crestUrl || "/placeholder.svg"}
                                  alt={team.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                                <Users className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-500">
                              {new Date(team.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end gap-2">
                              <TeamDialog teamId={team._id}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TeamDialog>
                              <DeleteTeamDialog teamId={team._id} teamName={team.name}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DeleteTeamDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

// Update the mobile cards section
<div className="lg:hidden space-y-4">
  {teams.map((team) => (
    <Card key={team._id} className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {team.crestUrl ? (
            <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <Image
                src={team.crestUrl || "/placeholder.svg"}
                alt={team.name}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{team.name}</h3>
            <p className="text-sm text-gray-500">
              Created {new Date(team.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <TeamDialog teamId={team._id}>
            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </TeamDialog>
          <DeleteTeamDialog teamId={team._id} teamName={team.name}>
            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DeleteTeamDialog>
        </div>
      </div>
    </Card>
  ))}
</div>
        </>
      )}
    </div>
  )
}
