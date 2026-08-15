"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { sendChatMessage, type ChatMessage } from "@/app/chat/actions";

const SUGGESTED_QUESTIONS = [
  "What services do you offer?",
  "How do I sell my scrap?",
  "How do I order spare parts?",
  "How can I contact Primemet?",
];

export default function Chatbot({ enabled = true }: { enabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, startSending] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!enabled) return null;

  const handleSend = (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");

    startSending(async () => {
      const result = await sendChatMessage(messages, text);
      if (!result.success) {
        setMessages((prev) => [...prev, { role: "assistant", text: result.error }]);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", text: result.reply }]);
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="glass-card mb-3 flex h-[28rem] w-80 flex-col overflow-hidden shadow-xl sm:w-96">
          <div className="flex items-center gap-2 border-b border-card-border bg-surface px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/primemet-logo-icon.png"
              alt=""
              className="h-8 w-8 object-contain"
            />
            <span className="flex-1 text-sm font-semibold text-foreground">Mate AI</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-muted hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div>
                <p className="text-sm text-muted">
                  Hi, I&apos;m Mate AI 👋 Ask me anything about Primemet — what we do, the
                  services we offer, selling scrap, ordering spares, bulk pricing, or how to
                  get in touch.
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      disabled={isSending}
                      className="rounded-md border border-card-border bg-surface px-3 py-2 text-left text-xs text-foreground transition hover:border-teal-active hover:text-teal-active disabled:opacity-60"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "self-end bg-teal-active text-white"
                      : "self-start bg-card text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {isSending && (
                <div className="self-start rounded-lg bg-card px-3 py-2 text-sm text-muted">
                  <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-highlight" /> Thinking...
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-card-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 rounded-md border border-card-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-teal-active"
            />
            <button
              onClick={() => handleSend()}
              disabled={isSending || !input.trim()}
              className="rounded-md border border-gold bg-teal-active px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Mate AI" : "Open Mate AI"}
        className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition hover:scale-105"
      >
        {open ? (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-active text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/primemet-logo-icon.png" alt="Mate AI" className="h-16 w-16 object-contain drop-shadow-md" />
        )}
      </button>
    </div>
  );
}
