"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { sendChatMessage, type ChatMessage } from "@/app/chat/actions";

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

  const handleSend = () => {
    const text = input.trim();
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
          <div className="flex items-center justify-between border-b border-card-border bg-surface px-4 py-3">
            <span className="text-sm font-semibold text-foreground">Primemet Assistant</span>
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
              <p className="text-sm text-muted">
                Hi! Ask me about how Primemet works — selling scrap, ordering spares, bulk
                pricing, or anything else.
              </p>
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
              onClick={handleSend}
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
        aria-label={open ? "Close chat" : "Open chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-gold bg-teal-active text-white shadow-lg transition hover:bg-emerald-deep"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path
              d="M4 4h16v12H8l-4 4V4z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
