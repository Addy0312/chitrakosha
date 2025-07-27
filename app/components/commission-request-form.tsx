"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CommissionRequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    description: "",
    budget: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to submit commission request");
      setSuccess(true);
      setForm({ name: "", email: "", description: "", budget: "" });
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Your Name</label>
        <input
          className="input input-bordered w-full"
          required
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          className="input input-bordered w-full"
          type="email"
          required
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          className="input input-bordered w-full"
          required
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Budget (optional)</label>
        <input
          className="input input-bordered w-full"
          value={form.budget}
          onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
        />
      </div>
      {error && <div className="text-destructive">{error}</div>}
      {success && <div className="text-success">Request submitted!</div>}
      <Button type="submit" disabled={loading} className="bg-gradient-saffron w-full">
        {loading ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}
