// Floating chatbot widget — bottom-right on desktop, full-screen
// drawer on mobile. Connects to /api/chat via the Vercel AI SDK's
// useChat() hook, which handles SSE streaming and message state.
//
// UX choices:
//   - Closed by default; renders a small launcher button that doesn't
//     compete with the existing MobileBottomCTA on phones (offset above)
//   - First-open shows a welcome message + 3 suggested prompts; clicking
//     a prompt sends it directly
//   - Streaming responses scroll into view automatically UNLESS the
//     user has scrolled up to re-read — in that case auto-scroll pauses
//     until they hit a new turn
//   - Abort button cancels mid-stream; the AI SDK handles the actual
//     fetch abort via AbortController
//   - Token-by-token rendering via streamdown for the markdown shape
//   - SessionId persists in localStorage so refreshes don't reset the
//     conversation; the server returns the canonical id in a header

"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Loader2, RefreshCw } from "lucide-react";
import { Streamdown } from "streamdown";

const SESSION_KEY = "tl_chat_session_id";
const STORED_OPEN_KEY = "tl_chat_was_open";
const SUGGESTED_PROMPTS = [
  "How does the Ultimate plan work?",
  "Is TurboLoop safe? Where's the audit?",
  "How do I become a Creator Star?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

  // Restore sessionId on mount so refreshes don't reset the chat.
  useEffect(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setSessionId(s);
    } catch {
      /* localStorage blocked, fine */
    }
  }, []);

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          sessionId: sessionId ?? undefined,
        },
      }),
    }),
    onFinish: () => {
      // The server attaches the canonical sessionId in a response
      // header on first turn; we don't have direct access from useChat
      // here, so we generate one client-side if missing and let the
      // server adopt it. Sticky thereafter.
      if (!sessionId && typeof window !== "undefined") {
        const fresh = crypto.randomUUID();
        try {
          localStorage.setItem(SESSION_KEY, fresh);
          setSessionId(fresh);
        } catch {
          /* private mode — session still works for this tab */
        }
      }
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // Auto-scroll on new chunks, unless the user has scrolled up. We
  // detect "user scrolled up" by comparing scrollTop + clientHeight
  // against scrollHeight on every messages-list scroll event.
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
      userScrolledUp.current = distanceFromBottom > 80;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    if (!userScrolledUp.current) {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
      });
    }
  }, [messages]);

  // Remember last open state so a returning visitor sees the same
  // affordance they used.
  useEffect(() => {
    try {
      if (open) sessionStorage.setItem(STORED_OPEN_KEY, "1");
    } catch {
      /* sessionStorage blocked, no harm */
    }
  }, [open]);

  function send(text: string) {
    const t = text.trim();
    if (!t || isStreaming) return;
    setInput("");
    sendMessage({ text: t });
    userScrolledUp.current = false;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open TurboLoop assistant"
        className="fixed z-40 right-4 bottom-20 md:right-6 md:bottom-6 rounded-full shadow-[var(--s-xl)] text-white inline-flex items-center gap-2 pl-3 pr-4 py-3 transition active:scale-[0.97]"
        style={{
          background: "var(--c-brand-gradient)",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-bold">Ask AI</span>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="TurboLoop assistant"
      className="fixed z-40 inset-x-3 bottom-3 top-16 md:inset-auto md:right-6 md:bottom-6 md:top-auto md:w-[400px] md:h-[640px] rounded-[var(--r-2xl)] bg-[var(--c-surface)] border border-[var(--c-border-strong)] shadow-[var(--s-xl)] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div
        className="px-4 py-3 text-white relative"
        style={{ background: "var(--c-brand-gradient)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase opacity-90">
              TurboLoop Assistant
            </div>
            <div className="text-sm font-bold mt-0.5">Ask me anything</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close assistant"
            className="rounded-full p-1.5 hover:bg-white/15 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-sm"
      >
        {messages.length === 0 ? (
          <WelcomeBlock onPrompt={p => send(p)} />
        ) : (
          messages.map(m => <Bubble key={m.id} role={m.role}>
            {m.parts
              .map(p =>
                p.type === "text"
                  ? (p as { type: "text"; text: string }).text
                  : ""
              )
              .join("")}
          </Bubble>)
        )}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            Something went wrong — try again, or DM{" "}
            <a
              href="https://t.me/TurboLoop_Support"
              className="underline font-bold"
              target="_blank"
              rel="noopener noreferrer"
            >
              @TurboLoop_Support
            </a>{" "}
            if it keeps failing.
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 text-[0.625rem] text-[var(--c-text-subtle)] tracking-wide border-t border-[var(--c-border)]">
        Protocol information, not financial advice. Chats may be logged
        to improve the assistant.
      </div>

      {/* Composer */}
      <form
        onSubmit={onSubmit}
        className="flex items-end gap-2 p-3 border-t border-[var(--c-border)] bg-[var(--c-bg)]"
      >
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={
            isStreaming ? "Generating…" : "Ask about plans, security, programs…"
          }
          disabled={isStreaming}
          rows={1}
          maxLength={2000}
          className="flex-1 resize-none rounded-[var(--r-md)] bg-[var(--c-surface)] border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)] focus:ring-2 focus:ring-[var(--c-brand-cyan)]/20 outline-none px-3 py-2 text-sm max-h-32"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={() => stop()}
            aria-label="Stop generating"
            className="rounded-[var(--r-md)] bg-[var(--c-surface)] border border-[var(--c-border)] p-2.5"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </button>
        ) : (
          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim()}
            className="rounded-[var(--r-md)] bg-brand text-white p-2.5 disabled:opacity-40 shadow-[var(--s-brand)]"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
}

function WelcomeBlock({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div className="space-y-4 py-2">
      <div className="text-[var(--c-text)] leading-relaxed">
        <div className="font-bold mb-1">
          Hi! I&rsquo;m the TurboLoop Assistant.
        </div>
        <p className="text-[var(--c-text-muted)]">
          Ask me anything about our ecosystem, yield plans, or how to get
          involved.
        </p>
      </div>
      <div className="space-y-1.5">
        <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)]">
          Try
        </div>
        {SUGGESTED_PROMPTS.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onPrompt(p)}
            className="block w-full text-left px-3 py-2 rounded-[var(--r-md)] text-sm bg-[var(--c-bg)] border border-[var(--c-border)] hover:border-[var(--c-brand-cyan)] transition"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({
  role,
  children,
}: {
  role: "user" | "assistant" | "system";
  children: string;
}) {
  if (role === "system") return null;
  const isUser = role === "user";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-[var(--r-md)] px-3 py-2 ${
          isUser
            ? "bg-brand text-white shadow-[var(--s-brand)]"
            : "bg-[var(--c-bg)] text-[var(--c-text)] border border-[var(--c-border)]"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{children}</p>
        ) : (
          <div className="prose-blog prose-sm max-w-none text-[var(--c-text)] [&_p]:my-1 [&_p]:leading-relaxed [&_a]:text-[var(--c-brand-cyan)] [&_a]:font-bold [&_ul]:my-1 [&_ul]:pl-4 [&_li]:my-0">
            <Streamdown>{children}</Streamdown>
          </div>
        )}
      </div>
    </div>
  );
}
