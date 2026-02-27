"use client";

import { useState } from "react";
import { ArrowCounterClockwiseIcon, BookOpenIcon, LightbulbIcon, PaperPlaneTiltIcon, RobotIcon, SparkleIcon, TranslateIcon } from "@phosphor-icons/react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Dummy AI responses for demo purposes */
const DEMO_RESPONSES: Record<string, string> = {
  "Explain this verse": "This verse establishes the Quran as a book of guidance for the God-conscious (muttaqin). The word \"rayb\" (doubt) is negated absolutely — there is no doubt whatsoever in it. \"Huda\" (guidance) is positioned as a key attribute, but it is specifically for those who are already inclined toward piety, suggesting that guidance requires receptivity from the reader.",
  "Compare translations": "Pickthall uses \"guidance unto those who ward off (evil)\" — a defensive framing. Yusuf Ali says \"guidance sure, without doubt, to those who fear Allah\" — emphasizing certainty. The Clear Quran renders it as \"a guide for those mindful of Allah\" — the most contemporary language. The key difference is how \"muttaqin\" is translated: ward off evil vs. fear God vs. mindful of God.",
  "Key themes": "Three key themes emerge: (1) **Divine certainty** — the Book is presented without qualification or doubt; (2) **Conditional guidance** — guidance is available but requires taqwa (God-consciousness) as a prerequisite; (3) **The Book as identity** — \"dhalika al-kitab\" (that is the Book) positions the Quran as *the* definitive scripture, not merely a book among others.",
  "Related verses": "Several verses echo this theme:\n\n• **3:138** — \"This is a clear statement for humanity, a guidance and admonition for the God-conscious\"\n• **10:57** — \"O humanity! There has come to you an instruction from your Lord, a cure for what is in the hearts\"\n• **17:9** — \"This Quran guides to what is most upright\"",
};

const SUGGESTION_CHIPS = [
  { icon: SparkleIcon, label: "Explain this verse" },
  { icon: TranslateIcon, label: "Compare translations" },
  { icon: LightbulbIcon, label: "Key themes" },
  { icon: BookOpenIcon, label: "Related verses" },
];

export function AiSection() {
  const { focusedVerseKey } = usePanels();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  if (!focusedVerseKey) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
        <RobotIcon weight="duotone" className="h-6 w-6 text-muted-foreground/20" />
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Select a verse to start a contextual conversation
        </p>
      </div>
    );
  }

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response with demo data
    setTimeout(() => {
      const response = DEMO_RESPONSES[text.trim()]
        ?? `This is a placeholder response about verse ${focusedVerseKey}. When the AI integration is connected, this will provide scholarly analysis drawing from tafsir, hadith, and linguistic sources.`;
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800);
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    setIsTyping(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <RobotIcon weight="duotone" className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Discussing <span className="text-foreground">{focusedVerseKey}</span>
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Reset conversation"
          >
            <ArrowCounterClockwiseIcon weight="bold" className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center" style={{ backgroundColor: '#f5f3ff' }}>
              <SparkleIcon weight="duotone" className="h-5 w-5" style={{ color: '#8b6fc0' }} />
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 text-center max-w-[200px]">
              Ask about this verse -- meaning, context, themes, or linguistic analysis
            </p>
            {/* Suggestion chips */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => sendMessage(chip.label)}
                  className="inline-flex items-center gap-1 border border-border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-[#f5f3ff] hover:text-[#8b6fc0] transition-colors"
                >
                  <chip.icon className="h-3 w-3" weight="bold" />
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {msg.role === "assistant" && (
              <div className="shrink-0 flex h-5 w-5 items-center justify-center mt-0.5" style={{ backgroundColor: '#f5f3ff' }}>
                <RobotIcon weight="duotone" className="h-3 w-3" style={{ color: '#8b6fc0' }} />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] px-3 py-2 text-xs leading-relaxed",
                msg.role === "user"
                  ? "text-foreground"
                  : "border border-border bg-background text-foreground/90",
              )}
              style={msg.role === "user" ? { backgroundColor: '#fefce8', borderLeft: '3px solid #e8e337' } : undefined}
            >
              {msg.content.split("\n").map((line, j) => (
                <p key={j} className={j > 0 ? "mt-1.5" : ""}>
                  {line.split(/(\*\*[^*]+\*\*)/).map((part, k) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={k} className="font-semibold">
                        {part.slice(2, -2)}
                      </strong>
                    ) : (
                      part
                    ),
                  )}
                </p>
              ))}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2">
            <div className="shrink-0 flex h-5 w-5 items-center justify-center mt-0.5" style={{ backgroundColor: '#f5f3ff' }}>
              <RobotIcon weight="duotone" className="h-3 w-3" style={{ color: '#8b6fc0' }} />
            </div>
            <div className="border border-border bg-background px-3 py-2">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 bg-muted-foreground/40 animate-pulse" />
                <span className="h-1.5 w-1.5 bg-muted-foreground/40 animate-pulse [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 bg-muted-foreground/40 animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask about this verse..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className={cn(
              "p-1.5 transition-colors",
              input.trim() && !isTyping
                ? "text-foreground hover:bg-[#f5f3ff]"
                : "text-muted-foreground/30",
            )}
            style={input.trim() && !isTyping ? { backgroundColor: '#f5f3ff', color: '#8b6fc0' } : undefined}
            aria-label="Send message"
          >
            <PaperPlaneTiltIcon weight="bold" className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Re-show suggestion chips when conversation is active */}
        {messages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {SUGGESTION_CHIPS.filter((c) => !messages.some((m) => m.content === c.label)).map((chip) => (
              <button
                key={chip.label}
                onClick={() => sendMessage(chip.label)}
                className="inline-flex items-center gap-0.5 border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50 hover:border-foreground hover:text-foreground transition-colors"
              >
                <chip.icon className="h-2.5 w-2.5" weight="bold" />
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
