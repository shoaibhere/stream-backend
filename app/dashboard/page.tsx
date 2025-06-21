import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Tv,
  Play,
  Database,
  ArrowRight,
  TvMinimalPlayIcon,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getTeamsCount,
  getMatchesCount,
  getLiveMatches,
  getChannelsCount,
  getAds,
  getAdsCount,
} from "@/lib/data";
import MyWebsiteButton from "@/components/my-website-button";
import FetchArticlesButton from "@/components/fetch-articles-button";
import FetchMatchesButton from "@/components/fetch-matches-button";
import FetchCompetitionsButton from "@/components/fetch-competitions-button";
import FetchStandingsButton from "@/components/fetch-standings-button";
import FetchScorersButton from "@/components/fetch-scorers-button";
import MyChannelsButton from "@/components/my-channels-button";
import MyMatchesButton from "@/components/my-matches-button";
import MyAdsButton from "@/components/my-ads-button";
import MyTeamsButton from "@/components/my-teams-button";
import DynamicStats from "@/components/dynamic-stats";

export default async function Dashboard() {
  const teamsCount = await getTeamsCount();
  const ads = await getAds();
  const matchesCount = await getMatchesCount();
  const channelsCount = await getChannelsCount();
  const adsCount = ads.length;
  const liveMatches = await getLiveMatches();
  const liveMatchesCount = liveMatches.length;

  const stats = [
    {
      title: "Total Teams",
      value: teamsCount,
      description: "Registered football teams",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/teams",
    },
    {
      title: "Total Channels",
      value: channelsCount,
      description: "Streaming channels",
      icon: Radio,
      color: "text-purple-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/channels",
    },
    {
      title: "Total Matches",
      value: matchesCount,
      description: "Configured match streams",
      icon: Tv,
      color: "text-emerald-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/matches",
    },
    {
      title: "Live Matches",
      value: liveMatchesCount,
      description: "Currently streaming",
      icon: Play,
      color: "text-red-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/matches",
    },
    {
      title: "Ads Configured",
      value: adsCount,
      description: "Currently Configured",
      icon: TvMinimalPlayIcon,
      color: "text-fuchsia-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/ads",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Monitor your football streaming platform performance
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <DynamicStats/>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-white lg:col-span-3">
  <CardHeader>
    <CardTitle className="text-xl font-semibold text-gray-900">
      Quick Actions
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-5">
      <MyTeamsButton className="w-full h-16 text-sm font-medium" />
      <MyChannelsButton className="w-full h-16 text-sm font-medium" />
      <MyMatchesButton className="w-full h-16 text-sm font-medium" />
      <MyAdsButton className="w-full h-16 text-sm font-medium" />
      <MyWebsiteButton className="w-full h-16 text-sm font-medium" />
    </div>

      <CardTitle className="text-xl font-semibold text-gray-900">
      Fetch Data From API
      </CardTitle>
    <div className="grid gap-4 sm:grid-cols-5">
      <FetchMatchesButton className="w-full h-16 text-sm font-medium" />
      <FetchCompetitionsButton className="w-full h-16 text-sm font-medium" />
      <FetchStandingsButton className="w-full h-16 text-sm font-medium" />
      <FetchScorersButton className="w-full h-16 text-sm font-medium" />
      <FetchArticlesButton className="w-full h-16 text-sm font-medium" />
    </div>
  </CardContent>
</Card>

</div>
      </div>
    </DashboardLayout>
  );
}
