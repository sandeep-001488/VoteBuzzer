"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PollForm from "@/components/PollForm";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

function CreatePollContent() {
  const router = useRouter();
  const { logout } = useAuth();

  const handlePollCreated = () => {
    router.push("/teacher");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Poll
            </h1>
            <p className="text-gray-600 mt-1">
              Set up questions and options for your polling session
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Poll Details</CardTitle>
          </CardHeader>
          <CardContent>
            <PollForm onPollCreated={handlePollCreated} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreatePoll() {
  return (
    <AuthGuard requiredRole="teacher">
      <CreatePollContent />
    </AuthGuard>
  );
}
