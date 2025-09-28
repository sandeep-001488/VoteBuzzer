"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserMinus, Check, X } from "lucide-react";

export default function ParticipantsList({ students, onKickStudent }) {
  if (!students || students.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No students connected yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map((student) => (
        <div
          key={student.sessionId}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                {student.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{student.name}</div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={student.connected ? "secondary" : "outline"}
                  className={
                    student.connected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }
                >
                  {student.connected ? "Online" : "Offline"}
                </Badge>
                {student.answered ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="w-3 h-3" />
                    <span className="text-xs">Answered</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400">
                    <X className="w-3 h-3" />
                    <span className="text-xs">Not answered</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onKickStudent(student.sessionId)}
            className="text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <UserMinus className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
