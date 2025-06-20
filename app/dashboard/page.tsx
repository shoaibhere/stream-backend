import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Tv,
  Play,
  Database,
  ArrowRight,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getTeamsCount,
  getMatchesCount,
  getLiveMatches,
  getChannelsCount,
} from "@/lib/data";
import FetchArticlesButton from "@/components/fetch-articles-button";
import FetchMatchesButton from "@/components/fetch-matches-button";

export default async function Dashboard() {
  const teamsCount = await getTeamsCount();
  const matchesCount = await getMatchesCount();
  const channelsCount = await getChannelsCount();
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
      change: "+12%",
    },
    {
      title: "Total Channels",
      value: channelsCount,
      description: "Streaming channels",
      icon: Radio,
      color: "text-purple-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/channels",
      change: "+5%",
    },
    {
      title: "Total Matches",
      value: matchesCount,
      description: "Configured match streams",
      icon: Tv,
      color: "text-emerald-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/matches",
      change: "+8%",
    },
    {
      title: "Live Matches",
      value: liveMatchesCount,
      description: "Currently streaming",
      icon: Play,
      color: "text-red-600",
      bgColor: "bg-gray-100",
      href: "/dashboard/matches",
      change: "Live",
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="bg-white hover:shadow-md transition-all duration-300 group"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </CardTitle>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                </div>
                <div
                  className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-105 transition-transform duration-200`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-500">{stat.description}</p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.change === "Live"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Link href={stat.href}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="bg-white lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Button
                  asChild
                  className="text-white bg-yellow-600 border-none hover:bg-yellow-500 justify-start h-12"
                >
                  <Link href="/dashboard/teams">
                    <Users className="h-5 w-5 mr-3" />
                    My Teams
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="bg-green-500 border-none hover:bg-green-600 justify-start h-12"
                >
                  <Link href="/dashboard/channels">
                    <Radio className="h-5 w-5 mr-3" />
                    My Channels
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="bg-blue-500 border-none hover:bg-blue-600 justify-start h-12"
                >
                  <Link href="/dashboard/matches">
                    <Tv className="h-5 w-5 mr-3" />
                    My Matches
                  </Link>
                </Button>
                <FetchMatchesButton/>

                <FetchArticlesButton/>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Database</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cloudinary CDN</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Channels</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-600">
                      {channelsCount} Active
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Live Streams</span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        liveMatchesCount > 0
                          ? "bg-green-500 animate-pulse"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <span
                      className={`font-medium ${
                        liveMatchesCount > 0
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {liveMatchesCount > 0
                        ? `${liveMatchesCount} Active`
                        : "None Active"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Server Load</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">75% - Optimal</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
