"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tv } from "lucide-react";

export default function MyChannelsButton({ className }: { className?: string }) {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className={`bg-green-600 hover:bg-green-500 border-none  ${className}`}
      >
        <Link href="/dashboard/channels" className="flex items-center gap-3 w-full">
        <Tv className="h-5 w-5 mr-3" />
          My Channels
        </Link>
      </Button>
    </div>
  );
}
