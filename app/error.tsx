"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Optionally log error to an error reporting service
    // console.error(error);
  }, [error]);

  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-card flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-destructive">Something went wrong</h2>
          <p className="mb-4 text-muted-foreground text-center">
            {error.message || "An unexpected error occurred. Please try again later."}
          </p>
          <Button onClick={() => reset()} className="mb-2">Try Again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>Go Home</Button>
        </div>
      </body>
    </html>
  );
}
