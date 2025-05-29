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
import Image from "next/image"
import { Loader2, Upload } from "lucide-react"

interface TeamDialogProps {
  children: React.ReactNode
  teamId?: string
}

export default function TeamDialog({ children, teamId }: TeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [crestFile, setCrestFile] = useState<File | null>(null)
  const [crestPreview, setCrestPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTeam, setIsLoadingTeam] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch team data if editing
  useEffect(() => {
    if (teamId && open) {
      const fetchTeam = async () => {
        setIsLoadingTeam(true)
        try {
          const response = await fetch(`/api/teams/${teamId}`)
          if (response.ok) {
            const team = await response.json()
            setName(team.name)
            if (team.crestUrl) {
              setCrestPreview(team.crestUrl)
            }
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load team data",
            variant: "destructive",
          })
        } finally {
          setIsLoadingTeam(false)
        }
      }

      fetchTeam()
    }
  }, [teamId, open, toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCrestFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCrestPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      if (crestFile) {
        formData.append("crest", crestFile)
      }

      const url = teamId ? `/api/teams/${teamId}` : "/api/teams"
      const method = teamId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (response.ok) {
        toast({
          title: teamId ? "Team updated" : "Team created",
          description: teamId ? "Team has been updated successfully" : "New team has been created",
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
        description: error instanceof Error ? error.message : "Failed to save team",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setCrestFile(null)
    setCrestPreview(null)
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{teamId ? "Edit Team" : "Add New Team"}</DialogTitle>
          <DialogDescription>
            {teamId ? "Update team details below" : "Enter team details below to create a new team"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingTeam ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter team name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="crest">Club Crest</Label>
                <div className="flex items-center gap-4">
                  {crestPreview && (
                    <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                      <Image
                        src={crestPreview || "/placeholder.svg"}
                        alt="Crest preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label
                      htmlFor="crest"
                      className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {crestPreview ? "Change Image" : "Upload Image"}
                      <Input id="crest" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {teamId ? "Update Team" : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
