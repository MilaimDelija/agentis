import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const builder = await prisma.builder.findUnique({ where: { email: session.user.email } });
  if (!builder) return NextResponse.json({ error: "Builder not found" }, { status: 400 });

  const { name, tagline, description, category, demoUrl, repoUrl, systemPrompt, isLive, stack, tags } = await req.json();
  if (!name || !tagline || !description || !category) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  let slug = slugify(name);
  const existing = await prisma.agent.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const agent = await prisma.agent.create({
    data: { slug, name: name.trim(), tagline: tagline.trim(), description: description.trim(), category, demoUrl: demoUrl || null, repoUrl: repoUrl || null, systemPrompt: systemPrompt || null, isLive: isLive ?? false, stack: stack ?? [], tags: tags ?? [], builderId: builder.id },
  });
  return NextResponse.json(agent, { status: 201 });
}

export async function GET() {
  const agents = await prisma.agent.findMany({
    include: { builder: true, _count: { select: { posts: true, follows: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(agents);
}
