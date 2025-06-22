"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, TestTube } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function TestNotificationSender() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "Test Notification",
    body: "This is a test notification from your app!",
    topic: "all-users",
    customTopic: "",
  })
  const { toast } = useToast()

  const sendTestNotification = async () => {
    setIsLoading(true)

    try {
      const targetTopic = formData.topic === "custom" ? formData.customTopic : formData.topic

      if (!targetTopic) {
        throw new Error("Please specify a topic")
      }

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Campaign",
          message: {
            title: formData.title,
            body: formData.body,
          },
          targetAudience: formData.topic === "custom" ? "custom" : formData.topic,
          customTopic: formData.topic === "custom" ? formData.customTopic : undefined,
          campaignType: "instant",
          status: "sent",
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Test Notification Sent! 🎉",
          description: `Notification sent to topic: ${targetTopic}`,
        })
      } else {
        throw new Error(data.error || "Failed to send test notification")
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send test notification",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6 border border-gray-200 rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 gap-2 text-lg sm:text-xl">
          <TestTube className="h-5 w-5" />
          Test Notification Sender
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm sm:text-base text-gray-900" htmlFor="test-title">Notification Title</Label>
            <Input
              id="test-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter notification title"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm sm:text-base text-gray-900" htmlFor="test-topic">Target Topic</Label>
            <Select 
              value={formData.topic} 
              onValueChange={(value) => setFormData({ ...formData, topic: value })}
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

        {formData.topic === "custom" && (
          <div>
            <Label className="text-sm sm:text-base text-gray-700" htmlFor="custom-topic">Custom Topic Name</Label>
            <Input
              id="custom-topic"
              value={formData.customTopic}
              onChange={(e) => setFormData({ ...formData, customTopic: e.target.value })}
              placeholder="Enter custom topic name"
              className="mt-1"
            />
          </div>
        )}

        <div>
          <Label className="text-sm sm:text-base text-gray-900" htmlFor="test-body">Notification Message</Label>
          <Textarea
            id="test-body"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Enter notification message"
            rows={3}
            className="mt-1"
          />
        </div>

        <Button 
          onClick={sendTestNotification} 
          disabled={isLoading} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? "Sending Test Notification..." : "Send Test Notification"}
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs sm:text-sm text-blue-700">
            <strong>Note:</strong> This will send a real push notification to devices subscribed to the selected topic.
            Make sure you have the Firebase project properly configured and devices subscribed to receive notifications.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}