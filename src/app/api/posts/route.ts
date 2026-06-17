import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify, estimateReadingTime } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const builder = await prisma.builder.findUnique({ where: { email: session.user.email } });
  if (!builder) return NextResponse.json({ error: "Builder not found" }, { status: 400 });

  const { title, subtitle, content, type, agentSlug, published } = await req.json();
  if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 });

  let agentId: string | null = null;
  let agent = null;
  if (agentSlug) {
    agent = await prisma.agent.findUnique({ where: { slug: agentSlug } });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    agentId = agent.id;
  }

  let slug = slugify(title);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const post = await prisma.post.create({
    data: { slug, title: title.trim(), subtitle: subtitle?.trim() || null, content: content.trim(), type: type ?? "ARTICLE", published: published ?? false, readingTime: estimateReadingTime(content), builderId: builder.id, agentId },
  });
  return NextResponse.json({ ...post, agentSlug: agent?.slug ?? null }, { status: 201 });
}
