"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Newspaper } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FetchArticlesButton({ className }: { className?: string }) {
  const [fetching, setFetching] = useState(false);
  const [alert, setAlert] = useState<null | {
    type: "success" | "error";
    title: string;
    description: string;
  }>(null);

  // Auto dismiss alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => {
        setAlert(null);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);

  const handleClick = async () => {
    setFetching(true);
    setAlert({
      type: "success",
      title: "Fetching...",
      description: "Getting latest football news...",
    });

    try {
      const res = await fetch("/api/external/news");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch articles");
      }

      setAlert({
        type: "success",
        title: "Success!",
        description: `${data.insertedCount} articles saved.`,
      });
    } catch (err: any) {
      setAlert({
        type: "error",
        title: "Error!",
        description: err.message || "Something went wrong.",
      });
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={fetching}
        variant="outline"
        className={`bg-pink-500 border-none hover:bg-pink-600 ${className}`}
      >
        <Newspaper className="h-5 w-5 mr-3" />
        {fetching ? "Fetching..." : "Fetch Articles"}
      </Button>

      {alert && (
        <Alert
          variant={alert.type === "error" ? "destructive" : "default"}
          className={`transition-all duration-300 shadow-md px-4 py-3 border-l-4 rounded-md ${
            alert.type === "error"
              ? "border-red-600 bg-red-50 text-red-700"
              : "border-green-600 bg-green-50 text-green-700"
          }`}
        >
          <AlertTitle className="font-semibold">{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
