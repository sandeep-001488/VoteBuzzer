"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PollForm from "@/components/PollForm";
import ParticipantsList from "@/components/ParticipantsList";
import ResultsChart from "@/components/ResultsChart";
import ChatPopup from "@/components/ChatPopup";
import TimerDisplay from "@/components/TimerDisplay";
import socketManager from "@/lib/socket";
import apiClient from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

function TeacherDashboardContent() {
  const [activeTab, setActiveTab] = useState("create");
  const [activePoll, setActivePoll] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [results, setResults] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [polls, setPolls] = useState([]);
  const [askedQuestions, setAskedQuestions] = useState(new Set());
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  const { user, token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      const socket = socketManager.connect(token);
      apiClient.setToken(token);

      // Session control events
      socket.on("server:questionStarted", (data) => {
        setAskedQuestions((prev) => new Set(prev).add(data.questionId));
        setTimeLeft(data.timeLeftSec);
      });

      socket.on("server:sessionCompleted", (data) => {
        setSessionCompleted(true);
        setCurrentQuestion(null);
        setTimeLeft(0);
      });

      socket.on("server:sessionEnded", (data) => {
        setSessionEnded(true);
        setCurrentQuestion(null);
        setActivePoll(null);
        setCurrentSession(null);
        setTimeLeft(0);
        setResults({});
        setStudents([]);
        setAskedQuestions(new Set());
        setSessionCompleted(false);
        setTimeout(() => {
          setSessionEnded(false);
          setActiveTab("create");
        }, 3000);
      });

      socket.on("server:studentListUpdate", (data) => {
        setStudents(data.students);
      });

      socket.on("server:resultsUpdate", (data) => {
        setResults(data);
      });

      socket.on("server:resultsFinal", (data) => {
        setResults(data);
        setCurrentQuestion(null);
        setTimeLeft(0);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      loadPolls();

      return () => {
        socket.off("server:questionStarted");
        socket.off("server:sessionCompleted");
        socket.off("server:sessionEnded");
        socket.off("server:studentListUpdate");
        socket.off("server:resultsUpdate");
        socket.off("server:resultsFinal");
        socket.off("connect_error");
      };
    }
  }, [token]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const loadPolls = async () => {
    try {
      if (token) {
        apiClient.setToken(token);
      }
      const data = await apiClient.get(`/polls`);
      setPolls(data);
    } catch (error) {
      console.error("Error loading polls:", error);
    }
  };

  const handleLogout = () => {
    socketManager.disconnect();
    logout();
  };

  const handlePollCreated = (poll) => {
    setActivePoll(poll);
    setPolls((prev) => [poll, ...prev]);
    setActiveTab("manage");
  };

  const startSession = async (pollId) => {
    if (!token) return;
    const socket = socketManager.getSocket();

    socket.emit("teacher:startSession", { pollId }, (response) => {
      if (response.success) {
        setCurrentSession({
          historyId: response.historyId,
          pollId: pollId,
        });
        const poll = polls.find((p) => p._id === pollId);
        setActivePoll(poll);
        setAskedQuestions(new Set());
        setSessionCompleted(false);
        setSessionEnded(false);
        setActiveTab("manage");
      } else {
        console.error("Error starting session:", response.error);
      }
    });
  };

  const askQuestion = (question) => {
    if (!currentSession) return;

    try {
      const socket = socketManager.getSocket();
      socket.emit("teacher:askQuestion", {
        pollId: currentSession.pollId,
        historyId: currentSession.historyId,
        questionId: question.id,
        timeLimitSec: question.timeLimitSec,
      });

      setCurrentQuestion(question);
      setResults({});
    } catch (error) {
      console.error("Error asking question:", error);
    }
  };

  const endCurrentQuestion = () => {
    if (!currentSession || !currentQuestion) return;

    try {
      const socket = socketManager.getSocket();
      socket.emit("teacher:endQuestion", {
        pollId: currentSession.pollId,
        historyId: currentSession.historyId,
        questionId: currentQuestion.id,
      });
    } catch (error) {
      console.error("Error ending question:", error);
    }
  };

  const endSession = () => {
    if (!currentSession) return;

    try {
      const socket = socketManager.getSocket();
      socket.emit("teacher:endSession", {
        historyId: currentSession.historyId,
      });
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const kickStudent = (sessionId) => {
    if (!currentSession) return;

    const socket = socketManager.getSocket();
    socket.emit("teacher:kickStudent", {
      pollId: currentSession.pollId,
      historyId: currentSession.historyId,
      sessionId,
    });
  };

  const viewSessionDetails = () => {
    if (currentSession) {
      router.push(`/dashboard/history/${currentSession.historyId}`);
    }
  };

  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Session Ended!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for conducting the session. Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
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
                Teacher Dashboard
              </h1>
              <p className="text-gray-700 mt-1 font-medium">
                Welcome, {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
             
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="hover:bg-red-50 hover:text-blue-700 hover:border-blue-700"
              >
                Dashboard
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

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Create Poll
            </TabsTrigger>
            <TabsTrigger
              value="manage"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Manage Session
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="text-indigo-900">
                  Create New Poll
                </CardTitle>
                <CardDescription className="text-indigo-700">
                  Set up questions and start a new polling session
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <PollForm onPollCreated={handlePollCreated} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {!currentSession ? (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-blue-900">
                    Start a Session
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Choose a poll to start a new session
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    {polls.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                          <p>
                            No polls created yet. Create your first poll to get
                            started.
                          </p>
                        </div>
                      </div>
                    ) : (
                      polls.map((poll) => (
                        <div
                          key={poll._id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-white to-indigo-50 hover:shadow-md transition-shadow"
                        >
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {poll.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {poll.questions.length} questions
                            </p>
                          </div>
                          <Button
                            onClick={() => startSession(poll._id)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          >
                            Start Session
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                      <CardTitle className="flex items-center justify-between">
                        <div>
                          <div className="text-green-900">
                            Session Information
                          </div>
                          <div className="text-sm font-normal text-green-700 mt-1">
                            Poll ID: {currentSession.pollId}
                            <br />
                            Session ID: {currentSession.historyId}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentQuestion && (
                            <TimerDisplay timeLeft={timeLeft} />
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex gap-2 mb-4">
                          {currentQuestion && (
                            <Button
                              onClick={endCurrentQuestion}
                              variant="destructive"
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              End Current Question
                            </Button>
                          )}
                        
                          {(sessionCompleted ||
                            askedQuestions.size ===
                              activePoll?.questions?.length) && (
                            <Button
                              onClick={endSession}
                              variant="destructive"
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              End Session
                            </Button>
                          )}
                        </div>

                        {activePoll?.questions?.map((question) => {
                          const isAsked = askedQuestions.has(question.id);
                          const isActive = currentQuestion?.id === question.id;

                          return (
                            <div
                              key={question.id}
                              className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                                isActive
                                  ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-300"
                                  : isAsked
                                  ? "bg-gray-50 border-gray-300"
                                  : "bg-white border-indigo-200 hover:shadow-md"
                              }`}
                            >
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {question.text}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {question.options.length} options •{" "}
                                  {question.timeLimitSec}s limit
                                  {isAsked && (
                                    <span className="text-blue-600 ml-2 font-medium">
                                      • Asked
                                    </span>
                                  )}
                                </p>
                              </div>
                              <Button
                                onClick={() => askQuestion(question)}
                                disabled={isAsked || !!currentQuestion}
                                variant={
                                  isActive
                                    ? "secondary"
                                    : isAsked
                                    ? "outline"
                                    : "default"
                                }
                                className={
                                  isActive
                                    ? "bg-green-100 text-green-800"
                                    : !isAsked && !currentQuestion
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                    : ""
                                }
                              >
                                {isActive
                                  ? "Active"
                                  : isAsked
                                  ? "Asked"
                                  : "Ask"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {currentQuestion &&
                    results &&
                    Object.keys(results.tallies || {}).length > 0 && (
                      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                          <CardTitle className="text-purple-900">
                            Live Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <ResultsChart
                            question={currentQuestion}
                            results={results}
                            isTeacher={true}
                          />
                        </CardContent>
                      </Card>
                    )}
                </div>

                <div>
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                      <CardTitle className="text-orange-900">
                        Participants ({students.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ParticipantsList
                        students={students}
                        onKickStudent={kickStudent}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {currentSession && (
          <ChatPopup
            pollId={currentSession.pollId}
            historyId={currentSession.historyId}
            userName={user?.name || "Teacher"}
          />
        )}
      </div>
    </div>
  );
}

export default function TeacherPage() {
  return (
    <AuthGuard requiredRole="teacher">
      <TeacherDashboardContent />
    </AuthGuard>
  );
}
