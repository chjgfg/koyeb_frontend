"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

export default function TerminalBox() {
    const terminalRef = useRef<HTMLDivElement>(null);
    const termInstance = useRef<Terminal | null>(null);

    useEffect(() => {
        if (!terminalRef.current || termInstance.current) return;

        // 初始化 xterm
        const term = new Terminal({
            cursorBlink: true,
            theme: {
                background: "#1a1b26", // 稍微深邃一点的深蓝色
                foreground: "#c0caf5",
            },
            fontFamily: "'Fira Code', monospace",
            fontSize: 14,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        // 给 DOM 渲染留 100ms 缓冲再计算尺寸
        setTimeout(() => fitAddon.fit(), 100);
        fitAddon.fit();
        termInstance.current = term;

        // 连接 WebSocket
        const wsUrl = "ws://comparative-amargo-cocotest-82b13864.koyeb.app/";
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            term.writeln("\x1b[1;32m●\x1b[0m Connected to Rust Backend (ws://localhost:8080)");
            term.write("\r\n$ ");
        };

        ws.onmessage = (event) => {
            console.log("收到后端消息:", event.data); // 打开浏览器控制台(F12)看看有没有这一行
            term.write(event.data);
        };

        ws.onclose = () => {
            term.writeln("\r\n\x1b[1;31m✖\x1b[0m Connection closed.");
        };

        // 处理输入
        // 在 TerminalBox 组件内定义一个局部变量记录当前行
        let currentLine = "";

        term.onData((data) => {
            if (data === "\r") { // 捕获回车
                ws.send(currentLine); // 2. 发送完整的一行
                currentLine = "";     // 3. 清空本地缓存
                // term.write("\r\n");   // 1. 前端先行换行，提升响应感
            } else if (data === "\u007f") { // 处理空格
                if (currentLine.length > 0) {
                    currentLine = currentLine.slice(0, -1);
                    term.write("\b \b");
                }
            } else {
                // 普通字符（含中文）
                currentLine += data;
                term.write(data); // 本地回显
            }
        });

        // 窗口缩放适配
        const handleResize = () => fitAddon.fit();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            ws.close();
            term.dispose();
            termInstance.current = null;
        };
    }, []);

    // return <div ref={terminalRef} className="w-full h-full p-2 bg-[#1a1b26]" />;
    return (
        <div className="w-full h-screen bg-[#1a1b26] overflow-hidden">
            <div ref={terminalRef} className="w-full h-full" />
        </div>
    );
}