"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlobeIcon } from "lucide-react";

export default function MyWebsiteButton({ className }: { className?: string }) {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className={`bg-cyan-600 hover:bg-cyan-500 border-none  ${className}`}
      >
        <Link href="/" className="flex items-center gap-3 w-full">
        <GlobeIcon className="h-5 w-5 mr-3" />
          My Website
        </Link>
      </Button>
    </div>
  );
}
