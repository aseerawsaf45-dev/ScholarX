"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";

export function AIAdvisorChat() {
  const { user } = useAuthStore();
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = (useChat as any)({
    api: "/api/advisor",
    body: {
      userId: user?.id,
    },
    onError: (err: any) => {
      console.error("Chat error:", err);
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="flex flex-col h-[600px] shadow-lg border-primary/20">
      <CardHeader className="bg-primary/5 rounded-t-xl pb-4">
        <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
          <span className="text-2xl">🤖</span> AI Scholarship Advisor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-10">
              <p>Hi! I'm your personal AI advisor.</p>
              <p className="text-sm">Ask me about your scholarship eligibility or for a custom study roadmap.</p>
            </div>
          )}
          {messages.map((m: any) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[80%] rounded-2xl p-4 ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground self-end ml-auto rounded-br-sm"
                  : "bg-muted text-foreground self-start mr-auto rounded-bl-sm"
              }`}
            >
              <span className="text-xs font-semibold mb-1 opacity-70">
                {m.role === "user" ? "You" : "Advisor"}
              </span>
              <div className="whitespace-pre-wrap text-sm">{m.content}</div>
              {/* Display tool calls if any (for debugging or transparency) */}
              {m.toolInvocations?.map((toolInvocation: any) => {
                const toolCallId = toolInvocation.toolCallId;
                const message = toolInvocation.state === 'result'
                  ? `Used tool: ${toolInvocation.toolName}`
                  : `Calling tool: ${toolInvocation.toolName}...`;
                return (
                  <div key={toolCallId} className="text-xs italic mt-2 opacity-50">
                    {message}
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2 bg-background z-10">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="E.g., Can I study in Germany with GPA 3.8?"
            className="flex-1 rounded-full px-4"
            disabled={isLoading || !user?.id}
          />
          <Button type="submit" disabled={isLoading || !user?.id} className="rounded-full px-6 shadow-md transition-all active:scale-95">
            {isLoading ? "..." : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
