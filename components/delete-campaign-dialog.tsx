"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DeleteCampaignDialogProps {
  children: React.ReactNode
  campaignId: string
  campaignTitle: string
}

export default function DeleteCampaignDialog({ children, campaignId, campaignTitle }: DeleteCampaignDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        })
        setOpen(false)
        window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "campaign" } }))
      } else {
        throw new Error("Failed to delete campaign")
      }
    } catch (error) {
      console.error("Failed to delete campaign:", error)
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[calc(100vw-2rem)] bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Delete Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm sm:text-base text-gray-600">
            Are you sure you want to delete the campaign <strong>"{campaignTitle}"</strong>? This action cannot be
            undone.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Deleting..." : "Delete Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}