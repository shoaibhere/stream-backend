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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Settings } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ScreenAdConfig {
  _id?: string
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
}

interface ScreenAdConfigDialogProps {
  children: React.ReactNode
  adConfigId?: string
}

const SCREEN_TYPES = [
  { value: "home", label: "Home Screen" },
  { value: "leagues", label: "Leagues Screen" },
  { value: "create_match", label: "Quick Match" },
  { value: "setup_match", label: "Match Setup" },
  { value: "articles", label: "Articles" },
]

const AD_TYPES = [
  { value: "banner", label: "Banner Ad" },
  { value: "interstitial", label: "Interstitial Ad" },
  { value: "rewarded", label: "Rewarded Ad" },
  { value: "native", label: "Native Ad" },
]

const AD_POSITIONS = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "middle", label: "Middle" },
]

export default function AdConfigDialog({ children, adConfigId }: ScreenAdConfigDialogProps) {
  const [open, setOpen] = useState(false)
  const [screenType, setScreenType] = useState("")
  const [screenName, setScreenName] = useState("")
  const [adType, setAdType] = useState("banner")
  const [position, setPosition] = useState("bottom")
  const [adsEnabled, setAdsEnabled] = useState(false)
  const [useAdMob, setUseAdMob] = useState(false)
  const [useStartApp, setUseStartApp] = useState(false)
  const [adMobAppId, setAdMobAppId] = useState("")
  const [adMobBannerId, setAdMobBannerId] = useState("")
  const [adMobInterstitialId, setAdMobInterstitialId] = useState("")
  const [adMobRewardedId, setAdMobRewardedId] = useState("")
  const [startAppAppId, setStartAppAppId] = useState("")
  const [adFrequency, setAdFrequency] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Update screen name when screen type changes
  useEffect(() => {
    const selectedScreen = SCREEN_TYPES.find((screen) => screen.value === screenType)
    if (selectedScreen) {
      setScreenName(selectedScreen.label)
    }
  }, [screenType])

  // Fetch ad configuration data if editing
  useEffect(() => {
    if (adConfigId && open) {
      const fetchAdConfig = async () => {
        setIsLoadingConfig(true)
        try {
          const response = await fetch(`/api/ads/${adConfigId}`)
          if (response.ok) {
            const config = await response.json()
            setScreenType(config.screenType)
            setScreenName(config.screenName)
            setAdType(config.adType || "banner")
            setPosition(config.position || "bottom")
            setAdsEnabled(config.adsEnabled)
            setUseAdMob(config.useAdMob)
            setUseStartApp(config.useStartApp)
            setAdMobAppId(config.adMobAppId || "")
            setAdMobBannerId(config.adMobBannerId || "")
            setAdMobInterstitialId(config.adMobInterstitialId || "")
            setAdMobRewardedId(config.adMobRewardedId || "")
            setStartAppAppId(config.startAppAppId || "")
            setAdFrequency(config.adFrequency || 1)
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

    if (!screenType) {
      toast({
        title: "Error",
        description: "Please select a screen type",
        variant: "destructive",
      })
      return
    }

    if (adsEnabled && !useAdMob && !useStartApp) {
      toast({
        title: "Error",
        description: "Please select either AdMob or StartApp when ads are enabled",
        variant: "destructive",
      })
      return
    }

    if (adsEnabled && useAdMob && !adMobAppId) {
      toast({
        title: "Error",
        description: "AdMob App ID is required when AdMob is enabled",
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

    setIsLoading(true)

    try {
      const configData = {
        screenType,
        screenName,
        adType,
        position,
        adsEnabled,
        useAdMob: adsEnabled ? useAdMob : false,
        useStartApp: adsEnabled ? useStartApp : false,
        adMobAppId: adsEnabled && useAdMob ? adMobAppId : "",
        adMobBannerId: adsEnabled && useAdMob ? adMobBannerId : "",
        adMobInterstitialId: adsEnabled && useAdMob ? adMobInterstitialId : "",
        adMobRewardedId: adsEnabled && useAdMob ? adMobRewardedId : "",
        startAppAppId: adsEnabled && useStartApp ? startAppAppId : "",
        adFrequency: adsEnabled ? adFrequency : 1,
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
          description: adConfigId
            ? `Ad configuration for ${screenName} has been updated`
            : `Ad configuration for ${screenName} has been created`,
        })
        setOpen(false)
        router.refresh()
        window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "ad" } }))
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
    setScreenType("")
    setScreenName("")
    setAdType("banner")
    setPosition("bottom")
    setAdsEnabled(false)
    setUseAdMob(false)
    setUseStartApp(false)
    setAdMobAppId("")
    setAdMobBannerId("")
    setAdMobInterstitialId("")
    setAdMobRewardedId("")
    setStartAppAppId("")
    setAdFrequency(1)
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
      <DialogContent className="sm:max-w-[700px] w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {adConfigId ? "Edit Screen Ad Configuration" : "Add Screen Ad Configuration"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Configure ads for specific screens in your streaming app
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
                {/* Screen Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="screenType" className="text-sm font-medium text-gray-700">
                      Screen Type
                    </Label>
                    <Select value={screenType} onValueChange={setScreenType} required disabled={!!adConfigId}>
                      <SelectTrigger id="screenType" className="dashboard-input">
                        <SelectValue placeholder="Select screen" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCREEN_TYPES.map((screen) => (
                          <SelectItem key={screen.value} value={screen.value}>
                            {screen.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adType" className="text-sm font-medium text-gray-700">
                      Ad Type
                    </Label>
                    <Select value={adType} onValueChange={setAdType} required>
                      <SelectTrigger id="adType" className="dashboard-input">
                        <SelectValue placeholder="Select ad type" />
                      </SelectTrigger>
                      <SelectContent>
                        {AD_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Position Selection (only for banner and native ads) */}
                {(adType === "banner" || adType === "native") && (
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                      Ad Position
                    </Label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger id="position" className="dashboard-input">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {AD_POSITIONS.map((pos) => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Ads Enabled Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-1">
                    <Label htmlFor="adsEnabled" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Ads Enabled for {screenName || "Selected Screen"}
                    </Label>
                    <p className="text-xs text-gray-500">Enable or disable ads on this screen</p>
                  </div>
                  <Switch id="adsEnabled" checked={adsEnabled} onCheckedChange={setAdsEnabled} />
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

                      {adType === "banner" && (
                        <div className="space-y-2">
                          <Label htmlFor="adMobBannerId" className="text-sm font-medium text-gray-700">
                            AdMob Banner ID
                          </Label>
                          <Input
                            id="adMobBannerId"
                            value={adMobBannerId}
                            onChange={(e) => setAdMobBannerId(e.target.value)}
                            placeholder="ca-app-pub-3940256099942544/6300978111"
                            className="dashboard-input"
                          />
                        </div>
                      )}

                      {adType === "interstitial" && (
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
                          />
                        </div>
                      )}

                      {adType === "rewarded" && (
                        <div className="space-y-2">
                          <Label htmlFor="adMobRewardedId" className="text-sm font-medium text-gray-700">
                            AdMob Rewarded ID
                          </Label>
                          <Input
                            id="adMobRewardedId"
                            value={adMobRewardedId}
                            onChange={(e) => setAdMobRewardedId(e.target.value)}
                            placeholder="ca-app-pub-3940256099942544/5224354917"
                            className="dashboard-input"
                          />
                        </div>
                      )}
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
                {adsEnabled && (adType === "interstitial" || adType === "rewarded") && (
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
                      onChange={(e) => setAdFrequency(Number.parseInt(e.target.value) || 1)}
                      placeholder="1"
                      className="dashboard-input"
                      required={adsEnabled}
                    />
                    <p className="text-xs text-gray-500">
                      {adType === "interstitial"
                        ? "Show interstitial ad every N screen visits"
                        : "Show rewarded ad option every N actions"}
                    </p>
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
