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
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface Team {
  _id: string
  name: string
  crestUrl?: string
}

interface MatchDialogProps {
  children: React.ReactNode
  matchId?: string
  teams: Team[]
}

export default function MatchDialog({ children, matchId, teams }: MatchDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [team1Id, setTeam1Id] = useState("")
  const [team2Id, setTeam2Id] = useState("")
  const [streamUrl, setStreamUrl] = useState("")
  const [isLive, setIsLive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMatch, setIsLoadingMatch] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch match data if editing
  useEffect(() => {
    if (matchId && open) {
      const fetchMatch = async () => {
        setIsLoadingMatch(true)
        try {
          const response = await fetch(`/api/matches/${matchId}`)
          if (response.ok) {
            const match = await response.json()
            setTitle(match.title)
            setTeam1Id(match.team1Id)
            setTeam2Id(match.team2Id)
            setStreamUrl(match.streamUrl)
            setIsLive(match.isLive)
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load match data",
            variant: "destructive",
          })
        } finally {
          setIsLoadingMatch(false)
        }
      }

      fetchMatch()
    }
  }, [matchId, open, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (team1Id === team2Id) {
      toast({
        title: "Error",
        description: "Team 1 and Team 2 cannot be the same",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const matchData = {
        title,
        team1Id,
        team2Id,
        streamUrl,
        isLive,
      }

      const url = matchId ? `/api/matches/${matchId}` : "/api/matches"
      const method = matchId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(matchData),
      })

      if (response.ok) {
        toast({
          title: matchId ? "Match updated" : "Match created",
          description: matchId ? "Match has been updated successfully" : "New match has been created",
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
        description: error instanceof Error ? error.message : "Failed to save match",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setTeam1Id("")
    setTeam2Id("")
    setStreamUrl("")
    setIsLive(false)
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{matchId ? "Edit Match" : "Add New Match"}</DialogTitle>
          <DialogDescription>
            {matchId ? "Update match details below" : "Enter match details below to create a new match"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingMatch ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Match Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter match title"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="team1">Team 1</Label>
                <Select value={team1Id} onValueChange={setTeam1Id} required>
                  <SelectTrigger id="team1">
                    <SelectValue placeholder="Select team 1" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="team2">Team 2</Label>
                <Select value={team2Id} onValueChange={setTeam2Id} required>
                  <SelectTrigger id="team2">
                    <SelectValue placeholder="Select team 2" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="streamUrl">Stream URL (m3u8)</Label>
                <Input
                  id="streamUrl"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="Enter m3u8 stream URL"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch id="isLive" checked={isLive} onCheckedChange={setIsLive} />
                <Label htmlFor="isLive">Live Status</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {matchId ? "Update Match" : "Create Match"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
