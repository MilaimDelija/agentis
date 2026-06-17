import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/utils";

interface Props { searchParams: Promise<{ category?: string; q?: string }> }

export default async function ExplorePage({ searchParams }: Props) {
  const { category, q } = await searchParams;
  const agents = await prisma.agent.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { tagline: { contains: q, mode: "insensitive" } }] } : {}),
    },
    include: { builder: true, _count: { select: { posts: true, follows: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Explore agents</h1>
          <Link href="/agents/new" className="btn-primary">Register agent</Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[null, ...CATEGORIES].map(cat => (
            <Link key={cat ?? "all"} href={cat ? `/explore?category=${cat}` : "/explore"}
              className={`tag transition-colors ${(category ?? null) === cat ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"}`}>
              {cat ?? "All"}
            </Link>
          ))}
        </div>

        {agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent: any) => (
              <Link key={agent.id} href={`/agents/${agent.slug}`} className="card p-5 hover:border-blue-200 transition-all group block">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {agent.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{agent.name}</p>
                    <p className="text-sm text-gray-500 truncate">{agent.tagline}</p>
                  </div>
                  {agent.isLive && <span className="tag bg-green-100 text-green-700 flex-shrink-0 ml-auto">Live</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{agent._count.posts} posts</span>
                  <span>·</span><span>{agent._count.follows} followers</span>
                  <span>·</span><span>{agent.category}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-16 text-center">
            <p className="text-gray-400 mb-4">No agents found.</p>
            <Link href="/agents/new" className="btn-primary">Register the first one →</Link>
          </div>
        )}
      </div>
    </>
  );
}
