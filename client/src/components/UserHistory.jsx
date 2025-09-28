"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Download, Users, Clock } from "lucide-react";
import apiClient from "@/lib/api";

export default function UserHistory() {
  const [history, setHistory] = useState({ asTeacher: [], asStudent: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem("polling_token");
      if (token) {
        apiClient.setToken(token);
      }

      const data = await apiClient.get("/sessions/user-history");
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewSessionDetails = (historyId) => {
    router.push(`/teacher/history/${historyId}`);
  };

  const exportResults = (historyId) => {
    window.open(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/export/${historyId}`,
      "_blank"
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="teacher" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="teacher">
          As Teacher ({history.asTeacher.length})
        </TabsTrigger>
        <TabsTrigger value="student">
          As Student ({history.asStudent.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="teacher" className="space-y-4">
        {history.asTeacher.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No teaching sessions found. Create your first poll to get started!
          </div>
        ) : (
          <div className="grid gap-4">
            {history.asTeacher.map((session) => (
              <Card
                key={session._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <CardDescription>
                        Created: {formatDate(session.createdAt)}
                        {session.endedAt && (
                          <span className="ml-2">
                            • Ended: {formatDate(session.endedAt)}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant={session.endedAt ? "secondary" : "default"}>
                      {session.endedAt ? "Completed" : "Active"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {session.participants?.length || 0} participants
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {session.finishedQuestions?.length || 0} questions
                      completed
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => viewSessionDetails(session.historyId)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    {session.endedAt && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportResults(session.historyId)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="student" className="space-y-4">
        {history.asStudent.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No participation history found. Join a poll session to see your
            participation history!
          </div>
        ) : (
          <div className="grid gap-4">
            {history.asStudent.map((session) => (
              <Card
                key={session._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <CardDescription>
                        Teacher: {session.teacherId?.name}
                        <br />
                        Joined:{" "}
                        {formatDate(session.participationDetails?.joinedAt)}
                        {session.endedAt && (
                          <span className="ml-2">
                            • Session ended: {formatDate(session.endedAt)}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant={session.endedAt ? "secondary" : "default"}>
                      {session.endedAt ? "Completed" : "Active"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {session.participants?.length || 0} total participants
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {session.finishedQuestions?.length || 0} questions
                      answered
                    </div>
                  </div>

                  {session.finishedQuestions &&
                    session.finishedQuestions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Your Performance:
                        </h4>
                        {session.finishedQuestions.map((question, index) => (
                          <div
                            key={question.questionId}
                            className="bg-gray-50 rounded p-3 text-sm"
                          >
                            <div className="font-medium mb-1">
                              Q{index + 1}: {question.questionText}
                            </div>
                            <div className="text-gray-600">
                              Total responses: {question.totalVotes}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
