import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Darth Maul",
};

export default function DarthMaulPage() {
  return (
    <main className="flex-1 grid place-items-center bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/darth-maul.gif"
        alt="Darth Maul"
        className="max-h-screen max-w-full object-contain"
      />
    </main>
  );
}
