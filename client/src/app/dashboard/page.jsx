"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Download,
  Users,
  Calendar,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";

function DashboardContent() {
  const [history, setHistory] = useState({ asTeacher: [], asStudent: [] });
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
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
      console.log(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (historyId) => {
    router.push(`/dashboard/history/${historyId}`);
  };

  const exportResults = (historyId) => {
    window.open(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/export/${historyId}`,
      "_blank"
    );
  };

  const goToTeacherDashboard = () => {
    router.push("/teacher");
  };

  const goToStudentPage = () => {
    router.push("/student");
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-700 mt-1 font-medium">
                Welcome back, {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={goToTeacherDashboard}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
              <Button
                onClick={goToStudentPage}
                variant="outline"
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Poll
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-700 hover:border-red-200"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Sessions Conducted
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {history.asTeacher.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Sessions Joined
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {history.asStudent.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Sessions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {history.asTeacher.length + history.asStudent.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="teacher" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
            <TabsTrigger
              value="teacher"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Sessions I've Conducted ({history.asTeacher.length})
            </TabsTrigger>
            <TabsTrigger
              value="student"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Sessions I've Joined ({history.asStudent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teacher" className="space-y-4">
            {history.asTeacher.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Sessions Conducted Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start creating polls and conducting sessions to see your
                    teaching history here.
                  </p>
                  <Button
                    onClick={goToTeacherDashboard}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Create Your First Poll
                  </Button>
                </CardContent>
              </Card>
            ) : (
              history.asTeacher.map((session) => (
                <Card
                  key={session.historyId}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.pollId?.title ||
                              session.title ||
                              "Untitled Poll"}
                          </h3>
                          <Badge
                            variant={session.endedAt ? "secondary" : "default"}
                            className={
                              session.endedAt
                                ? "bg-gray-100 text-gray-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {session.endedAt ? "Completed" : "In Progress"}
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center">
                            <Calendar className="w-4 h-4 inline mr-2 text-indigo-600" />
                            Created:{" "}
                            {new Date(session.createdAt).toLocaleString()}
                          </p>
                          {session.endedAt && (
                            <p className="flex items-center">
                              <Calendar className="w-4 h-4 inline mr-2 text-green-600" />
                              Ended:{" "}
                              {new Date(session.endedAt).toLocaleString()}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center text-blue-600">
                              <Users className="w-4 h-4 mr-1" />
                              {session.participantCount || 0} participants
                            </span>
                            <span className="flex items-center text-purple-600">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {session.questionsCompleted || 0} questions
                              completed
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDetails(session.historyId)}
                          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {session.endedAt && session.questionsCompleted > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportResults(session.historyId)}
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="student" className="space-y-4">
            {history.asStudent.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Sessions Joined Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Join polling sessions to participate and see your
                    participation history here.
                  </p>
                  <Button
                    onClick={goToStudentPage}
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    Join Your First Session
                  </Button>
                </CardContent>
              </Card>
            ) : (
              history.asStudent.map((session) => (
                <Card
                  key={session.historyId}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.pollId?.title ||
                              session.title ||
                              "Untitled Poll"}
                          </h3>
                          <Badge
                            variant={session.endedAt ? "secondary" : "default"}
                            className={
                              session.endedAt
                                ? "bg-gray-100 text-gray-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {session.endedAt ? "Completed" : "In Progress"}
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center">
                            <Users className="w-4 h-4 inline mr-2 text-purple-600" />
                            Conducted by: {session.teacherId?.name || "Unknown"}
                          </p>
                          <p className="flex items-center">
                            <Calendar className="w-4 h-4 inline mr-2 text-indigo-600" />
                            Joined:{" "}
                            {new Date(
                              session.participationDetails?.joinedAt ||
                                session.createdAt
                            ).toLocaleString()}
                          </p>
                          {session.endedAt && (
                            <p className="flex items-center">
                              <Calendar className="w-4 h-4 inline mr-2 text-green-600" />
                              Ended:{" "}
                              {new Date(session.endedAt).toLocaleString()}
                            </p>
                          )}
                          <p className="flex items-center text-blue-600">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {session.questionsCompleted || 0} questions
                            completed
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDetails(session.historyId)}
                          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
