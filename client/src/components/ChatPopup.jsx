"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import socketManager from "@/lib/socket";

export default function ChatPopup({ pollId, historyId, userName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      const socket = socketManager.getSocket();

      socket.on("chat:receive", (message) => {
        setMessages((prev) => [...prev, message]);
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      });

      socket.on("error", (error) => {
        console.error("Chat error:", error);
      });

      return () => {
        socket.off("chat:receive");
        socket.off("error");
      };
    } catch (error) {
      console.error("Socket not available for chat:", error);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !pollId || !historyId) return;

    try {
      const socket = socketManager.getSocket();
      socket.emit("chat:send", {
        pollId,
        historyId,
        from: userName,
        text: newMessage.trim(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-gradient-to-r from-purple-500 to-pink-500",
      "bg-gradient-to-r from-blue-500 to-indigo-500",
      "bg-gradient-to-r from-green-500 to-teal-500",
      "bg-gradient-to-r from-orange-500 to-red-500",
      "bg-gradient-to-r from-yellow-500 to-orange-500",
      "bg-gradient-to-r from-indigo-500 to-purple-500",
    ];
    const index = name?.length % colors.length || 0;
    return colors[index];
  };

  if (!pollId || !historyId) {
    return null;
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl z-40 transition-all duration-300 hover:scale-110"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 shadow-2xl z-50 border-0 bg-white/95 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Group Chat
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="hover:bg-red-50 hover:text-red-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col h-full pb-4 px-3">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-3 py-2">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">
                  <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg p-4">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No messages yet.</p>
                    <p className="text-xs">Start the conversation!</p>
                  </div>
                </div>
              )}
              {messages.map((message, index) => {
                const isHost = message.from.includes("(Host)");
                return (
                  <div
                    key={index}
                    className="flex items-start gap-2 animate-in slide-in-from-bottom-2 duration-300"
                  >
                    <Avatar className="h-7 w-7 flex-shrink-0 border-2 border-white shadow-sm">
                      <AvatarFallback
                        className={`${getAvatarColor(
                          message.from
                        )} text-white text-xs font-semibold`}
                      >
                        {message.from?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs font-semibold text-gray-700 truncate">
                          {message.from}
                        </div>
                        {isHost && (
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                            HOST
                          </div>
                        )}
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg px-3 py-2 shadow-sm">
                        <div className="text-sm text-gray-900 break-words whitespace-pre-wrap leading-relaxed">
                          {message.text}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(
                          message.timestamp || message.at
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex gap-2 bg-gradient-to-r from-gray-50 to-indigo-50 p-2 rounded-lg">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border-0 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                maxLength={500}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Message Counter */}
            <div className="text-xs text-gray-400 text-center mt-1">
              {newMessage.length}/500
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}