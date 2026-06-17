import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import { timeAgo, CATEGORIES } from "@/lib/utils";

export default async function HomePage() {
  const [posts, agents] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      include: { builder: true, agent: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.agent.findMany({
      include: { _count: { select: { posts: true, follows: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">

          {/* Feed */}
          <main className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-gray-200 mb-6">
              {["Latest", "Trending", "Following"].map((t, i) => (
                <button key={t} className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${i === 0 ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                  {t}
                </button>
              ))}
            </div>

            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post: any) => (
                  <Link
                    key={post.id}
                    href={post.agent ? `/agents/${post.agent.slug}/posts/${post.slug}` : `/posts/${post.slug}`}
                    className="card p-5 block hover:border-blue-200 transition-all group"
                  >
                    {/* Author */}
                    <div className="flex items-center gap-2 mb-3">
                      {post.builder.avatarUrl
                        ? <Image src={post.builder.avatarUrl} alt="" width={20} height={20} className="rounded-full" />
                        : <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">{post.builder.displayName[0]}</div>
                      }
                      <span className="text-sm text-gray-600 font-medium">{post.builder.displayName}</span>
                      {post.agent && (
                        <><span className="text-gray-300">in</span>
                        <span className="text-sm text-blue-600 font-medium">{post.agent.name}</span></>
                      )}
                      <span className="text-gray-300 ml-auto text-xs">{timeAgo(new Date(post.createdAt))}</span>
                    </div>

                    <h2 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-blue-600 transition-colors mb-1">
                      {post.title}
                    </h2>
                    {post.subtitle && <p className="text-gray-500 text-sm line-clamp-2">{post.subtitle}</p>}

                    <div className="flex items-center gap-3 mt-3">
                      <span className="tag bg-blue-50 text-blue-600 text-xs">{post.type}</span>
                      <span className="text-xs text-gray-400">{post.readingTime} min read</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card p-16 text-center">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="font-bold text-gray-800 text-xl mb-2">No posts yet</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                  Be the first — register your AI agent and write about it.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/agents/new" className="btn-primary">Register agent</Link>
                  <Link href="/write" className="btn-secondary">Write post</Link>
                </div>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-5">

            {/* Trending agents */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Trending agents</h3>
              {agents.length > 0 ? (
                <div className="space-y-4">
                  {agents.map((agent: any) => (
                    <Link key={agent.id} href={`/agents/${agent.slug}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {agent.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">{agent.name}</p>
                        <p className="text-xs text-gray-400 truncate">{agent.tagline}</p>
                        <p className="text-xs text-gray-300">{agent._count.posts} posts · {agent._count.follows} followers</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No agents yet. <Link href="/agents/new" className="text-blue-600 hover:underline">Be first.</Link></p>
              )}
              <Link href="/explore" className="block mt-4 text-xs text-blue-600 hover:underline">Explore all agents →</Link>
            </div>

            {/* Topics */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Browse by topic</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <Link key={cat} href={`/explore?category=${cat}`} className="tag bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">{cat}</Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="card p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <h3 className="font-semibold text-gray-800 mb-1">Built an AI agent?</h3>
              <p className="text-sm text-gray-500 mb-4">Register it, write about it, let people chat with it.</p>
              <Link href="/agents/new" className="btn-primary w-full justify-center text-sm">Register your agent →</Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
