"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Settings } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"

interface AdConfig {
  _id?: string
  adsEnabled: boolean
  useAdMob: boolean
  useStartApp: boolean
  adMobAppId: string
  adMobInterstitialId: string
  startAppAppId: string
  adFrequency: number
}

interface AdConfigDialogProps {
  children: React.ReactNode
  adConfigId?: string
}

export default function AdConfigDialog({ children, adConfigId }: AdConfigDialogProps) {
  const [open, setOpen] = useState(false)
  const [adsEnabled, setAdsEnabled] = useState(false)
  const [useAdMob, setUseAdMob] = useState(false)
  const [useStartApp, setUseStartApp] = useState(false)
  const [adMobAppId, setAdMobAppId] = useState("")
  const [adMobInterstitialId, setAdMobInterstitialId] = useState("")
  const [startAppAppId, setStartAppAppId] = useState("")
  const [adFrequency, setAdFrequency] = useState(3)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch ad configuration data if editing
  useEffect(() => {
    if (adConfigId && open) {
      const fetchAdConfig = async () => {
        setIsLoadingConfig(true)
        try {
          const response = await fetch(`/api/ads/${adConfigId}`)
          if (response.ok) {
            const config = await response.json()
            setAdsEnabled(config.adsEnabled)
            setUseAdMob(config.useAdMob)
            setUseStartApp(config.useStartApp)
            setAdMobAppId(config.adMobAppId || "")
            setAdMobInterstitialId(config.adMobInterstitialId || "")
            setStartAppAppId(config.startAppAppId || "")
            setAdFrequency(config.adFrequency || 3)
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load ad configuration data",
            variant: "destructive",
          })
        } finally {
          setIsLoadingConfig(false)
        }
      }

      fetchAdConfig()
    }
  }, [adConfigId, open, toast])

  const handleAdMobToggle = (checked: boolean) => {
    if (checked) {
      setUseAdMob(true)
      setUseStartApp(false)
    } else {
      setUseAdMob(false)
    }
  }

  const handleStartAppToggle = (checked: boolean) => {
    if (checked) {
      setUseStartApp(true)
      setUseAdMob(false)
    } else {
      setUseStartApp(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (adsEnabled && !useAdMob && !useStartApp) {
      toast({
        title: "Error",
        description: "Please select either AdMob or StartApp when ads are enabled",
        variant: "destructive",
      })
      return
    }

    if (adsEnabled && useAdMob && (!adMobAppId || !adMobInterstitialId)) {
      toast({
        title: "Error",
        description: "AdMob App ID and Interstitial ID are required when AdMob is enabled",
        variant: "destructive",
      })
      return
    }

    if (adsEnabled && useStartApp && !startAppAppId) {
      toast({
        title: "Error",
        description: "StartApp App ID is required when StartApp is enabled",
        variant: "destructive",
      })
      return
    }

    if (adsEnabled && adFrequency < 1) {
      toast({
        title: "Error",
        description: "Ad frequency must be at least 1",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const configData = {
        adsEnabled,
        useAdMob: adsEnabled ? useAdMob : false,
        useStartApp: adsEnabled ? useStartApp : false,
        adMobAppId: adsEnabled && useAdMob ? adMobAppId : "",
        adMobInterstitialId: adsEnabled && useAdMob ? adMobInterstitialId : "",
        startAppAppId: adsEnabled && useStartApp ? startAppAppId : "",
        adFrequency: adsEnabled ? adFrequency : 3,
      }

      const url = adConfigId ? `/api/ads/${adConfigId}` : "/api/ads"
      const method = adConfigId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configData),
      })

      if (response.ok) {
        toast({
          title: adConfigId ? "Configuration updated" : "Configuration created",
          description: adConfigId ? "Ad configuration has been updated successfully" : "New ad configuration has been created",
        })
        setOpen(false)
        router.refresh()
        // Trigger a custom event to refresh data across components
        window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'ad' } }))
      } else {
        const error = await response.json()
        throw new Error(error.message || "Something went wrong")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save ad configuration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setAdsEnabled(false)
    setUseAdMob(false)
    setUseStartApp(false)
    setAdMobAppId("")
    setAdMobInterstitialId("")
    setStartAppAppId("")
    setAdFrequency(3)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {adConfigId ? "Edit Ad Configuration" : "Add New Ad Configuration"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {adConfigId ? "Update ad configuration settings below" : "Configure ad settings for your streaming app"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingConfig ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="dashboard-card">
              <CardContent className="space-y-6 p-6">
                {/* Ads Enabled Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-1">
                    <Label htmlFor="adsEnabled" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Ads Enabled
                    </Label>
                    <p className="text-xs text-gray-500">Enable or disable ads in your streaming app</p>
                  </div>
                  <Switch
                    id="adsEnabled"
                    checked={adsEnabled}
                    onCheckedChange={setAdsEnabled}
                  />
                </div>

                {/* Ad Provider Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Ad Provider</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="space-y-1">
                        <Label htmlFor="useAdMob" className="text-sm font-medium text-gray-700">
                          Use AdMob
                        </Label>
                        <p className="text-xs text-gray-500">Google AdMob integration</p>
                      </div>
                      <Switch
                        id="useAdMob"
                        checked={useAdMob}
                        onCheckedChange={handleAdMobToggle}
                        disabled={!adsEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="space-y-1">
                        <Label htmlFor="useStartApp" className="text-sm font-medium text-gray-700">
                          Use StartApp
                        </Label>
                        <p className="text-xs text-gray-500">StartApp ad network</p>
                      </div>
                      <Switch
                        id="useStartApp"
                        checked={useStartApp}
                        onCheckedChange={handleStartAppToggle}
                        disabled={!adsEnabled}
                      />
                    </div>
                  </div>
                </div>

                {/* AdMob Configuration */}
                {adsEnabled && useAdMob && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-sm font-medium text-blue-700">AdMob Configuration</Label>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="adMobAppId" className="text-sm font-medium text-gray-700">
                          AdMob App ID
                        </Label>
                        <Input
                          id="adMobAppId"
                          value={adMobAppId}
                          onChange={(e) => setAdMobAppId(e.target.value)}
                          placeholder="ca-app-pub-3940256099942544~3347511713"
                          className="dashboard-input"
                          required={adsEnabled && useAdMob}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="adMobInterstitialId" className="text-sm font-medium text-gray-700">
                          AdMob Interstitial ID
                        </Label>
                        <Input
                          id="adMobInterstitialId"
                          value={adMobInterstitialId}
                          onChange={(e) => setAdMobInterstitialId(e.target.value)}
                          placeholder="ca-app-pub-3940256099942544/1033173712"
                          className="dashboard-input"
                          required={adsEnabled && useAdMob}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* StartApp Configuration */}
                {adsEnabled && useStartApp && (
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Label className="text-sm font-medium text-green-700">StartApp Configuration</Label>
                    
                    <div className="space-y-2">
                      <Label htmlFor="startAppAppId" className="text-sm font-medium text-gray-700">
                        StartApp App ID
                      </Label>
                      <Input
                        id="startAppAppId"
                        value={startAppAppId}
                        onChange={(e) => setStartAppAppId(e.target.value)}
                        placeholder="your-startapp-id"
                        className="dashboard-input"
                        required={adsEnabled && useStartApp}
                      />
                    </div>
                  </div>
                )}

                {/* Ad Frequency */}
                {adsEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="adFrequency" className="text-sm font-medium text-gray-700">
                      Ad Frequency
                    </Label>
                    <Input
                      id="adFrequency"
                      type="number"
                      min="1"
                      max="100"
                      value={adFrequency}
                      onChange={(e) => setAdFrequency(parseInt(e.target.value) || 1)}
                      placeholder="3"
                      className="dashboard-input"
                      required={adsEnabled}
                    />
                    <p className="text-xs text-gray-500">Show ads every N matches/videos</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <DialogFooter className="gap-3 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="dashboard-button-secondary"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="dashboard-button-primary">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {adConfigId ? "Update Configuration" : "Save Configuration"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
