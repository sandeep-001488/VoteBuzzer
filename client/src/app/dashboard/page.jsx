// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { useAuth } from "@/contexts/AuthContext";
// import AuthGuard from "@/components/AuthGuard";

// function DashboardContent() {
//   const { user, logout } = useAuth();
//   const router = useRouter();
//   console.log(user);

//   const handleRoleSelection = (role) => {
//     if (role === "teacher") {
//       router.push("/teacher");
//     } else {
//       router.push("/student");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
//             <span className="w-2 h-2 bg-white rounded-full"></span>
//             Interactive Poll
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Welcome, {user?.name}!
//           </h1>
//           <p className="text-gray-600">
//             Choose how you'd like to use the polling system
//           </p>
//         </div>

//         <div className="space-y-4 mb-8">
//           <Card
//             className="cursor-pointer transition-all duration-200 hover:shadow-lg border-gray-200"
//             onClick={() => handleRoleSelection("student")}
//           >
//             <CardHeader className="pb-3">
//               <CardTitle className="text-lg">Join as Student</CardTitle>
//               <CardDescription>
//                 Enter session details to participate in live polls and answer
//                 questions
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card
//             className="cursor-pointer transition-all duration-200 hover:shadow-lg border-gray-200"
//             onClick={() => handleRoleSelection("teacher")}
//           >
//             <CardHeader className="pb-3">
//               <CardTitle className="text-lg">Create as Teacher</CardTitle>
//               <CardDescription>
//                 Create polls, manage sessions, and view live results from
//                 students
//               </CardDescription>
//             </CardHeader>
//           </Card>
//         </div>

//         <Button onClick={logout} variant="outline" className="w-full">
//           Logout
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default function Dashboard() {
//   return (
//     <AuthGuard>
//       <DashboardContent />
//     </AuthGuard>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Download, Users, Calendar, BookOpen } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={goToTeacherDashboard}>
                <BookOpen className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
              <Button onClick={goToStudentPage} variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Join Poll
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Sessions Taught
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {history.asTeacher.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teacher">
              Sessions I've Taught ({history.asTeacher.length})
            </TabsTrigger>
            <TabsTrigger value="student">
              Sessions I've Joined ({history.asStudent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teacher" className="space-y-4">
            {history.asTeacher.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Sessions Taught Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start creating polls and conducting sessions to see your
                    teaching history here.
                  </p>
                  {user?.role === "teacher" && (
                    <Button onClick={goToTeacherDashboard}>
                      Create Your First Poll
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              history.asTeacher.map((session) => (
                <Card key={session.historyId}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.pollId?.title || "Untitled Poll"}
                          </h3>
                          <Badge
                            variant={session.endedAt ? "secondary" : "default"}
                          >
                            {session.endedAt ? "Completed" : "In Progress"}
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Created:{" "}
                            {new Date(session.createdAt).toLocaleString()}
                          </p>
                          {session.endedAt && (
                            <p>
                              <Calendar className="w-4 h-4 inline mr-2" />
                              Ended:{" "}
                              {new Date(session.endedAt).toLocaleString()}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {session.participantCount || 0} participants
                            </span>
                            <span className="flex items-center">
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
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {session.endedAt && session.questionsCompleted > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportResults(session.historyId)}
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
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Sessions Joined Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Join polling sessions to participate and see your
                    participation history here.
                  </p>
                  <Button onClick={goToStudentPage} variant="outline">
                    Join Your First Session
                  </Button>
                </CardContent>
              </Card>
            ) : (
              history.asStudent.map((session) => (
                <Card key={session.historyId}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.pollId?.title || "Untitled Poll"}
                          </h3>
                          <Badge
                            variant={session.endedAt ? "secondary" : "default"}
                          >
                            {session.endedAt ? "Completed" : "In Progress"}
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <Users className="w-4 h-4 inline mr-2" />
                            Taught by: {session.teacherId?.name || "Unknown"}
                          </p>
                          <p>
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Joined:{" "}
                            {new Date(
                              session.participationDetails?.joinedAt ||
                                session.createdAt
                            ).toLocaleString()}
                          </p>
                          {session.endedAt && (
                            <p>
                              <Calendar className="w-4 h-4 inline mr-2" />
                              Ended:{" "}
                              {new Date(session.endedAt).toLocaleString()}
                            </p>
                          )}
                          <p className="flex items-center">
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
