// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft, Download } from "lucide-react";
// import apiClient from "@/lib/api";
// import AuthGuard from "@/components/AuthGuard";

// function HistoryPageContent() {
//   const params = useParams();
//   const router = useRouter();
//   const [history, setHistory] = useState(null);

//   const [loading, setLoading] = useState(true);


//   useEffect(() => {
//     loadHistory();
//   }, [params.historyId]);

//  const loadHistory = async () => {
//    try {
//      // Set token before making request
//      const token = localStorage.getItem("polling_token");
//      if (token) {
//        apiClient.setToken(token);
//      }

//      const data = await apiClient.get(`/sessions/history/${params.historyId}`);
//      setHistory(data);
//    } catch (error) {
//      console.error("Error loading history:", error);
//    } finally {
//      setLoading(false);
//    }
//  };

//   const exportResults = () => {
//     window.open(
//       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/export/${params.historyId}`,
//       "_blank"
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
//       </div>
//     );
//   }

//   if (!history) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">
//             History Not Found
//           </h2>
//           <p className="text-gray-600 mb-4">
//             The polling session history could not be found.
//           </p>
//           <Button onClick={() => router.push("/teacher")}>
//             Back to Dashboard
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => router.push("/teacher")}
//               >
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 Back to Dashboard
//               </Button>
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900">
//                   Poll History
//                 </h1>
//                 <p className="text-gray-600">{history.title}</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-4">
//               <Badge variant="secondary">
//                 Session: {history.historyId.slice(-6)}
//               </Badge>
//               <Button onClick={exportResults} variant="outline">
//                 <Download className="w-4 h-4 mr-2" />
//                 Export Results
//               </Button>
//             </div>
//           </div>
//         </div>

//         <div className="grid gap-6">
//           {history.finishedQuestions.map((question, index) => (
//             <Card key={question.questionId}>
//               <CardHeader>
//                 <CardTitle>Question {index + 1}</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="bg-gray-50 p-4 rounded-lg">
//                     <h4 className="font-medium mb-4">Results Summary</h4>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                       {Object.entries(question.tallies).map(
//                         ([optionId, votes]) => (
//                           <div
//                             key={optionId}
//                             className="bg-white p-3 rounded border"
//                           >
//                             <div className="font-medium">Option {optionId}</div>
//                             <div className="text-purple-600 font-bold">
//                               {votes} votes
//                             </div>
//                             <div className="text-gray-500">
//                               {question.totalVotes > 0
//                                 ? Math.round(
//                                     (votes / question.totalVotes) * 100
//                                   )
//                                 : 0}
//                               %
//                             </div>
//                           </div>
//                         )
//                       )}
//                     </div>
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     Total Responses: {question.totalVotes} • Ended:{" "}
//                     {new Date(question.endedAt).toLocaleString()}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {history.studentLogs.length > 0 && (
//           <Card className="mt-8">
//             <CardHeader>
//               <CardTitle>Student Activity Log</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {history.studentLogs.map((student, index) => (
//                   <div key={index} className="border rounded-lg p-4">
//                     <h4 className="font-medium mb-2">{student.name}</h4>
//                     <div className="space-y-2 text-sm">
//                       {student.events.map((event, eventIndex) => (
//                         <div
//                           key={eventIndex}
//                           className="flex justify-between items-center"
//                         >
//                           <span className="capitalize">{event.event}</span>
//                           <span className="text-gray-500">
//                             {new Date(event.timestamp).toLocaleString()}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function HistoryPage() {
//   return (
//     <AuthGuard requiredRole="teacher">
//       <HistoryPageContent />
//     </AuthGuard>
//   );
// }
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
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
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
              <Badge variant="secondary">
                Session: {history.historyId?.slice(-6)}
              </Badge>
              <Badge variant="outline">
                <Users className="w-4 h-4 mr-1" />
                {history.participantCount || 0} participants
              </Badge>
              <Button onClick={exportResults} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="responses">Detailed Responses</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-purple-600" />
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

                <Card>
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

                <Card>
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

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">
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

              {history.finishedQuestions?.map((question, index) => (
                <Card key={question.questionId || index}>
                  <CardHeader>
                    <CardTitle>
                      Question {index + 1}: {question.questionText}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {question.options?.map((option) => {
                          // Handle Map object from MongoDB
                          const tallies =
                            question.tallies instanceof Map
                              ? Object.fromEntries(question.tallies)
                              : question.tallies || {};
                          const votes = tallies[option.id] || 0;
                          const percentage =
                            question.totalVotes > 0
                              ? ((votes / question.totalVotes) * 100).toFixed(1)
                              : 0;

                          return (
                            <div
                              key={option.id}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <div className="font-medium">{option.text}</div>
                              <div className="text-2xl font-bold text-purple-600 mt-2">
                                {votes} votes
                              </div>
                              <div className="text-sm text-gray-500">
                                {percentage}% of responses
                              </div>
                              <div className="mt-2 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Responses: {question.totalVotes || 0} • Ended:{" "}
                        {question.endedAt
                          ? new Date(question.endedAt).toLocaleString()
                          : "N/A"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="responses">
            <div className="space-y-6">
              {history.detailedResponses &&
                Object.entries(history.detailedResponses).map(
                  ([questionId, questionData]) => (
                    <Card key={questionId}>
                      <CardHeader>
                        <CardTitle>{questionData.questionText}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {questionData.responses?.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Response
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Time
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {questionData.responses.map(
                                    (response, idx) => (
                                      <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {response.studentName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {response.optionText}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {new Date(
                                            response.timestamp
                                          ).toLocaleString()}
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
                )}
            </div>
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Session Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.participants?.length > 0 ? (
                    history.participants.map((participant, index) => (
                      <div
                        key={participant.sessionId || index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{participant.name}</h4>
                          <p className="text-sm text-gray-600">
                            Session ID: {participant.sessionId}
                          </p>
                          <p className="text-sm text-gray-600">
                            Joined:{" "}
                            {participant.joinedAt
                              ? new Date(participant.joinedAt).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <Badge variant="secondary">Participant</Badge>
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
            <Card>
              <CardHeader>
                <CardTitle>Student Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.studentLogs?.length > 0 ? (
                    history.studentLogs.map((student, index) => (
                      <div
                        key={student.sessionId || index}
                        className="border rounded-lg p-4"
                      >
                        <h4 className="font-medium mb-3">
                          {student.name}
                          <span className="text-sm text-gray-500 ml-2">
                            ({student.sessionId})
                          </span>
                        </h4>
                        <div className="space-y-2 text-sm">
                          {student.events?.map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                            >
                              <div>
                                <span className="capitalize font-medium">
                                  {event.event}
                                </span>
                                {event.details && (
                                  <span className="text-gray-600 ml-2">
                                    - {event.details}
                                  </span>
                                )}
                                {student.answeredQuestions &&
                                  Object.keys(student.answeredQuestions)
                                    .length > 0 && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      Answered{" "}
                                      {
                                        Object.keys(student.answeredQuestions)
                                          .length
                                      }{" "}
                                      questions
                                    </div>
                                  )}
                              </div>
                              <span className="text-gray-500">
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                          ))}
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