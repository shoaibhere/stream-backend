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
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface Header {
  name: string
  value: string
}

interface ChannelDialogProps {
  children: React.ReactNode
  channelId?: string
}

export default function ChannelDialog({ children, channelId }: ChannelDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [m3u8Url, setM3u8Url] = useState("")
  const [headers, setHeaders] = useState<Header[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingChannel, setIsLoadingChannel] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch channel data if editing
  useEffect(() => {
    if (channelId && open) {
      const fetchChannel = async () => {
        setIsLoadingChannel(true)
        try {
          const response = await fetch(`/api/channels/${channelId}`)
          if (response.ok) {
            const channel = await response.json()
            setName(channel.name)
            setM3u8Url(channel.m3u8Url)
            setHeaders(channel.headers || [])
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load channel data",
            variant: "destructive",
          })
        } finally {
          setIsLoadingChannel(false)
        }
      }

      fetchChannel()
    }
  }, [channelId, open, toast])

  const addHeader = () => {
    setHeaders([...headers, { name: "", value: "" }])
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const updateHeader = (index: number, field: "name" | "value", value: string) => {
    const updatedHeaders = headers.map((header, i) =>
      i === index ? { ...header, [field]: value } : header
    )
    setHeaders(updatedHeaders)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Filter out empty headers
      const validHeaders = headers.filter(header => header.name.trim() && header.value.trim())

      const channelData = {
        name,
        m3u8Url,
        headers: validHeaders,
      }

      const url = channelId ? `/api/channels/${channelId}` : "/api/channels"
      const method = channelId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(channelData),
      })

      if (response.ok) {
        toast({
          title: channelId ? "Channel updated" : "Channel created",
          description: channelId ? "Channel has been updated successfully" : "New channel has been created",
        })
        setOpen(false)
        router.refresh()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Something went wrong")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save channel",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setM3u8Url("")
    setHeaders([])
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {channelId ? "Edit Channel" : "Add New Channel"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {channelId ? "Update channel details below" : "Enter channel details below to create a new streaming channel"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingChannel ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Channel Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., HD Sports Channel"
                  className="dashboard-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="m3u8Url" className="text-sm font-medium text-gray-700">
                  M3U8 Stream URL
                </Label>
                <Input
                  id="m3u8Url"
                  value={m3u8Url}
                  onChange={(e) => setM3u8Url(e.target.value)}
                  placeholder="https://example.com/stream.m3u8"
                  className="dashboard-input font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">HTTP Headers (Optional)</Label>
                  <Button type="button" onClick={addHeader} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Header
                  </Button>
                </div>

                {headers.length > 0 && (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {headers.map((header, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <Input
                            placeholder="Header name (e.g., Authorization)"
                            value={header.name}
                            onChange={(e) => updateHeader(index, "name", e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Header value"
                            value={header.value}
                            onChange={(e) => updateHeader(index, "value", e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeHeader(index)}
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {headers.length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <p className="text-sm">No headers configured</p>
                    <p className="text-xs mt-1">Headers are optional and used for authentication or custom configurations</p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="dashboard-button-secondary">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="dashboard-button-primary">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {channelId ? "Update Channel" : "Create Channel"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
