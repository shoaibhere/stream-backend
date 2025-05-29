"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Radio, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

interface Team {
  _id: string;
  name: string;
  crestUrl?: string;
}

interface MatchDialogProps {
  children: React.ReactNode;
  matchId?: string;
  teams: Team[];
}

export default function MatchDialog({
  children,
  matchId,
  teams,
}: MatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [searchTerm1, setSearchTerm1] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  // Fetch match data if editing
  useEffect(() => {
    if (matchId && open) {
      const fetchMatch = async () => {
        setIsLoadingMatch(true);
        try {
          const response = await fetch(`/api/matches/${matchId}`);
          if (response.ok) {
            const match = await response.json();
            setTitle(match.title);
            setTeam1Id(match.team1Id);
            setTeam2Id(match.team2Id);
            setStreamUrl(match.streamUrl);
            setIsLive(match.isLive);
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load match data",
            variant: "destructive",
          });
        } finally {
          setIsLoadingMatch(false);
        }
      };

      fetchMatch();
    }
  }, [matchId, open, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (team1Id === team2Id) {
      toast({
        title: "Error",
        description: "Home Team and Away Team cannot be the same",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const matchData = {
        title,
        team1Id,
        team2Id,
        streamUrl,
        isLive,
      };

      const url = matchId ? `/api/matches/${matchId}` : "/api/matches";
      const method = matchId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(matchData),
      });

      if (response.ok) {
        toast({
          title: matchId ? "Match updated" : "Match created",
          description: matchId
            ? "Match has been updated successfully"
            : "New match has been created",
        });
        setOpen(false);
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save match",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setTeam1Id("");
    setTeam2Id("");
    setStreamUrl("");
    setIsLive(false);
    setSearchTerm1("");
    setSearchTerm2("");
  };

  const filteredTeams1 = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm1.toLowerCase())
  );

  const filteredTeams2 = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm2.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-slate-800">
            {matchId ? "Edit Match" : "Add New Match"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {matchId
              ? "Update match details below"
              : "Enter match details below to create a new match"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingMatch ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-slate-700"
                >
                  Match Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Premier League Final"
                  className="h-11 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="team1"
                    className="text-sm font-medium text-slate-700"
                  >
                    Home Team
                  </Label>
                  <Select value={team1Id} onValueChange={setTeam1Id} required>
                    <SelectTrigger
                      id="team1"
                      className="h-11 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <SelectValue placeholder="Select Home Team" />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                      <Command>
                        <div className="flex items-center border-b px-3">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <CommandInput
                            placeholder="Search team..."
                            value={searchTerm1}
                            onValueChange={setSearchTerm1}
                          />
                        </div>
                        <CommandEmpty>No team found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-y-auto">
                          {filteredTeams1.map((team) => (
                            <CommandItem
                              key={team._id}
                              value={team.name} // Changed from team._id to team.name
                              onSelect={() => {
                                setTeam1Id(team._id);
                                setSearchTerm1("");
                              }}
                            >
                              {team.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="team2"
                    className="text-sm font-medium text-slate-700"
                  >
                    Away Team
                  </Label>
                  <Select value={team2Id} onValueChange={setTeam2Id} required>
                    <SelectTrigger
                      id="team2"
                      className="h-11 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <SelectValue placeholder="Select Away Team" />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                      <Command>
                        <div className="flex items-center border-b px-3">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <CommandInput
                            placeholder="Search team..."
                            value={searchTerm2}
                            onValueChange={setSearchTerm2}
                          />
                        </div>
                        <CommandEmpty>No team found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-y-auto">
                          {filteredTeams2.map((team) => (
                            <CommandItem
                              key={team._id}
                              value={team.name}
                              onSelect={() => {
                                setTeam2Id(team._id);
                                setSearchTerm2("");
                              }}
                            >
                              {team.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="streamUrl"
                  className="text-sm font-medium text-slate-700"
                >
                  Stream URL (m3u8)
                </Label>
                <Input
                  id="streamUrl"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://example.com/stream.m3u8"
                  className="h-11 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <Label
                    htmlFor="isLive"
                    className="text-sm font-medium text-slate-700 flex items-center gap-2"
                  >
                    <Radio className="h-4 w-4" />
                    Live Status
                  </Label>
                  <p className="text-xs text-slate-500">
                    Enable to make this match available for streaming
                  </p>
                </div>
                <Switch
                  id="isLive"
                  checked={isLive}
                  onCheckedChange={setIsLive}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="admin-button-primary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="admin-button-secondary"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {matchId ? "Update Match" : "Create Match"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
