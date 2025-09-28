"use client";

import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export default function TimerDisplay({ timeLeft }) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getTimerColor = () => {
    if (timeLeft > 30) return "bg-green-100 text-green-800";
    if (timeLeft > 10) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Badge variant="secondary" className={getTimerColor()}>
      <Clock className="w-3 h-3 mr-1" />
      {minutes}:{seconds.toString().padStart(2, "0")}
    </Badge>
  );
}
