"use client";

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { Send, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { handleChatMessage, handleFeedback, type ChatMessage } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

// Define message types including feedback state
interface DisplayMessage extends ChatMessage {
  id: number;
  feedback?: 'positive' | 'negative' | null;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = () => {
    if (!input.trim() || isPending) return;

    const newUserMessage: DisplayMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);
    const currentInput = input;
    setInput('');

    startTransition(async () => {
      try {
        const history = messages.map(({ role, content }) => ({ role, content }));
        const response = await handleChatMessage(currentInput, history);
        const newModelMessage: DisplayMessage = { id: Date.now() + 1, role: 'model', content: response, feedback: null };
        setMessages(prev => [...prev, newModelMessage]);
      } catch (error) {
        console.error("Failed to send message:", error);
        const errorMessage: DisplayMessage = { id: Date.now() + 1, role: 'model', content: "Sorry, I couldn't get a response. Please try again.", feedback: null };
        setMessages(prev => [...prev, errorMessage]);
      }
    });
  };

  const submitFeedback = (messageId: number, feedbackType: 'positive' | 'negative') => {
    startTransition(async () => {
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1 || messages[messageIndex].role !== 'model') return;

      // Update UI optimistically
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, feedback: feedbackType } : msg));

      const feedbackContent = feedbackType === 'positive' ? "Good response" : "Bad response";
      // Find the relevant part of the chat history up to this message
      const relevantHistory = messages.slice(0, messageIndex + 1).map(({ role, content }) => ({ role, content }));

      try {
        const feedbackResponse = await handleFeedback(feedbackContent, relevantHistory);
        toast({
          title: "Feedback Submitted",
          description: feedbackResponse,
        });
        // Note: The UI is already updated optimistically. If the backend failed,
        // you might want to revert the UI change here, but for simplicity, we'll leave it.
      } catch (error) {
        console.error("Failed to submit feedback:", error);
        toast({
          title: "Feedback Error",
          description: "Could not submit feedback. Please try again.",
          variant: "destructive",
        });
        // Revert optimistic UI update on error
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, feedback: null } : msg));
      }
    });
  };


  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-secondary p-4">
      <Card className="w-full max-w-2xl shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-lg font-semibold">Carmate AI Assistant</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'model' && (
                    <Avatar className="w-8 h-8 border">
                      <AvatarImage src="https://picsum.photos/seed/carmate/40/40" alt="Carmate AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[75%] rounded-lg p-3 shadow-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'model' && message.feedback === null && ( // Only show feedback buttons if feedback hasn't been given
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-green-500"
                          onClick={() => submitFeedback(message.id, 'positive')}
                          disabled={isPending}
                          aria-label="Good response"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-red-500"
                          onClick={() => submitFeedback(message.id, 'negative')}
                          disabled={isPending}
                          aria-label="Bad response"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                     {message.role === 'model' && message.feedback !== null && ( // Show indication if feedback was given
                       <div className="mt-1">
                         {message.feedback === 'positive' ? (
                            <ThumbsUp className="h-4 w-4 text-green-500 inline-block" />
                         ) : (
                            <ThumbsDown className="h-4 w-4 text-red-500 inline-block" />
                         )}
                       </div>
                     )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 border">
                      <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isPending && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 border">
                    <AvatarImage src="https://picsum.photos/seed/carmate/40/40" alt="Carmate AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-muted text-muted-foreground shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <div className="flex w-full items-center gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ask about cars..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isPending}
              className="flex-1"
              aria-label="Chat input"
            />
            <Button
              onClick={sendMessage}
              disabled={isPending || !input.trim()}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              aria-label="Send message"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
