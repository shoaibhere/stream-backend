"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";

export default function MyNotificationCampaignsButton({ className }: { className?: string }) {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className={`bg-amber-600 hover:bg-amber-500 border-none  ${className}`}
      >
        <Link href="/dashboard/campaigns" className="flex items-center gap-3 w-full">
        <Megaphone className="h-5 w-5 mr-3" />
          My Notifications
        </Link>
      </Button>
    </div>
  );
}
