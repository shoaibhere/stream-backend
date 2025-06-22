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
import { Loader2, Upload, X } from 'lucide-react'

interface TeamDialogProps {
  children: React.ReactNode
  teamId?: string
}

export default function TeamDialog({ children, teamId }: TeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [nameError, setNameError] = useState<string | null>(null) // NEW: Error state
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

  const removeCrest = () => {
    setCrestFile(null)
    setCrestPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setNameError(null) // Reset error before submission

    try {
      const formData = new FormData()
      formData.append("name", name.trim())
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
          description: teamId 
            ? "Team has been updated successfully" 
            : "New team has been created",
        })
        setOpen(false)
        router.refresh()
        // Trigger a custom event to refresh data across components
        window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'team' } }))
      } else {
        const errorData = await response.json()
        
        // NEW: Handle duplicate name error specifically
        if (errorData.message && errorData.message.includes('already exists')) {
          setNameError(errorData.message)
        } else {
          throw new Error(errorData.message || "Something went wrong")
        }
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
    setNameError(null) // NEW: Clear error on close
    setCrestFile(null)
    setCrestPreview(null)
  }

  // NEW: Clear error when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (nameError) setNameError(null)
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
          <DialogTitle className="text-xl font-semibold text-slate-800">
            {teamId ? "Edit Team" : "Add New Team"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {teamId ? "Update team details below" : "Enter team details below to create a new team"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingTeam ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                  Team Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={handleNameChange} // Updated handler
                  placeholder="Enter team name"
                  className={`h-11 rounded-lg focus:ring-blue-500 ${
                    nameError 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                  required
                />
                
                {/* NEW: Error message display */}
                {nameError && (
                  <p className="text-red-500 text-sm font-medium mt-1 flex items-start">
                    <X className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
                    <span>{nameError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">Club Crest</Label>

                {crestPreview ? (
                  <div className="space-y-3">
                    <div className="relative w-24 h-24 mx-auto">
                      <Image
                        src={crestPreview || "/placeholder.svg"}
                        alt="Crest preview"
                        fill
                        className="object-contain rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={removeCrest}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <Label
                      htmlFor="crest"
                      className="flex h-11 w-full cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <Upload className="mr-2 h-4 w-4 text-slate-600" />
                      <span className="text-sm text-slate-600">Change Image</span>
                      <Input id="crest" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </Label>
                  </div>
                ) : (
                  <Label
                    htmlFor="crest"
                    className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-600">Upload Club Crest</span>
                    <span className="text-xs text-slate-500">PNG, JPG up to 10MB</span>
                    <Input id="crest" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </Label>
                )}
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="admin-button-secondary text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="admin-button-primary"
              >
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