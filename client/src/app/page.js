"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === "teacher") {
        router.push("/teacher");
      } else if (user.role === "student") {
        router.push("/student");
      }
    }
  }, [isAuthenticated, user, loading, router]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Interactive Poll
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Live Polling System
            </span>
          </h1>
          <p className="text-gray-600">
            Create interactive polls, engage with students, and get real-time
            feedback
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">For Teachers</CardTitle>
              <CardDescription>
                Create polls, ask questions, and view live responses from
                students
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">For Students</CardTitle>
              <CardDescription>
                Join sessions, answer questions, and see live results
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Button
          onClick={handleGetStarted}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
        >
          {isAuthenticated ? "Go to Dashboard" : "Get Started"}
        </Button>
      </div>
    </div>
  );
}
