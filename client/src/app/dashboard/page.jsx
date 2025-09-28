"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  console.log(user);

  const handleRoleSelection = (role) => {
    if (role === "teacher") {
      router.push("/teacher");
    } else {
      router.push("/student");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Interactive Poll
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Choose how you'd like to use the polling system
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg border-gray-200"
            onClick={() => handleRoleSelection("student")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Join as Student</CardTitle>
              <CardDescription>
                Enter session details to participate in live polls and answer
                questions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg border-gray-200"
            onClick={() => handleRoleSelection("teacher")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Create as Teacher</CardTitle>
              <CardDescription>
                Create polls, manage sessions, and view live results from
                students
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Button onClick={logout} variant="outline" className="w-full">
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
