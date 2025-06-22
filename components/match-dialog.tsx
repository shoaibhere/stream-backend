"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Loader2, Radio } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface Team {
  _id: string;
  name: string;
  crestUrl?: string;
}

interface Channel {
  _id: string;
  name: string;
  m3u8Url: string;
  headers?: Array<{ name: string; value: string }>;
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
  const [channelIds, setChannelIds] = useState<string[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  
  // Separate states for team selection popovers
  const [openTeam1, setOpenTeam1] = useState(false);
  const [openTeam2, setOpenTeam2] = useState(false);
  const [teamSearch1, setTeamSearch1] = useState("");
  const [teamSearch2, setTeamSearch2] = useState("");
  
  const router = useRouter();
  const { toast } = useToast();

  // Filter teams based on search input
  const filteredTeams1 = teams.filter(team => 
    team.name.toLowerCase().includes(teamSearch1.toLowerCase())
  );
  
  const filteredTeams2 = teams.filter(team => 
    team.name.toLowerCase().includes(teamSearch2.toLowerCase())
  );

  // Fetch channels on component mount
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch("/api/channels");
        if (response.ok) {
          const channelsData = await response.json();
          setChannels(channelsData);
        }
      } catch (error) {
        console.error("Failed to fetch channels:", error);
      }
    };

    fetchChannels();
  }, []);

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
            setChannelIds(match.channelIds || []);
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

  // Listen for channel updates
  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail.type === "channel") {
        const fetchChannels = async () => {
          try {
            const response = await fetch("/api/channels");
            if (response.ok) {
              const channelsData = await response.json();
              setChannels(channelsData);
            }
          } catch (error) {
            console.error("Failed to fetch channels:", error);
          }
        };
        fetchChannels();
      }
    };

    window.addEventListener("dataUpdated", handleDataUpdate as EventListener);
    return () =>
      window.removeEventListener(
        "dataUpdated",
        handleDataUpdate as EventListener
      );
  }, []);

  const handleChannelToggle = (channelId: string, checked: boolean) => {
    if (checked) {
      setChannelIds([...channelIds, channelId]);
    } else {
      setChannelIds(channelIds.filter((id) => id !== channelId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (team1Id === team2Id) {
      toast({
        title: "Error",
        description: "Home and Away teams cannot be the same",
        variant: "destructive",
      });
      return;
    }

    if (channelIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one channel",
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
        channelIds,
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
        window.dispatchEvent(
          new CustomEvent("dataUpdated", { detail: { type: "match" } })
        );
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
    setChannelIds([]);
    setIsLive(false);
    setTeamSearch1("");
    setTeamSearch2("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {matchId ? "Edit Match" : "Add New Match"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
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
                  className="text-sm font-medium text-gray-700"
                >
                  Match Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Champions League Final"
                  className="dashboard-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Home Team Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Home Team
                  </Label>
                  <Popover open={openTeam1} onOpenChange={setOpenTeam1}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "dashboard-input justify-between",
                          !team1Id && "text-muted-foreground"
                        )}
                      >
                        {team1Id
                          ? teams.find((team) => team._id === team1Id)?.name
                          : "Select Home Team"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput
                          placeholder="Search team..."
                          className="h-9"
                          value={teamSearch1}
                          onValueChange={setTeamSearch1}
                        />
                        <CommandEmpty>No team found.</CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-y-auto">
                          {filteredTeams1.map((team) => (
                            <CommandItem
                              key={team._id}
                              value={team.name}
                              onSelect={() => {
                                setTeam1Id(team._id);
                                setOpenTeam1(false);
                                setTeamSearch1("");
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  team1Id === team._id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {team.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Away Team Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Away Team
                  </Label>
                  <Popover open={openTeam2} onOpenChange={setOpenTeam2}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "dashboard-input justify-between",
                          !team2Id && "text-muted-foreground"
                        )}
                      >
                        {team2Id
                          ? teams.find((team) => team._id === team2Id)?.name
                          : "Select Away Team"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput
                          placeholder="Search team..."
                          className="h-9"
                          value={teamSearch2}
                          onValueChange={setTeamSearch2}
                        />
                        <CommandEmpty>No team found.</CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-y-auto">
                          {filteredTeams2.map((team) => (
                            <CommandItem
                              key={team._id}
                              value={team.name}
                              onSelect={() => {
                                setTeam2Id(team._id);
                                setOpenTeam2(false);
                                setTeamSearch2("");
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  team2Id === team._id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {team.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Select Channels ({channelIds.length} selected)
                </Label>
                {channels.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {channels.map((channel) => (
                      <div
                        key={channel._id}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <Checkbox
                          id={channel._id}
                          checked={channelIds.includes(channel._id)}
                          onCheckedChange={(checked) =>
                            handleChannelToggle(channel._id, checked as boolean)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={channel._id}
                            className="font-medium text-gray-900 cursor-pointer"
                          >
                            {channel.name}
                          </Label>
                          <p className="text-sm text-gray-500 font-mono truncate mt-1">
                            {channel.m3u8Url}
                          </p>
                          {channel.headers && channel.headers.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {channel.headers.length} header
                              {channel.headers.length !== 1 ? "s" : ""}{" "}
                              configured
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <p className="text-sm">No channels available</p>
                    <p className="text-xs mt-1">
                      Create channels first to assign them to matches
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-1">
                  <Label
                    htmlFor="isLive"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Radio className="h-4 w-4" />
                    Live Status
                  </Label>
                  <p className="text-xs text-gray-500">
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
                className="dashboard-button-secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="dashboard-button-primary"
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