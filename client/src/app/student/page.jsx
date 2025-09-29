"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import QuestionCard from "@/components/QuestionCard";
import ResultsChart from "@/components/ResultsChart";
import ChatPopup from "@/components/ChatPopup";
import TimerDisplay from "@/components/TimerDisplay";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import socketManager from "@/lib/socket";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";

function StudentPageContent() {
  const [step, setStep] = useState("join");
  const [pollId, setPollId] = useState("");
  const [historyId, setHistoryId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [results, setResults] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [joinError, setJoinError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const { user, token, logout } = useAuth();

  useEffect(() => {
    const generateSessionId = () => {
      return (
        "student-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
      );
    };
    setSessionId(generateSessionId());
  }, [pollId, historyId]);

  useEffect(() => {
    if (step !== "join" && token) {
      const socket = socketManager.connect(token);

      socket.on("server:newQuestion", (data) => {
        setCurrentQuestion(data);
        setTimeLeft(data.timeLeftSec);
        setHasAnswered(false);
        setResults(null);
        setStep("question");
      });

      socket.on("server:resultsUpdate", (data) => {
        setResults(data);
      });

      socket.on("server:resultsFinal", (data) => {
        setResults(data);
        setStep("results");
        setCurrentQuestion(null);
        setTimeLeft(0);
        setTimeout(() => setStep("waiting"), 3000);
      });

      socket.on("server:kicked", () => {
        setStep("kicked");
        socketManager.disconnect();
      });

      socket.on("server:sessionCompleted", (data) => {
        setStep("sessionCompleted");
        setCurrentQuestion(null);
        setTimeLeft(0);
      });

      socket.on("server:sessionEnded", (data) => {
        setStep("sessionEnded");
        setCurrentQuestion(null);
        setTimeLeft(0);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setJoinError("Connection failed. Please try again.");
      });

      return () => {
        socket.off("server:newQuestion");
        socket.off("server:resultsUpdate");
        socket.off("server:resultsFinal");
        socket.off("server:kicked");
        socket.off("server:sessionCompleted");
        socket.off("server:sessionEnded");
        socket.off("connect_error");
      };
    }
  }, [step, token]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const joinSession = async () => {
    if (!pollId.trim() || !historyId.trim()) {
      setJoinError("Please fill in all fields");
      return;
    }

    if (!token) {
      setJoinError("Authentication required");
      return;
    }

    try {
      const socket = socketManager.connect(token);

      socket.emit(
        "student:join",
        {
          pollId: pollId.trim(),
          historyId: historyId.trim(),
          name: user.name,
          sessionId,
        },
        (response) => {
          if (response.success) {
            setStep("waiting");
            setJoinError("");
          } else {
            setJoinError(response.error);
          }
        }
      );
    } catch (error) {
      setJoinError("Failed to connect. Please check your connection.");
    }
  };

  const submitAnswer = (optionId) => {
    if (!currentQuestion || hasAnswered) return;

    try {
      const socket = socketManager.getSocket();
      socket.emit("student:submitAnswer", {
        pollId,
        historyId,
        questionId: currentQuestion.questionId,
        optionId,
        sessionId,
      });

      setHasAnswered(true);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const leaveSession = () => {
    try {
      const socket = socketManager.getSocket();
      socket.emit("student:leave");
      socketManager.disconnect();
    } catch (error) {
      console.error("Error leaving session:", error);
    }

    resetSession();
  };

  const resetSession = () => {
    setStep("join");
    setCurrentQuestion(null);
    setResults(null);
    setHasAnswered(false);
    setTimeLeft(0);
    setPollId("");
    setHistoryId("");
  };

  const handleLogout = () => {
    socketManager.disconnect();
    logout();
  };

  // Mobile Header Component
  const MobileHeader = ({
    title,
    subtitle,
    showMenu = false,
    onBack = null,
  }) => (
    <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-40">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-600 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {showMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex-shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        )}
      </div>
      {showMenu && mobileMenuOpen && (
        <div className="border-t border-indigo-100 bg-white p-4 space-y-2">
          <Button
            variant="outline"
            onClick={() => {
              router.back();
              setMobileMenuOpen(false);
            }}
            className="w-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 border-blue-200 text-sm"
            size="sm"
          >
            Back
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
  );

  if (step === "kicked") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
        <MobileHeader title="Removed from Session" />
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="text-center py-8 lg:py-12 px-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 font-bold text-xl lg:text-2xl">
                  !
                </span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                You've been removed!
              </h2>
              <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
                The teacher has removed you from the poll system.
              </p>
              <Button
                onClick={resetSession}
                className="w-full lg:w-auto bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "sessionCompleted") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <MobileHeader title="Session Completed" />
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="text-center py-8 lg:py-12 px-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl lg:text-2xl">
                  ✓
                </span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                All Questions Completed!
              </h2>
              <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
                All questions have been asked. Please wait for the teacher to
                end the session.
              </p>
              <div className="space-y-2 lg:space-y-0 lg:space-x-2 lg:flex lg:justify-center">
                <Button
                  onClick={resetSession}
                  className="w-full lg:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Join New Session
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="w-full lg:w-auto border-green-200 text-green-700 hover:bg-green-50"
                >
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "sessionEnded") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <MobileHeader title="Session Ended" />
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="text-center py-8 lg:py-12 px-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl lg:text-2xl">
                  🎉
                </span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                Session Ended!
              </h2>
              <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
                Thank you for participating! The teacher has ended the session.
              </p>
              <div className="space-y-2 lg:space-y-0 lg:space-x-2 lg:flex lg:justify-center">
                <Button
                  onClick={resetSession}
                  className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Join New Session
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="w-full lg:w-auto border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "join") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <MobileHeader title="Join a Poll Session" showMenu={true} />

        <div className="max-w-md mx-auto p-4 lg:pt-8">
          {/* Desktop Header */}
          <div className="hidden lg:flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Interactive Poll
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Join a Poll Session
              </h1>
              <p className="text-gray-600">
                Enter the session details to participate in live polling
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="ml-4 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 border-blue-200"
              >
                Back
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="ml-4 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
              >
                Logout
              </Button>
            </div>
          </div>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur mt-4 lg:mt-0">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 lg:p-6">
              <CardTitle className="text-indigo-900 text-base lg:text-lg">
                Welcome, {user?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 lg:p-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Poll ID
                </Label>
                <Input
                  placeholder="Enter Poll ID"
                  value={pollId}
                  onChange={(e) => setPollId(e.target.value)}
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Session ID
                </Label>
                <Input
                  placeholder="Enter Session ID (History ID)"
                  value={historyId}
                  onChange={(e) => setHistoryId(e.target.value)}
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {joinError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {joinError}
                </div>
              )}
              <Button
                onClick={joinSession}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Join Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <MobileHeader
          title={`Waiting - ${user?.name}`}
          subtitle="Wait for questions..."
        />

        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="text-center py-8 lg:py-12 px-4">
              <div className="flex items-center justify-center mb-4 lg:mb-6">
                <Avatar className="h-12 w-12 lg:h-16 lg:w-16 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg lg:text-xl">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                {user?.name}
              </h2>
              <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
                Wait for the teacher to ask questions...
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={leaveSession}
                  className="w-full lg:w-auto hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                >
                  Leave Session
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full lg:w-auto text-sm hover:bg-gray-50"
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          <ChatPopup
            pollId={pollId}
            historyId={historyId}
            userName={user?.name}
          />
        </div>
      </div>
    );
  }

  if (step === "question" && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Mobile Header with Timer */}
        <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 px-2 py-1 text-xs"
              >
                {user?.name}
              </Badge>
              <Button
                variant="ghost"
                onClick={handleLogout}
                size="sm"
                className="hover:bg-red-50 hover:text-red-700 text-xs"
              >
                Logout
              </Button>
            </div>
            <TimerDisplay timeLeft={timeLeft} />
          </div>
          <div className="px-4 pb-2">
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Question
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 px-3 py-1"
                >
                  {user?.name}
                </Badge>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  size="sm"
                  className="hover:bg-red-50 hover:text-red-700"
                >
                  Logout
                </Button>
              </div>
              <TimerDisplay timeLeft={timeLeft} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Question
            </h1>
          </div>

          <QuestionCard
            question={currentQuestion}
            onSubmitAnswer={submitAnswer}
            hasAnswered={hasAnswered}
            timeLeft={timeLeft}
          />

          {hasAnswered && results && (
            <Card className="mt-6 lg:mt-8 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 lg:p-6">
                <CardTitle className="text-indigo-900 text-base lg:text-lg">
                  Live Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6">
                <ResultsChart
                  question={currentQuestion}
                  results={results}
                  isTeacher={false}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <ChatPopup
          pollId={pollId}
          historyId={historyId}
          userName={user?.name}
        />
      </div>
    );
  }

  if (step === "results" && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <MobileHeader
          title="Question Results"
          subtitle="Wait for next question..."
        />

        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <div className="flex items-center justify-between mb-4">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 px-3 py-1"
              >
                {user?.name}
              </Badge>
              <Button
                variant="ghost"
                onClick={handleLogout}
                size="sm"
                className="hover:bg-red-50 hover:text-red-700"
              >
                Logout
              </Button>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Question Results
            </h1>
            <p className="text-gray-600">
              Wait for the teacher to ask a new question...
            </p>
          </div>

          <Card className="shadow-lg mt-4 lg:mt-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 p-4 lg:p-6">
              <CardTitle className="text-green-900 text-base lg:text-lg">
                Results Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <div className="text-center py-6 lg:py-8">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-xl lg:text-2xl">
                    ✓
                  </span>
                </div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">
                  Your answer has been recorded!
                </h3>
                <p className="text-gray-600 text-sm lg:text-base">
                  Total responses: {results.totalVotes}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <ChatPopup
          pollId={pollId}
          historyId={historyId}
          userName={user?.name}
        />
      </div>
    );
  }

  return null;
}

export default function StudentPage() {
  return (
    <AuthGuard>
      <StudentPageContent />
    </AuthGuard>
  );
}