import DashboardLayout from "@/components/dashboard-layout"
import { getChannels } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Radio, Search, Filter } from 'lucide-react'
import ChannelDialog from "@/components/channel-dialog"
import DeleteChannelDialog from "@/components/delete-channel-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default async function ChannelsPage() {
  const channels = await getChannels()

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">Channels Management</h1>
            <p className="text-gray-600">Manage streaming channels and their configurations</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ChannelDialog>
              <Button className="dashboard-button-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Channel
              </Button>
            </ChannelDialog>
          </div>
        </div>

        {/* Channels Content */}
        {channels.length === 0 ? (
          <Card className="dashboard-card">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <Radio className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No channels yet</h3>
              <p className="text-gray-500 text-center mb-8 max-w-md">
                Create your first streaming channel to start broadcasting football matches
              </p>
              <ChannelDialog>
                <Button className="dashboard-button-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Channel
                </Button>
              </ChannelDialog>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Card className="dashboard-card">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Radio className="h-5 w-5" />
                    All Channels ({channels.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Channel Name</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Stream URL</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Headers</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Created</th>
                          <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {channels.map((channel) => (
                          <tr key={channel._id} className="dashboard-table-row">
                            <td className="py-4 px-6">
                              <div className="font-semibold text-gray-900">{channel.name}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div
                                className="max-w-[200px] truncate text-sm text-gray-600 font-mono bg-gray-50 px-3 py-1 rounded-lg"
                                title={channel.m3u8Url}
                              >
                                {channel.m3u8Url}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-wrap gap-1">
                                {channel.headers && channel.headers.length > 0 ? (
                                  channel.headers.slice(0, 2).map((header: any, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {header.name}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-400">No headers</span>
                                )}
                                {channel.headers && channel.headers.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{channel.headers.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm text-gray-500">
                                {new Date(channel.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-end gap-2">
                                <ChannelDialog channelId={channel._id}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </ChannelDialog>
                                <DeleteChannelDialog channelId={channel._id} channelName={channel.name}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DeleteChannelDialog>
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

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {channels.map((channel) => (
                <Card key={channel._id} className="mobile-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                      <p className="text-sm text-gray-500">Created {new Date(channel.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <ChannelDialog channelId={channel._id}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </ChannelDialog>
                      <DeleteChannelDialog channelId={channel._id} channelName={channel.name}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DeleteChannelDialog>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stream URL</label>
                      <div className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded mt-1 truncate">
                        {channel.m3u8Url}
                      </div>
                    </div>

                    {channel.headers && channel.headers.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Headers</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {channel.headers.map((header: any, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {header.name}: {header.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
