"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function GatePage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const res = await fetch("/api/gate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) { router.push("/"); router.refresh(); } else { setError("Wrong password"); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><div className="text-4xl mb-3">🎓</div><h1 className="text-2xl font-bold font-display">Family Learning Engine</h1><p className="text-sm font-body text-gray-400 mt-1">Enter the family password</p></div>
        <form onSubmit={handleSubmit}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Family password" autoFocus className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-base font-body focus:border-amber-400 focus:outline-none mb-3" />
          {error && <p className="text-red-500 text-sm font-body mb-3">{error}</p>}
          <button type="submit" disabled={!password || loading} className="w-full py-3 rounded-xl text-sm font-semibold font-body text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400">{loading ? "Checking..." : "Enter"}</button>
        </form>
      </div>
    </div>
  );
}
