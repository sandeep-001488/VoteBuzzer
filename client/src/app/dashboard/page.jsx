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
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";

function DashboardContent() {
  const [history, setHistory] = useState({ asTeacher: [], asStudent: [] });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600 truncate">
              Welcome, {user?.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-indigo-100 bg-white p-4 space-y-2">
            <Button
              onClick={() => {
                goToTeacherDashboard();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm"
              size="sm"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Create Poll
            </Button>
            <Button
              onClick={() => {
                goToStudentPage();
                setMobileMenuOpen(false);
              }}
              variant="outline"
              className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-sm"
              size="sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Join Poll
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-sm"
              size="sm"
            >
              Logout
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
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

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <GraduationCap className="h-6 w-6 lg:h-8 lg:w-8 text-indigo-600 flex-shrink-0" />
                <div className="ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">
                    Sessions Conducted
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">
                    {history.asTeacher.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
                <div className="ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">
                    Sessions Joined
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">
                    {history.asStudent.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
                <div className="ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">
                    Total Sessions
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">
                    {history.asTeacher.length + history.asStudent.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs - Mobile Optimized */}
        <Tabs defaultValue="teacher" className="space-y-4 lg:space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm h-auto">
            <TabsTrigger
              value="teacher"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs lg:text-sm py-2 lg:py-3 px-2 lg:px-4"
            >
              <span className="hidden sm:inline">Sessions I've Conducted</span>
              <span className="sm:hidden">Conducted</span>
              <span className="ml-1">({history.asTeacher.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="student"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs lg:text-sm py-2 lg:py-3 px-2 lg:px-4"
            >
              <span className="hidden sm:inline">Sessions I've Joined</span>
              <span className="sm:hidden">Joined</span>
              <span className="ml-1">({history.asStudent.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teacher" className="space-y-3 lg:space-y-4">
            {history.asTeacher.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="text-center py-8 lg:py-12 px-4">
                  <GraduationCap className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
                    No Sessions Conducted Yet
                  </h3>
                  <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6">
                    Start creating polls and conducting sessions to see your
                    teaching history here.
                  </p>
                  <Button
                    onClick={goToTeacherDashboard}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm lg:text-base"
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
                  <CardContent className="p-4 lg:p-6">
                    <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
                      {/* Session Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 lg:gap-4 mb-2">
                          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 truncate flex-1">
                            {session.pollId?.title ||
                              session.title ||
                              "Untitled Poll"}
                          </h3>
                          <Badge
                            variant={session.endedAt ? "secondary" : "default"}
                            className={
                              session.endedAt
                                ? "bg-gray-100 text-gray-800 text-xs"
                                : "bg-green-100 text-green-800 text-xs"
                            }
                          >
                            {session.endedAt ? "Completed" : "In Progress"}
                          </Badge>
                        </div>

                        <div className="text-xs lg:text-sm text-gray-600 space-y-1">
                          <p className="flex items-center">
                            <Calendar className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1 lg:mr-2 text-indigo-600 flex-shrink-0" />
                            <span className="truncate">
                              Created:{" "}
                              {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                          </p>
                          {session.endedAt && (
                            <p className="flex items-center">
                              <Calendar className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1 lg:mr-2 text-green-600 flex-shrink-0" />
                              <span className="truncate">
                                Ended:{" "}
                                {new Date(session.endedAt).toLocaleDateString()}
                              </span>
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-2">
                            <span className="flex items-center text-blue-600 text-xs lg:text-sm">
                              <Users className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                              {session.participantCount || 0} participants
                            </span>
                            <span className="flex items-center text-purple-600 text-xs lg:text-sm">
                              <BookOpen className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                              {session.questionsCompleted || 0} questions
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDetails(session.historyId)}
                          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs lg:text-sm flex-1 lg:flex-none"
                        >
                          <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                          <span className="lg:inline">View</span>
                        </Button>
                        {session.endedAt && session.questionsCompleted > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportResults(session.historyId)}
                            className="border-green-200 text-green-700 hover:bg-green-50 text-xs lg:text-sm flex-1 lg:flex-none"
                          >
                            <Download className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                            <span className="lg:inline">Export</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="student" className="space-y-3 lg:space-y-4">
            {history.asStudent.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="text-center py-8 lg:py-12 px-4">
                  <Users className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
                    No Sessions Joined Yet
                  </h3>
                  <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6">
                    Join polling sessions to participate and see your
                    participation history here.
                  </p>
                  <Button
                    onClick={goToStudentPage}
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-sm lg:text-base"
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
                  <CardContent className="p-4 lg:p-6">
                    <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
                      {/* Session Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 lg:gap-4 mb-2">
                          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 truncate flex-1">
                            {session.pollId?.title ||
                              session.title ||
                              "Untitled Poll"}
                          </h3>
                          <Badge
                            variant={session.endedAt ? "secondary" : "default"}
                            className={
                              session.endedAt
                                ? "bg-gray-100 text-gray-800 text-xs"
                                : "bg-green-100 text-green-800 text-xs"
                            }
                          >
                            {session.endedAt ? "Completed" : "In Progress"}
                          </Badge>
                        </div>

                        <div className="text-xs lg:text-sm text-gray-600 space-y-1">
                          <p className="flex items-center">
                            <Users className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1 lg:mr-2 text-purple-600 flex-shrink-0" />
                            <span className="truncate">
                              Conducted by:{" "}
                              {session.teacherId?.name || "Unknown"}
                            </span>
                          </p>
                          <p className="flex items-center">
                            <Calendar className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1 lg:mr-2 text-indigo-600 flex-shrink-0" />
                            <span className="truncate">
                              Joined:{" "}
                              {new Date(
                                session.participationDetails?.joinedAt ||
                                  session.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </p>
                          {session.endedAt && (
                            <p className="flex items-center">
                              <Calendar className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1 lg:mr-2 text-green-600 flex-shrink-0" />
                              <span className="truncate">
                                Ended:{" "}
                                {new Date(session.endedAt).toLocaleDateString()}
                              </span>
                            </p>
                          )}
                          <p className="flex items-center text-blue-600 text-xs lg:text-sm">
                            <BookOpen className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                            {session.questionsCompleted || 0} questions
                            completed
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDetails(session.historyId)}
                          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs lg:text-sm w-full lg:w-auto"
                        >
                          <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
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