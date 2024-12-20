"use client";

import FileGenerator from "./components/FileGenerator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <FileGenerator/>
    </main>
  );
}
