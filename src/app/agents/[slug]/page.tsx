import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { AgentChat } from "@/components/agent/AgentChat";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";

interface Props { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const agent = await prisma.agent.findUnique({ where: { slug } });
  if (!agent) return { title: "Not found" };
  return { title: agent.name, description: agent.tagline };
}

export default async function AgentPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab = "chat" } = await searchParams;

  const agent = await prisma.agent.findUnique({
    where: { slug },
    include: {
      builder: true,
      _count: { select: { posts: true, follows: true } },
      posts: {
        where: { published: true },
        include: { builder: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!agent) notFound();

  // Increment views
  prisma.agent.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => {});

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Agent header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {agent.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
                  <p className="text-gray-500 mt-0.5">{agent.tagline}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {agent.repoUrl && (
                    <a href={agent.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">
                      Source
                    </a>
                  )}
                  {agent.demoUrl && (
                    <a href={agent.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">
                      Demo
                    </a>
                  )}
                  <button className="btn-primary text-xs">Follow</button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mt-3 leading-relaxed">{agent.description}</p>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <span><strong className="text-gray-700">{agent._count.posts}</strong> posts</span>
                <span><strong className="text-gray-700">{agent._count.follows}</strong> followers</span>
                <span><strong className="text-gray-700">{agent.views}</strong> views</span>
                <span>by <Link href={`/builders/${agent.builder.username}`} className="text-blue-600 hover:underline">{agent.builder.displayName}</Link></span>
              </div>

              {/* Stack */}
              {agent.stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {agent.stack.map((t: string) => (
                    <span key={t} className="tag bg-gray-100 text-gray-600">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white rounded-xl border border-gray-100 p-1 shadow-sm w-fit">
          <Link
            href={`/agents/${slug}?tab=chat`}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === "chat" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            💬 Chat with agent
          </Link>
          <Link
            href={`/agents/${slug}?tab=posts`}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === "posts" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            📝 Posts ({agent._count.posts})
          </Link>
        </div>

        {/* Tab content */}
        {tab === "chat" ? (
          <div className="card overflow-hidden">
            {agent.isLive ? (
              <AgentChat agentId={agent.id} agentName={agent.name} systemPrompt={agent.systemPrompt ?? ""} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-4">🤖</div>
                <h3 className="font-semibold text-gray-800 mb-1">Chat not available</h3>
                <p className="text-sm text-gray-500 max-w-xs">The builder hasn't enabled live chat for this agent yet.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {agent.posts.length > 0 ? agent.posts.map((post: any) => (
              <Link key={post.id} href={`/agents/${slug}/posts/${post.slug}`} className="card p-5 block hover:border-blue-200 transition-colors group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="tag bg-blue-50 text-blue-600">{post.type}</span>
                  <span className="text-xs text-gray-400">{timeAgo(new Date(post.createdAt))}</span>
                  <span className="text-xs text-gray-400">· {post.readingTime} min read</span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">{post.title}</h3>
                {post.subtitle && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{post.subtitle}</p>}
              </Link>
            )) : (
              <div className="card p-12 text-center">
                <p className="text-gray-400 mb-3">No posts yet for this agent.</p>
                <Link href="/write" className="btn-primary text-sm">Write first post</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
