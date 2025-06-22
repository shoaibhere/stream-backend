'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Tv, Play, Radio, TvMinimalPlayIcon } from "lucide-react";
import useSWR from 'swr';
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DynamicStats() {
  const { data, error, isLoading } = useSWR('/api/dashboard/stats', fetcher, {
    refreshInterval: 5000, // Refresh every 10 seconds
  });

  if (error) return <div>Failed to load stats</div>;

  const stats = [
    {
      title: "Total Teams",
      value: data?.teamsCount || 0,
      description: "Registered football teams",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/teams",
    },
    {
      title: "Total Channels",
      value: data?.channelsCount || 0,
      description: "Streaming channels",
      icon: Radio,
      color: "text-purple-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/channels",
    },
    {
      title: "Notification Campaigns",
      value: data?.campaignCount || 0,
      description: "Configured notification Campaigns",
      icon: Tv,
      color: "text-emerald-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/campaigns",
    },
    {
      title: "Live Matches",
      value: data?.liveMatchesCount || 0,
      description: "Currently streaming",
      icon: Play,
      color: "text-red-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/matches",
    },
    {
      title: "Ads Configured",
      value: data?.adsCount || 0,
      description: "Currently Configured",
      icon: TvMinimalPlayIcon,
      color: "text-fuchsia-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/ads",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-[140px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-105 transition-transform duration-200`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}