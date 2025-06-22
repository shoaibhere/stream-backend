"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type CampaignFormData = {
  title: string
  messageTitle: string
  messageBody: string
  targetAudience: "all-users" | "live-matches" | "custom"
  customTopic: string
}

interface CampaignDialogProps {
  children: React.ReactNode
  campaignId?: string
  matchId?: string
  isInstant?: boolean
  initialData?: {
    title: string
    messageTitle: string
    messageBody: string
    targetAudience: "all-users" | "live-matches" | "custom"
  }
}

export default function CampaignDialog({
  children,
  campaignId,
  matchId,
  isInstant = true,
  initialData
}: CampaignDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CampaignFormData>({
    title: initialData?.title || "",
    messageTitle: initialData?.messageTitle || "",
    messageBody: initialData?.messageBody || "",
    targetAudience: initialData?.targetAudience || "all-users",
    customTopic: "",
  })

  const { toast } = useToast()

  const fetchCampaign = async () => {
    if (!campaignId) return
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`)
      if (response.ok) {
        const campaign = await response.json()
        setFormData({
          title: campaign.title || "",
          messageTitle: campaign.message?.title || "",
          messageBody: campaign.message?.body || "",
          targetAudience: campaign.targetAudience || "all-users",
          customTopic: campaign.customTopic || "",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch campaign",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch campaign",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (open && campaignId) {
      fetchCampaign()
    } else if (open && !campaignId && !initialData) {
      setFormData({
        title: matchId ? "Live Match Notification" : "",
        messageTitle: matchId ? "🔥 Match is Live!" : "",
        messageBody: matchId ? "Don't miss the action!" : "",
        targetAudience: matchId ? "live-matches" : "all-users",
        customTopic: "",
      })
    }
  }, [open, campaignId, matchId, initialData])

  const validateForm = () => {
    const errors: string[] = []
    if (!formData.title.trim()) errors.push("Campaign title is required")
    if (!formData.messageTitle.trim()) errors.push("Notification title is required")
    if (!formData.messageBody.trim()) errors.push("Notification message is required")
    if (formData.targetAudience === "custom" && !formData.customTopic.trim()) {
      errors.push("Custom topic is required for custom audience")
    }
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        title: formData.title.trim(),
        message: {
          title: formData.messageTitle.trim(),
          body: formData.messageBody.trim(),
        },
        targetAudience: formData.targetAudience,
        ...(formData.targetAudience === "custom" && { customTopic: formData.customTopic.trim() }),
        campaignType: "instant",
        status: "sent",
        ...(matchId && { matchId }),
      }

      const url = campaignId ? `/api/campaigns/${campaignId}` : "/api/campaigns"
      const method = campaignId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        toast({
          title: "Success!",
          description: campaignId
            ? "Campaign updated successfully"
            : `Campaign created and sent successfully${data.messageId ? ` (ID: ${data.messageId.slice(0, 10)}...)` : ""}`,
        })
        setOpen(false)
        window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "campaign" } }))
      } else {
        throw new Error(data.error || "Server error")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save campaign",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Send className="h-5 w-5" />
            {campaignId ? "Edit Campaign" : "Create Campaign"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm sm:text-base">Campaign Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="messageTitle" className="text-sm sm:text-base">Notification Title *</Label>
                <Input
                  id="messageTitle"
                  value={formData.messageTitle}
                  onChange={(e) => setFormData({ ...formData, messageTitle: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="targetAudience" className="text-sm sm:text-base">Target Audience *</Label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(value: "all-users" | "live-matches" | "custom") =>
                    setFormData({ ...formData, targetAudience: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue className="text-gray-900" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-users">All Users</SelectItem>
                    <SelectItem value="live-matches">Live Match Subscribers</SelectItem>
                    <SelectItem value="custom">Custom Topic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.targetAudience === "custom" && (
              <div>
                <Label htmlFor="customTopic" className="text-sm sm:text-base">Custom Topic *</Label>
                <Input
                  id="customTopic"
                  value={formData.customTopic}
                  onChange={(e) => setFormData({ ...formData, customTopic: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="messageBody" className="text-sm sm:text-base">Notification Message *</Label>
              <Textarea
                id="messageBody"
                value={formData.messageBody}
                onChange={(e) => setFormData({ ...formData, messageBody: e.target.value })}
                rows={3}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Notification Preview:</h4>
            <div className="bg-white border border-gray-300 rounded-lg p-3 max-w-sm">
              <div className="font-semibold text-gray-900 text-sm">
                {formData.messageTitle || "Notification Title"}
              </div>
              <div className="text-gray-600 text-sm mt-1">
                {formData.messageBody || "Notification message will appear here"}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Target:{" "}
                {formData.targetAudience === "custom"
                  ? formData.customTopic || "custom-topic"
                  : formData.targetAudience}
              </div>
            </div>
          </div>

          <div className="flex text-white flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {campaignId ? "Updating..." : "Sending..."}
                </>
              ) : campaignId ? (
                "Update Campaign"
              ) : (
                "Send Now"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}