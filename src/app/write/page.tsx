"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";

export default function WritePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [agentSlug, setAgentSlug] = useState("");
  const [type, setType] = useState("ARTICLE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function publish() {
    if (!title || !content) { setError("Title and content required."); return; }
    setLoading(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, content, type, agentSlug: agentSlug || null, published: true }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Error"); setLoading(false); return; }
    const post = await res.json();
    router.push(post.agentSlug ? `/agents/${post.agentSlug}/posts/${post.slug}` : `/posts/${post.slug}`);
  }

  if (!session) return (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h2 className="font-bold text-xl mb-3">Sign in to write</h2>
        <button onClick={() => signIn("github")} className="btn-primary">Sign in with GitHub</button>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Post type */}
        <div className="flex gap-2 mb-6">
          {["ARTICLE","CHANGELOG","TUTORIAL","CASESTUDY"].map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${type === t ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              {t === "CASESTUDY" ? "Case Study" : t[0] + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Agent */}
        <div className="mb-5">
          <input value={agentSlug} onChange={e => setAgentSlug(e.target.value)}
            placeholder="Agent slug (optional — attach this post to an agent)"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400 bg-gray-50 text-gray-600" />
        </div>

        <div className="card p-8">
          <textarea value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Title" rows={2}
            className="w-full text-3xl font-bold text-gray-900 placeholder:text-gray-300 outline-none resize-none mb-3 font-serif" />
          <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)}
            placeholder="Subtitle (optional)" rows={1}
            className="w-full text-lg text-gray-500 placeholder:text-gray-300 outline-none resize-none mb-5" />
          <div className="border-t border-gray-100 mb-5" />
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="Write your story..." rows={18}
            className="w-full text-gray-700 placeholder:text-gray-300 outline-none resize-none leading-relaxed text-base" />
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={publish} disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Publishing..." : "Publish"}
          </button>
          <button onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </>
  );
}
