"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Radio } from "lucide-react";

export default function MyMatchesButton({ className }: { className?: string }) {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className={`bg-blue-600 hover:bg-blue-500 border-none  ${className}`}
      >
        <Link href="/dashboard/matches" className="flex items-center gap-3 w-full">
        <Radio className="h-5 w-5 mr-3" />
          My Matches
        </Link>
      </Button>
    </div>
  );
}
