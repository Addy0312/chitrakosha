"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-200 text-yellow-800",
  ACCEPTED: "bg-green-200 text-green-800",
  REJECTED: "bg-red-200 text-red-800",
  COMPLETED: "bg-blue-200 text-blue-800",
};

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCommissions();
  }, []);

  async function fetchCommissions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/commissions/admin");
      const data = await res.json();
      setCommissions(data.commissions || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch("/api/commissions/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchCommissions();
    } catch {}
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">Commission Requests</h2>
      {commissions.length === 0 ? (
        <div className="text-muted-foreground">No commission requests found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {commissions.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="mb-2">{c.name}</CardTitle>
                <Badge className={STATUS_COLORS[c.status] || "bg-gray-200 text-gray-800"}>{c.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="mb-2"><b>Email:</b> {c.email}</div>
                <div className="mb-2"><b>Description:</b> {c.description}</div>
                <div className="mb-2"><b>Budget:</b> {c.budget || "N/A"}</div>
                <div className="mb-2"><b>Created:</b> {new Date(c.createdAt).toLocaleString()}</div>
                <div className="flex gap-2 mt-4">
                  {c.status !== "ACCEPTED" && (
                    <Button size="sm" onClick={() => updateStatus(c.id, "ACCEPTED")}>Accept</Button>
                  )}
                  {c.status !== "REJECTED" && (
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(c.id, "REJECTED")}>Reject</Button>
                  )}
                  {c.status !== "COMPLETED" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "COMPLETED")}>Mark Completed</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
