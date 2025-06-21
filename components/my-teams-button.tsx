"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tv,Users } from "lucide-react";

export default function MyTeamsButton({ className }: { className?: string }) {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className={`bg-rose-600 hover:bg-rose-500 border-none  ${className}`}
      >
        <Link href="/dashboard/teams" className="flex items-center gap-3 w-full">
        <Users className="h-5 w-5 mr-3" />
          My Teams
        </Link>
      </Button>
    </div>
  );
}
