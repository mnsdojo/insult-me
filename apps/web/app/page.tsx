"use client";
import { Send, Loader2, Smile, Bot, User } from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";
import {
  CardContent,
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useChat } from "~/hooks/useChat";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatUI(): JSX.Element {
  const {
    handleSubmit,
    input,
    isLoading,
    messageEndRef,
    loadingMessage,
    messages,
    placeholder,
    setInput,
  } = useChat();

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
    <div
      className={`flex items-start space-x-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      {message.role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <Bot className="w-5 h-5 text-purple-500" />
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          message.role === "user"
            ? "bg-blue-500 text-white"
            : "bg-purple-100 text-gray-800"
        }`}
      >
        {message.content}
        <div
          className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}
        >
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
      {message.role === "user" && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-500" />
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <div className="min-h-dvh flex justify-center p-4 items-center ">
        <div className="container max-w-4xl mx-auto p-4">
          <Card className="w-full border-2 border-purple-200">
            <CardHeader className="border-b border-purple-100">
              <CardTitle className="text-center text-2xl font-bold flex items-center justify-center space-x-2">
                <Smile className="w-8 h-8 text-purple-500" />
                <span>Roast Me </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4 mb-4 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    Only Start the conversation if you love ya balls! 🎭
                  </div>
                )}
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center space-x-2 text-purple-500">
                    <Loader2 className="animate-spin" />
                    <span>{loadingMessage}</span>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
            </CardContent>
            <CardFooter className="border-t border-purple-100 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2 w-full">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholder}
                  className="flex-grow border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  disabled={isLoading}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Send />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send message</p>
                  </TooltipContent>
                </Tooltip>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
