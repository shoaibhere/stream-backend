"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Settings, Smartphone } from "lucide-react"
import AdConfigDialog from "@/components/ad-config-dialog"
import DeleteAdDialog from "@/components/delete-ad-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AdConfig {
  _id: string
  adsEnabled: boolean
  useAdMob: boolean
  useStartApp: boolean
  adMobAppId: string
  adMobInterstitialId: string
  startAppAppId: string
  adFrequency: number
  createdAt: string
  updatedAt: string
}

export default function AdsPageClient() {
  const [adConfigs, setAdConfigs] = useState<AdConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAdConfigs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/ads")
      if (response.ok) {
        const data = await response.json()
        setAdConfigs(data)
      }
    } catch (error) {
      console.error("Failed to fetch ad configurations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdConfigs()

    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail.type === "ad") {
        fetchAdConfigs()
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

  const getConfigName = (config: AdConfig) => {
    if (!config.adsEnabled) return "Ads Disabled"
    if (config.useAdMob) return "AdMob Configuration"
    if (config.useStartApp) return "StartApp Configuration"
    return "Ad Configuration"
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Ad Configurations</h1>
          <p className="text-gray-600">Manage advertisement settings for your streaming app</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdConfigDialog>
            <Button className="dashboard-button-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Configuration
            </Button>
          </AdConfigDialog>
        </div>
      </div>

      {/* Ad Configurations Content */}
      {adConfigs.length === 0 ? (
        <Card className="dashboard-card">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <Smartphone className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No ad configurations yet</h3>
            <p className="text-gray-500 text-center mb-8 max-w-md">
              Create your first ad configuration to start monetizing your streaming app
            </p>
            <AdConfigDialog>
              <Button className="dashboard-button-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Configuration
              </Button>
            </AdConfigDialog>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Card className="dashboard-card">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <Settings className="h-5 w-5" />
                  All Configurations ({adConfigs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Configuration</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Provider</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Frequency</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Created</th>
                        <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {adConfigs.map((config) => (
                        <tr key={config._id} className="dashboard-table-row">
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-900">{getConfigName(config)}</div>
                            <div className="text-sm text-gray-500 font-mono">
                              {config.useAdMob && config.adMobAppId && `${config.adMobAppId.substring(0, 20)}...`}
                              {config.useStartApp && config.startAppAppId && config.startAppAppId}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              variant={config.adsEnabled ? "default" : "secondary"}
                              className={config.adsEnabled ? "bg-green-100 text-green-700 border-green-200" : ""}
                            >
                              {config.adsEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            {config.adsEnabled ? (
                              <div className="flex gap-2">
                                {config.useAdMob && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    AdMob
                                  </Badge>
                                )}
                                {config.useStartApp && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    StartApp
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-700">
                              {config.adsEnabled ? `Every ${config.adFrequency}` : "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-500">
                              {new Date(config.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end gap-2">
                              <AdConfigDialog adConfigId={config._id}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </AdConfigDialog>
                              <DeleteAdDialog adConfigId={config._id} adConfigName={getConfigName(config)}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DeleteAdDialog>
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
            {adConfigs.map((config) => (
              <Card key={config._id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{getConfigName(config)}</h3>
                    <p className="text-sm text-gray-500">{new Date(config.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge
                    variant={config.adsEnabled ? "default" : "secondary"}
                    className={config.adsEnabled ? "bg-green-100 text-green-700 border-green-200" : ""}
                  >
                    {config.adsEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                {config.adsEnabled && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Provider</label>
                      <div className="flex gap-2 mt-1">
                        {config.useAdMob && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            AdMob
                          </Badge>
                        )}
                        {config.useStartApp && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            StartApp
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Frequency</label>
                      <p className="text-sm text-gray-700 mt-1">Every {config.adFrequency}</p>
                    </div>

                    {(config.adMobAppId || config.startAppAppId) && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">App ID</label>
                        <p className="text-sm text-gray-700 font-mono mt-1">
                          {config.useAdMob && config.adMobAppId && `${config.adMobAppId.substring(0, 30)}...`}
                          {config.useStartApp && config.startAppAppId && config.startAppAppId}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <AdConfigDialog adConfigId={config._id}>
                    <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </AdConfigDialog>
                  <DeleteAdDialog adConfigId={config._id} adConfigName={getConfigName(config)}>
                    <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DeleteAdDialog>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
