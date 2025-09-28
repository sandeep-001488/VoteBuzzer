"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download } from "lucide-react";
import apiClient from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

function HistoryPageContent() {
  const params = useParams();
  const router = useRouter();
  const [history, setHistory] = useState(null);

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadHistory();
  }, [params.historyId]);

 const loadHistory = async () => {
   try {
     // Set token before making request
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            History Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The polling session history could not be found.
          </p>
          <Button onClick={() => router.push("/teacher")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/teacher")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Poll History
                </h1>
                <p className="text-gray-600">{history.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                Session: {history.historyId.slice(-6)}
              </Badge>
              <Button onClick={exportResults} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {history.finishedQuestions.map((question, index) => (
            <Card key={question.questionId}>
              <CardHeader>
                <CardTitle>Question {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-4">Results Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {Object.entries(question.tallies).map(
                        ([optionId, votes]) => (
                          <div
                            key={optionId}
                            className="bg-white p-3 rounded border"
                          >
                            <div className="font-medium">Option {optionId}</div>
                            <div className="text-purple-600 font-bold">
                              {votes} votes
                            </div>
                            <div className="text-gray-500">
                              {question.totalVotes > 0
                                ? Math.round(
                                    (votes / question.totalVotes) * 100
                                  )
                                : 0}
                              %
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Responses: {question.totalVotes} • Ended:{" "}
                    {new Date(question.endedAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {history.studentLogs.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Student Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.studentLogs.map((student, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{student.name}</h4>
                    <div className="space-y-2 text-sm">
                      {student.events.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="flex justify-between items-center"
                        >
                          <span className="capitalize">{event.event}</span>
                          <span className="text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <AuthGuard requiredRole="teacher">
      <HistoryPageContent />
    </AuthGuard>
  );
}
