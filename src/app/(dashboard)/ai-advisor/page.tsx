"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { askAdvisor } from "@/app/actions/advisor";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  { text: "How do I write a good SOP?", icon: "FileText" },
  { text: "How to prep for IELTS?", icon: "BookOpen" },
  { text: "Can I get a scholarship with low CGPA?", icon: "GraduationCap" },
  { text: "Fully-funded options in Germany?", icon: "MapPin" },
];

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your ScholarX AI Advisor. I can help you search for scholarships, review your profile, plan your preparation timeline, and offer advice on your SOP or CV. What would you like to discuss today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askAdvisor("user-session", updatedMessages);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an issue connecting. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">AI Advisor</h1>
        <p className="text-muted-foreground mt-1">Get personalized guidance, profile feedback, and application strategies from our AI expert.</p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
        {/* Main Chat Panel */}
        <Card className="flex-1 flex flex-col h-full overflow-hidden border border-border/80 bg-card/60 backdrop-blur-md">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            <AnimatePresence initial={false}>
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[85%] ${
                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                      m.role === "user"
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-secondary/20 border-secondary/30 text-secondary"
                    }`}
                  >
                    <Icon name={m.role === "user" ? "User" : "Bot"} size={16} />
                  </div>
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                        : "bg-muted text-foreground border border-border/40 rounded-tl-none prose dark:prose-invert max-w-none"
                    }`}
                  >
                    {/* Render markdown headers/lists simply */}
                    {m.content.split("\n").map((line, lIdx) => {
                      if (line.startsWith("### ")) {
                        return <h3 key={lIdx} className="font-bold text-base mt-2 mb-1">{line.replace("### ", "")}</h3>;
                      }
                      if (line.startsWith("* ")) {
                        return <li key={lIdx} className="ml-4 list-disc">{line.replace("* ", "")}</li>;
                      }
                      if (line.match(/^\d+\./)) {
                        return <li key={lIdx} className="ml-4 list-decimal">{line.replace(/^\d+\.\s*/, "")}</li>;
                      }
                      return <p key={lIdx} className={line.trim() === "" ? "h-2" : "mb-1"}>{line}</p>;
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-secondary/20 border-secondary/30 text-secondary">
                  <Icon name="Bot" size={16} />
                </div>
                <div className="bg-muted text-foreground border border-border/40 rounded-2xl rounded-tl-none p-4 text-sm flex items-center gap-2">
                  <Icon name="Loader" className="animate-spin text-primary" size={16} />
                  <span>AI Counselor is drafting a response...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions Panel */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Suggested Questions:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.text)}
                    className="flex items-center gap-3 p-3 text-left text-xs bg-muted/40 hover:bg-muted/80 border border-border/50 rounded-xl transition-all hover:scale-[1.01]"
                  >
                    <Icon name={item.icon} size={16} className="text-primary" />
                    <span className="font-medium truncate">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="p-4 border-t border-border/60 bg-muted/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about SOP review, scholarship deadlines, exam preparations..."
                disabled={isLoading}
                className="bg-background h-12 flex-1 rounded-xl focus:ring-1 border-border/80"
              />
              <Button type="submit" variant="premium" className="h-12 px-6 rounded-xl" disabled={isLoading}>
                <Icon name="Send" size={18} />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
