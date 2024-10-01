"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const FUNNY_PLACEHOLDERS = [
  "Time to be hilarious... or at least try 😅",
  "Warning: Dad jokes loading... 👨‍👧‍👦",
  "Puns intended, always! 🎯",
  "Knock knock... (You type who's there) 🚪",
  "Humor me with your wit! 🧠✨",
];

const LOADING_MESSAGES = [
  "Brewing some wit...",
  "Charging humor cells...",
  "Searching joke database...",
  "Consulting comedy experts...",
  "Polishing punchlines...",
];

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(
    LOADING_MESSAGES[0]
  );
  const [placeholder, setPlaceholder] = useState<string | undefined>(
    FUNNY_PLACEHOLDERS[0]
  );
  const messageEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const placeHolderInterval = setInterval(() => {
      setPlaceholder(
        FUNNY_PLACEHOLDERS[
          Math.floor(Math.random() * FUNNY_PLACEHOLDERS.length)
        ]
      );
    }, 3000);

    const loadingInterval = setInterval(() => {
      if (isLoading) {
        setLoadingMessage(
          LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
        );
      }
    }, 1500);
    return () => {
      clearInterval(placeHolderInterval);
      clearInterval(loadingInterval);
    };
  }, [isLoading]);

  const scrollToBottom = () => {
    if (!messageEndRef.current) return;
    messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const parseStreamData = (data: string): string | null => {
    try {
      const jsonStr = data.replace(/^data: /, "").trim();
      if (jsonStr === "[DONE]") return null;

      const parsed = JSON.parse(jsonStr);
      return parsed.response || "";
    } catch (e) {
      console.error("Error parsing stream data:", e);
      return "";
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8787/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");
      const decoder = new TextDecoder();
      let acc = "";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", timestamp: new Date() },
      ]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
        for (const line of lines) {
          const parsed = parseStreamData(line);
          if (parsed !== null) {
            acc += parsed;
            setMessages((prev) => [
              ...prev.slice(0, -1),
              {
                role: "assistant",
                content: acc,
                timestamp: new Date(),
              },
            ]);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "🤖 *Beep boop* Error in my humor circuits! Let me reboot and we can try again! 🔄",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    isLoading,
    loadingMessage,
    placeholder,
    handleSubmit,
    messageEndRef,
    setInput,
  };
};
