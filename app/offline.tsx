"use client";

import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-card flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-accent">You are offline</h2>
          <p className="mb-4 text-muted-foreground text-center">
            It looks like you have lost your internet connection. Please check your network and try again.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </body>
    </html>
  );
}
