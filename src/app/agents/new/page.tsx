"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { CATEGORIES } from "@/lib/utils";

const STACK = ["Next.js","FastAPI","Python","TypeScript","Node.js","Neon","PostgreSQL","OpenAI","Anthropic","Groq","LangChain","Vercel","Render","Polygon"];

export default function NewAgentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stack, setStack] = useState<string[]>([]);
  const [stackInput, setStackInput] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addStack(t: string) {
    const s = t.trim();
    if (s && !stack.includes(s)) setStack(p => [...p, s]);
    setStackInput("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"), tagline: fd.get("tagline"),
        description: fd.get("description"), category: fd.get("category"),
        demoUrl: fd.get("demoUrl") || null, repoUrl: fd.get("repoUrl") || null,
        systemPrompt: fd.get("systemPrompt") || null,
        isLive, stack, tags: [],
      }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Error"); setLoading(false); return; }
    const agent = await res.json();
    router.push(`/agents/${agent.slug}`);
  }

  if (!session) return (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h2 className="font-bold text-xl mb-3">Sign in to register your agent</h2>
        <button onClick={() => signIn("github")} className="btn-primary">Sign in with GitHub</button>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Register your agent</h1>
        <p className="text-gray-500 mb-8">Give your agent a public profile on Agentis.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="card p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input name="name" required className="input" placeholder="e.g. LegalMind, ATIP" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline *</label>
              <input name="tagline" required maxLength={120} className="input" placeholder="One sentence — what does it do?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" required className="input">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" required rows={3} className="input resize-none" placeholder="What it does, how it works, who it's for." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Demo URL</label>
                <input name="demoUrl" type="url" className="input" placeholder="https://" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repository</label>
                <input name="repoUrl" type="url" className="input" placeholder="https://github.com/..." />
              </div>
            </div>
          </div>

          {/* Stack */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Tech stack</label>
            <div className="flex gap-2 mb-3">
              <input value={stackInput} onChange={e => setStackInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addStack(stackInput); } }}
                className="input" placeholder="Add technology, press Enter" />
              <button type="button" onClick={() => addStack(stackInput)} className="btn-secondary px-3">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {STACK.filter(s => !stack.includes(s)).map(s => (
                <button key={s} type="button" onClick={() => addStack(s)} className="tag bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">+ {s}</button>
              ))}
            </div>
            {stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {stack.map(t => <span key={t} onClick={() => setStack(p => p.filter(x => x !== t))} className="tag bg-blue-100 text-blue-700 cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors">{t} ×</span>)}
              </div>
            )}
          </div>

          {/* Live chat */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Enable live chat</p>
                <p className="text-xs text-gray-400">Let visitors chat directly with your agent</p>
              </div>
              <button type="button" onClick={() => setIsLive(!isLive)}
                className={`w-11 h-6 rounded-full transition-colors relative ${isLive ? "bg-blue-600" : "bg-gray-200"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isLive ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            {isLive && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System prompt</label>
                <textarea name="systemPrompt" rows={4} className="input resize-none font-mono text-xs"
                  placeholder="You are [Agent Name], an AI that helps with... Describe your agent's personality, capabilities, and how it should respond." />
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50">
            {loading ? "Registering..." : "Register agent →"}
          </button>
        </form>
      </div>
    </>
  );
}
