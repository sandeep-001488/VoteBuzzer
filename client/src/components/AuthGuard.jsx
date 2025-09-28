"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthGuard({ children, requiredRole = null }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (
        requiredRole &&
        user?.role !== requiredRole &&
        user?.role !== "user"
      ) {
        if (user?.role === "teacher" && requiredRole === "student") {
          router.push("/teacher");
        } else if (user?.role === "student" && requiredRole === "teacher") {
          router.push("/student");
        } else {
          router.push("/login");
        }
        return;
      }
    }
  }, [isAuthenticated, user, loading, requiredRole, router]);

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

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== "user") {
    return null; // Will redirect in useEffect
  }

  return children;
}
