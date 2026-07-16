"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Global easter egg: a click anywhere on the page navigates to /darth-maul.
 * Uses the capture phase so it fires even when an element stops propagation.
 * Disabled on the darth-maul page itself so it doesn't loop.
 */
export default function ClickToMaul() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/darth-maul") return;
    const handler = () => router.push("/darth-maul");
    window.addEventListener("click", handler, true);
    return () => window.removeEventListener("click", handler, true);
  }, [pathname, router]);

  return null;
}
