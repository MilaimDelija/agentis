"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const builder = (session as any)?.builder;
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">Agentis</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="btn-ghost text-sm">Feed</Link>
          <Link href="/explore" className="btn-ghost text-sm">Explore agents</Link>
        </div>

        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          ) : session ? (
            <>
              <Link href="/write" className="btn-primary text-sm">Write</Link>
              <div className="relative">
                <button onClick={() => setOpen(!open)}>
                  {builder?.avatarUrl
                    ? <Image src={builder.avatarUrl} alt="" width={32} height={32} className="rounded-full ring-2 ring-gray-100" />
                    : <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">{(builder?.displayName ?? "?")[0]}</div>
                  }
                </button>
                {open && (
                  <div className="absolute right-0 top-10 card py-1 w-52 z-50">
                    <Link href={`/builders/${builder?.username}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>Profile</Link>
                    <Link href="/agents/new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>Register agent</Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => signOut()} className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">Sign out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => signIn("github")} className="btn-ghost text-sm">Sign in</button>
              <button onClick={() => signIn("github")} className="btn-primary text-sm">Get started</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
