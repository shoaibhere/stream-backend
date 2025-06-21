"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'

interface DeleteAdDialogProps {
  children: React.ReactNode
  adConfigId: string
  adConfigName: string
}

export default function DeleteAdDialog({ children, adConfigId, adConfigName }: DeleteAdDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/ads/${adConfigId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Ad configuration deleted",
          description: `${adConfigName} has been deleted successfully`,
        })
        setOpen(false)
        router.refresh()
        // Trigger a custom event to refresh data across components
        window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "ad" } }))
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete ad configuration")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete ad configuration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this ad configuration?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the ad configuration &quot;{adConfigName}&quot; and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
