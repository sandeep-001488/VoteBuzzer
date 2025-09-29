"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  Users,
  MessageCircle,
  BarChart3,
  Clock,
  CheckCircle,
  Mail,
  X,
  FileText,
} from "lucide-react";
import apiClient from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

function HistoryDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [params.historyId]);

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem("polling_token");
      if (token) {
        apiClient.setToken(token);
      }

      const data = await apiClient.get(`/sessions/history/${params.historyId}`);
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/export/${params.historyId}`,
      "_blank"
    );
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === "Invalid Date") return "Time not available";
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return "Time not available";
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm lg:text-base">
            Loading session details...
          </p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!history) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              History Not Found
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              The polling session history could not be found.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Participant View - Mobile Optimized
  if (history.isParticipant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="flex-shrink-0 p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-semibold text-gray-900 truncate">
                  Session Details
                </h1>
                <p className="text-xs text-gray-600 truncate">
                  {history.title}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 text-xs flex-shrink-0 px-2 py-1"
            >
              Participant
            </Badge>
          </div>
        </div>

        <div className="px-4 py-4 lg:px-6 lg:py-6 max-w-6xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Session Participation
                </h1>
                <p className="text-gray-600">{history.title}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Participant View
            </Badge>
          </div>

          <div className="space-y-4 lg:space-y-6">
            {/* Overview Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm font-medium text-gray-600">
                        Total Participants
                      </p>
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">
                        {history.participantCount || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm font-medium text-gray-600">
                        Questions Answered
                      </p>
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">
                        {history.finishedQuestions?.filter(
                          (q) => q.userAnswered
                        ).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <MessageCircle className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm font-medium text-gray-600">
                        Hosted by
                      </p>
                      <p className="text-sm lg:text-lg font-bold text-gray-900 truncate">
                        {history.teacherDetails?.name ||
                          history.teacherName ||
                          "Unknown"}
                      </p>
                      {history.teacherDetails?.email && (
                        <p className="text-xs text-gray-500 truncate">
                          {history.teacherDetails.email}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Your Responses */}
            <Card>
              <CardHeader className="p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Your Responses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                <div className="space-y-3 lg:space-y-4">
                  {history.finishedQuestions &&
                  history.finishedQuestions.length > 0 ? (
                    history.finishedQuestions.map((question, index) => (
                      <div
                        key={question.questionId || index}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 lg:p-4 rounded-lg border"
                      >
                        <div className="space-y-2 lg:space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <h4 className="font-semibold text-gray-900 text-sm lg:text-base leading-tight">
                              Question {index + 1}: {question.questionText}
                            </h4>
                            <Badge
                              variant={
                                question.userAnswered ? "default" : "outline"
                              }
                              className={`self-start sm:self-center text-xs ${
                                question.userAnswered
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {question.userAnswered
                                ? "Answered"
                                : "Not Answered"}
                            </Badge>
                          </div>
                          <div className="text-sm lg:text-base font-medium text-blue-700">
                            Your Answer: {question.userAnswer}
                          </div>
                          {question.endedAt && (
                            <div className="text-xs lg:text-sm text-gray-600">
                              Completed: {formatTimestamp(question.endedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm lg:text-base">
                        No questions available.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Your Activity Log */}
            <Card>
              <CardHeader className="p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Your Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                <div className="space-y-2 lg:space-y-3">
                  {history.userActivity?.length > 0 ? (
                    history.userActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 lg:py-3 px-3 lg:px-4 bg-gray-50 rounded-lg border-l-4 border-l-purple-200"
                      >
                        <div className="space-y-1">
                          <span className="capitalize font-medium text-gray-900 text-sm lg:text-base">
                            {activity.event}
                          </span>
                          {activity.details && (
                            <p className="text-xs lg:text-sm text-gray-600">
                              {activity.details}
                            </p>
                          )}
                        </div>
                        <span className="text-xs lg:text-sm text-gray-500 mt-1 sm:mt-0">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm lg:text-base">
                        No activity recorded.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Teacher View (Full Access) - Mobile Optimized
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex-shrink-0 p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold text-gray-900 truncate">
                Session Details
              </h1>
              <p className="text-xs text-gray-600 truncate">{history.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 text-xs px-2 py-1"
            >
              <Users className="w-3 h-3 mr-1" />
              {history.participantCount || 0}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportResults}
              className="p-2"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 lg:px-6 lg:py-6 max-w-7xl mx-auto">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Session Details
              </h1>
              <p className="text-gray-600">{history.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <Users className="w-4 h-4 mr-1" />
              {history.participantCount || 0} participants
            </Badge>
          </div>
        </div>

        {/* Mobile-First Tabs */}
        <Tabs defaultValue="overview" className="space-y-4 lg:space-y-6">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm min-w-[320px] lg:min-w-0 h-10 lg:h-12">
              <TabsTrigger
                value="overview"
                className="text-xs lg:text-sm py-2 px-1 lg:px-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="responses"
                className="text-xs lg:text-sm py-2 px-1 lg:px-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                Responses
              </TabsTrigger>
              <TabsTrigger
                value="participants"
                className="text-xs lg:text-sm py-2 px-1 lg:px-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                Participants
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="text-xs lg:text-sm py-2 px-1 lg:px-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="space-y-4 lg:space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <Card className="border-l-4 border-l-indigo-500">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <div className="flex-shrink-0">
                        <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-600">
                          Questions
                        </p>
                        <p className="text-lg lg:text-2xl font-bold text-gray-900">
                          {history.finishedQuestions?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <div className="flex-shrink-0">
                        <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-600">
                          Participants
                        </p>
                        <p className="text-lg lg:text-2xl font-bold text-gray-900">
                          {history.participantCount || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <div className="flex-shrink-0">
                        <MessageCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-600">
                          Student Logs
                        </p>
                        <p className="text-lg lg:text-2xl font-bold text-gray-900">
                          {history.studentLogs?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <div className="flex-shrink-0 h-6 w-6 lg:h-8 lg:w-8 bg-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-xs lg:text-sm font-bold text-purple-700">
                          %
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-600">
                          Status
                        </p>
                        <p className="text-sm lg:text-lg font-bold text-gray-900">
                          {history.endedAt ? "Complete" : "Progress"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Questions Results */}
              {history.finishedQuestions &&
              history.finishedQuestions.length > 0 ? (
                history.finishedQuestions.map((question, index) => (
                  <Card
                    key={question.questionId || index}
                    className="shadow-sm"
                  >
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 lg:p-6">
                      <CardTitle className="text-indigo-900 text-sm lg:text-base leading-tight">
                        Question {index + 1}: {question.questionText}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 lg:p-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                          {question.options?.map((option) => {
                            const tallies = question.tallies || {};
                            const votes = tallies[option.id] || 0;
                            const percentage =
                              question.totalVotes > 0
                                ? ((votes / question.totalVotes) * 100).toFixed(
                                    1
                                  )
                                : "0";

                            return (
                              <div
                                key={option.id}
                                className="bg-gradient-to-br from-white to-gray-50 p-3 lg:p-4 rounded-lg border shadow-sm"
                              >
                                <div className="space-y-2">
                                  <div className="font-medium text-gray-900 text-sm leading-tight">
                                    {option.text}
                                  </div>
                                  <div className="text-xl lg:text-2xl font-bold text-indigo-600">
                                    {votes} votes
                                  </div>
                                  <div className="text-xs lg:text-sm text-gray-500">
                                    {percentage}% of responses
                                  </div>
                                  <div className="bg-gray-200 rounded-full h-1.5 lg:h-2">
                                    <div
                                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-1.5 lg:h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-xs lg:text-sm text-gray-600 bg-gray-50 p-3 rounded text-center lg:text-left">
                          Total Responses: {question.totalVotes || 0} • Ended:{" "}
                          {formatTimestamp(question.endedAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm lg:text-base">
                      No completed questions yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="responses">
            <div className="space-y-4 lg:space-y-6">
              {history.detailedResponses &&
              Object.keys(history.detailedResponses).length > 0 ? (
                Object.entries(history.detailedResponses).map(
                  ([questionId, questionData]) => (
                    <Card key={questionId} className="shadow-sm">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 lg:p-6">
                        <CardTitle className="text-blue-900 text-sm lg:text-base leading-tight">
                          {questionData.questionText}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 lg:p-6">
                        {questionData.responses?.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                <tr>
                                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Student
                                  </th>
                                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                                    Email
                                  </th>
                                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Response
                                  </th>
                                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                                    Time
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {questionData.responses.map((response, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm font-medium text-gray-900">
                                      <div>
                                        {response.studentName}
                                        <div className="sm:hidden text-xs text-gray-500 mt-1">
                                          {response.studentEmail}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-600 hidden sm:table-cell">
                                      {response.studentEmail}
                                    </td>
                                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-indigo-600 font-medium">
                                      {response.optionText}
                                    </td>
                                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-purple-600 font-medium hidden lg:table-cell">
                                      <div>
                                        {formatTime(response.responseTime || 0)}
                                        <div className="text-gray-500 text-xs mt-1">
                                          {formatTimestamp(response.timestamp)}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-sm lg:text-base">
                              No responses recorded for this question.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                )
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm lg:text-base">
                      No detailed responses available.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="participants">
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 p-4 lg:p-6">
                <CardTitle className="text-green-900 flex items-center gap-2 text-base lg:text-lg">
                  <Users className="w-5 h-5" />
                  Session Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6">
                <div className="space-y-3 lg:space-y-4">
                  {history.participants?.length > 0 ? (
                    history.participants.map((participant, index) => (
                      <div
                        key={participant.sessionId || index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border space-y-2 sm:space-y-0"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm lg:text-base">
                            {participant.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600 mt-1">
                            <Mail className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="break-all">
                              {participant.email}
                            </span>
                          </div>
                          <p className="text-xs lg:text-sm text-gray-600 mt-1">
                            Joined: {formatTimestamp(participant.joinedAt)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 text-xs self-start sm:self-center"
                        >
                          Participant
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm lg:text-base">
                        No participants recorded.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 lg:p-6">
                <CardTitle className="text-purple-900 flex items-center gap-2 text-base lg:text-lg">
                  <FileText className="w-5 h-5" />
                  Student Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6">
                <div className="space-y-3 lg:space-y-4">
                  {history.studentLogs?.length > 0 ? (
                    history.studentLogs.map((student, index) => (
                      <div
                        key={student.sessionId || index}
                        className="border rounded-lg p-3 lg:p-4 bg-gradient-to-r from-white to-purple-50"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                          <h4 className="font-medium text-gray-900 text-sm lg:text-base">
                            {student.name}
                          </h4>
                          <div className="text-xs lg:text-sm text-gray-600 break-all">
                            {student.email}
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          {student.events && student.events.length > 0 ? (
                            student.events.map((event, eventIndex) => (
                              <div
                                key={eventIndex}
                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 last:border-b-0 gap-1 sm:gap-4"
                              >
                                <div className="flex-1">
                                  <span className="capitalize font-medium text-gray-900 text-xs lg:text-sm">
                                    {event.event}
                                  </span>
                                  {event.details && (
                                    <span className="text-gray-600 ml-2 text-xs lg:text-sm">
                                      - {event.details}
                                    </span>
                                  )}
                                </div>
                                <span className="text-gray-500 text-xs lg:text-sm flex-shrink-0">
                                  {formatTimestamp(event.timestamp)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 italic text-xs lg:text-sm">
                              No activity recorded
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm lg:text-base">
                        No activity logs recorded.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function HistoryDetailsPage() {
  return (
    <AuthGuard>
      <HistoryDetailsContent />
    </AuthGuard>
  );
}
