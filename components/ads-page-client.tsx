"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Settings, Monitor } from "lucide-react"
import ScreenAdConfigDialog from "@/components/ad-config-dialog"
import DeleteAdDialog from "@/components/delete-ad-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ScreenAdConfig {
  _id: string
  screenType: string
  screenName: string
  adType: string
  position: string
  adsEnabled: boolean
  useAdMob: boolean
  useStartApp: boolean
  adMobAppId: string
  adMobBannerId: string
  adMobInterstitialId: string
  adMobRewardedId: string
  startAppAppId: string
  adFrequency: number
  createdAt: string
  updatedAt: string
}

export default function AdsPageClient() {
  const [adConfigs, setAdConfigs] = useState<ScreenAdConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

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

  const getAdTypeIcon = (adType: string) => {
    switch (adType) {
      case "banner":
        return "📱"
      case "interstitial":
        return "🖼️"
      case "rewarded":
        return "🎁"
      case "native":
        return "📄"
      default:
        return "📱"
    }
  }

  const getScreenIcon = (screenType: string) => {
    switch (screenType) {
      case "home":
        return "🏠"
      case "matches":
        return "⚽"
      case "player":
        return "▶️"
      case "teams":
        return "👥"
      case "channels":
        return "📺"
      case "settings":
        return "⚙️"
      default:
        return "📱"
    }
  }

  const filteredConfigs =
    activeTab === "all"
      ? adConfigs
      : adConfigs.filter((config) => {
          if (activeTab === "enabled") return config.adsEnabled
          if (activeTab === "disabled") return !config.adsEnabled
        })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Screen Ad Configurations</h1>
          <p className="text-gray-600">Manage advertisements for different screens in your streaming app</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ScreenAdConfigDialog>
            <Button className="dashboard-button-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Screen Configuration
            </Button>
          </ScreenAdConfigDialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({adConfigs.length})</TabsTrigger>
          <TabsTrigger value="enabled">Enabled ({adConfigs.filter((c) => c.adsEnabled).length})</TabsTrigger>
          <TabsTrigger value="disabled">Disabled ({adConfigs.filter((c) => !c.adsEnabled).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {filteredConfigs.length === 0 ? (
            <Card className="dashboard-card">
              <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <Monitor className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {activeTab === "all" ? "No screen configurations yet" : `No ${activeTab} configurations`}
                </h3>
                <p className="text-gray-500 text-center mb-8 max-w-md">
                  Create screen-specific ad configurations to monetize different parts of your app
                </p>
                <ScreenAdConfigDialog>
                  <Button className="dashboard-button-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Configuration
                  </Button>
                </ScreenAdConfigDialog>
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
                      Screen Configurations ({filteredConfigs.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Screen</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Ad Type</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Position</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Provider</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Frequency</th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredConfigs.map((config) => (
                            <tr key={config._id} className="dashboard-table-row">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{getScreenIcon(config.screenType)}</span>
                                  <div>
                                    <div className="font-semibold text-gray-900">{config.screenName}</div>
                                    <div className="text-sm text-gray-500">{config.screenType}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <span>{getAdTypeIcon(config.adType)}</span>
                                  <span className="capitalize text-gray-700">{config.adType}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="capitalize text-gray-700">{config.position}</span>
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
                                  {config.adsEnabled &&
                                  (config.adType === "interstitial" || config.adType === "rewarded")
                                    ? `Every ${config.adFrequency}`
                                    : "N/A"}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex justify-end gap-2">
                                  <ScreenAdConfigDialog adConfigId={config._id}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </ScreenAdConfigDialog>
                                  <DeleteAdDialog adConfigId={config._id} adConfigName={config.screenName}>
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
                {filteredConfigs.map((config) => (
                  <Card key={config._id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getScreenIcon(config.screenType)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{config.screenName}</h3>
                          <p className="text-sm text-gray-500">{config.screenType}</p>
                        </div>
                      </div>
                      <Badge
                        variant={config.adsEnabled ? "default" : "secondary"}
                        className={config.adsEnabled ? "bg-green-100 text-green-700 border-green-200" : ""}
                      >
                        {config.adsEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Ad Type:</span>
                        <div className="flex items-center gap-2">
                          <span>{getAdTypeIcon(config.adType)}</span>
                          <span className="capitalize text-gray-700">{config.adType}</span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Position:</span>
                        <span className="capitalize text-gray-700">{config.position}</span>
                      </div>

                      {config.adsEnabled && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Provider:</span>
                            <div className="flex gap-2">
                              {config.useAdMob && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                  AdMob
                                </Badge>
                              )}
                              {config.useStartApp && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 text-xs"
                                >
                                  StartApp
                                </Badge>
                              )}
                            </div>
                          </div>

                          {(config.adType === "interstitial" || config.adType === "rewarded") && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Frequency:</span>
                              <span className="text-sm text-gray-700">Every {config.adFrequency}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <ScreenAdConfigDialog adConfigId={config._id}>
                        <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </ScreenAdConfigDialog>
                      <DeleteAdDialog adConfigId={config._id} adConfigName={config.screenName}>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
