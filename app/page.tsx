"use client"; // 关键：必须添加这一行，将页面标记为客户端组件

import dynamic from "next/dynamic";

const TerminalBox = dynamic(() => import("./components/Terminal"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#1a1b26] text-white font-mono">
      Loading Terminal...
    </div>
  ),
});

export default function WebTerminalPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <div className="flex flex-col h-full">
        <header className="bg-[#16161e] border-b border-[#3b4261] p-2 px-4 text-xs text-[#7aa2f7] flex justify-between">
          <span>toyDB Web Console</span>
          <span className="opacity-50">Localhost:8080</span>
        </header>
        <div className="flex-1 overflow-hidden">
          <TerminalBox />
        </div>
      </div>
    </main>
  );
}