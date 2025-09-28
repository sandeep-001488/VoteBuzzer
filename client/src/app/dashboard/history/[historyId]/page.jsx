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
      console.log("History data:", data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            History Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The polling session history could not be found.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Participant View
  if (history.isParticipant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
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
          </div>

          <div className="grid gap-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Participants
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {history.participantCount || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Questions Answered
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {history.finishedQuestions?.filter(
                          (q) => q.userAnswered
                        ).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageCircle className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Hosted by
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {history.teacherDetails?.name ||
                          history.teacherName ||
                          "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {history.teacherDetails?.email || ""}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Your Responses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Your Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.finishedQuestions &&
                  history.finishedQuestions.length > 0 ? (
                    history.finishedQuestions.map((question, index) => (
                      <div
                        key={question.questionId || index}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            Question {index + 1}: {question.questionText}
                          </h4>
                          <Badge
                            variant={
                              question.userAnswered ? "default" : "outline"
                            }
                            className={
                              question.userAnswered
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {question.userAnswered
                              ? "Answered"
                              : "Not Answered"}
                          </Badge>
                        </div>
                        <div className="text-lg font-medium text-blue-700 mb-2">
                          Your Answer: {question.userAnswer}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-4">
                          <span>
                            Total Responses: {question.totalResponses || 0}
                          </span>
                          {question.endedAt && (
                            <span>
                              Completed: {formatTimestamp(question.endedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No questions available.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Your Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Your Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.userActivity?.length > 0 ? (
                    history.userActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <span className="capitalize font-medium text-gray-900">
                            {activity.event}
                          </span>
                          <span className="text-gray-600 ml-2">
                            {activity.details}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No activity recorded.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Teacher View (Full Access)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
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
              {history.endedAt && (
                <Button
                  onClick={exportResults}
                  variant="outline"
                  className="bg-white hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="responses"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Detailed Responses
            </TabsTrigger>
            <TabsTrigger
              value="participants"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Participants
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-indigo-500">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-indigo-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Questions
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {history.finishedQuestions?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Participants
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {history.participantCount || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <MessageCircle className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Student Logs
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {history.studentLogs?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-700">
                          %
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Completion
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {history.endedAt ? "100%" : "In Progress"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {history.finishedQuestions &&
              history.finishedQuestions.length > 0 ? (
                history.finishedQuestions.map((question, index) => (
                  <Card
                    key={question.questionId || index}
                    className="shadow-sm"
                  >
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                      <CardTitle className="text-indigo-900">
                        Question {index + 1}: {question.questionText}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-lg border shadow-sm"
                              >
                                <div className="font-medium text-gray-900">
                                  {option.text}
                                </div>
                                <div className="text-2xl font-bold text-indigo-600 mt-2">
                                  {votes} votes
                                </div>
                                <div className="text-sm text-gray-500">
                                  {percentage}% of responses
                                </div>
                                <div className="mt-2 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          Total Responses: {question.totalVotes || 0} • Ended:{" "}
                          {formatTimestamp(question.endedAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No completed questions yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="responses">
            <div className="space-y-6">
              {history.detailedResponses &&
              Object.keys(history.detailedResponses).length > 0 ? (
                Object.entries(history.detailedResponses).map(
                  ([questionId, questionData]) => (
                    <Card key={questionId} className="shadow-sm">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <CardTitle className="text-blue-900">
                          {questionData.questionText}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {questionData.responses?.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Response
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Time Taken
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Timestamp
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {questionData.responses.map(
                                    (response, idx) => (
                                      <tr
                                        key={idx}
                                        className="hover:bg-gray-50"
                                      >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {response.studentName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                          {response.studentEmail}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">
                                          {response.optionText}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                                          {formatTime(
                                            response.responseTime || 0
                                          )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {formatTimestamp(response.timestamp)}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-8">
                              No responses recorded for this question.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">
                      No detailed responses available.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="participants">
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="text-green-900">
                  Session Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {history.participants?.length > 0 ? (
                    history.participants.map((participant, index) => (
                      <div
                        key={participant.sessionId || index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {participant.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Mail className="w-4 h-4" />
                            <span>{participant.email}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Joined: {formatTimestamp(participant.joinedAt)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          Participant
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No participants recorded.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-purple-900">
                  Student Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {history.studentLogs?.length > 0 ? (
                    history.studentLogs.map((student, index) => (
                      <div
                        key={student.sessionId || index}
                        className="border rounded-lg p-4 bg-gradient-to-r from-white to-purple-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            {student.name}
                          </h4>
                          <div className="text-sm text-gray-600">
                            {student.email}
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          {student.events && student.events.length > 0 ? (
                            student.events.map((event, eventIndex) => (
                              <div
                                key={eventIndex}
                                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                              >
                                <div>
                                  <span className="capitalize font-medium text-gray-900">
                                    {event.event}
                                  </span>
                                  {event.details && (
                                    <span className="text-gray-600 ml-2">
                                      - {event.details}
                                    </span>
                                  )}
                                </div>
                                <span className="text-gray-500">
                                  {formatTimestamp(event.timestamp)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 italic">
                              No activity recorded
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No activity logs recorded.
                    </p>
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
