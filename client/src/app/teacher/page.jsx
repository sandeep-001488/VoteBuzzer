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
import UserHistory from "@/components/UserHistory";

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
  const { user, token, logout } = useAuth();

  useEffect(() => {
    if (token) {
      const socket = socketManager.connect(token);
      apiClient.setToken(token);

       socket.on("server:questionStarted", (data) => {
         setAskedQuestions((prev) => new Set(prev).add(data.questionId));
         setCurrentQuestion((prev) => ({ ...prev, id: data.questionId }));
         setTimeLeft(data.timeLeftSec);
       });

      socket.on("server:sessionCompleted", (data) => {
        setCurrentSession(null);
        setCurrentQuestion(null);
        setActivePoll(null);
        setTimeLeft(0);
        setResults({});
        setStudents([]);
        setActiveTab("create");
      });

      // Socket event listeners
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

      socket.on("server:allAnswered", () => {
        // All students have answered
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      // Load existing polls
      loadPolls();

      return () => {
        socket.off("server:studentListUpdate");
        socket.off("server:questionStarted");
        socket.off("server:resultsUpdate");
        socket.off("server:resultsFinal");
        socket.off("server:allAnswered");
        socket.off("server:sessionCompleted");
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
      // Ensure token is set before making request
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
       setAskedQuestions(new Set()); // Reset asked questions
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
      setTimeLeft(question.timeLimitSec);
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

      // Clear current question immediately to prevent multiple calls
      setCurrentQuestion(null);
      setTimeLeft(0);
    } catch (error) {
      console.error("Error ending question:", error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              {currentSession && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Session: {currentSession.historyId.slice(-6)}
                </Badge>
              )}
              <Button variant="outline" onClick={handleLogout}>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Poll</TabsTrigger>
            <TabsTrigger value="manage">Manage Session</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Poll</CardTitle>
                <CardDescription>
                  Set up questions and start a new polling session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PollForm onPollCreated={handlePollCreated} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {!currentSession ? (
              <Card>
                <CardHeader>
                  <CardTitle>Start a Session</CardTitle>
                  <CardDescription>
                    Choose a poll to start a new session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {polls.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No polls created yet. Create your first poll to get
                        started.
                      </div>
                    ) : (
                      polls.map((poll) => (
                        <div
                          key={poll._id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h3 className="font-semibold">{poll.title}</h3>
                            <p className="text-sm text-gray-600">
                              {poll.questions.length} questions
                            </p>
                          </div>
                          <Button onClick={() => startSession(poll._id)}>
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div>
                          <div>Session Information</div>
                          <div className="text-sm font-normal text-gray-600 mt-1">
                            Poll ID: {currentSession.pollId}
                            <br />
                            Session ID: {currentSession.historyId}
                          </div>
                        </div>
                        {currentQuestion && (
                          <TimerDisplay timeLeft={timeLeft} />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activePoll.questions.map((question) => {
                        const isAsked = askedQuestions.has(question.id);
                        const isActive = currentQuestion?.id === question.id;

                        return (
                          <div
                            key={question.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">{question.text}</h4>
                              <p className="text-sm text-gray-600">
                                {question.options.length} options •{" "}
                                {question.timeLimitSec}s limit
                                {isAsked && (
                                  <span className="text-blue-600 ml-2">
                                    • Asked
                                  </span>
                                )}
                              </p>
                            </div>
                            <Button
                              onClick={() => askQuestion(question)}
                              disabled={isAsked || isActive}
                              variant={
                                isActive
                                  ? "secondary"
                                  : isAsked
                                  ? "outline"
                                  : "default"
                              }
                            >
                              {isActive ? "Active" : isAsked ? "Asked" : "Ask"}
                            </Button>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {currentQuestion &&
                    results &&
                    Object.keys(results.tallies || {}).length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Live Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResultsChart
                            question={currentQuestion}
                            results={results}
                          />
                        </CardContent>
                      </Card>
                    )}
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Participants ({students.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
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
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Your Polling History</CardTitle>
                <CardDescription>
                  View sessions you've created as teacher and participated as
                  student
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserHistory />
              </CardContent>
            </Card>
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
