
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";

export default function PollForm({ onPollCreated }) {
  const [title, setTitle] = useState("");
  const [defaultTimeLimit, setDefaultTimeLimit] = useState(60);
  const [questions, setQuestions] = useState([
    {
      text: "",
      options: ["", ""],
      timeLimitSec: 60,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { token } = useAuth();

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: ["", ""],
        timeLimitSec: defaultTimeLimit,
      },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addOption = (questionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options.push("");
    setQuestions(updated);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updated = [...questions];
    if (updated[questionIndex].options.length > 2) {
      updated[questionIndex].options.splice(optionIndex, 1);
      setQuestions(updated);
    }
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Poll title is required");
      return;
    }

    const validQuestions = questions.filter(
      (q) => q.text.trim() && q.options.filter((opt) => opt.trim()).length >= 2
    );

    if (validQuestions.length === 0) {
      setError("At least one complete question is required");
      return;
    }

    if (!token) {
      setError("Authentication required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Set token for API client
      apiClient.setToken(token);

      // Use REST API instead of Socket.IO
      const pollData = {
        title: title.trim(),
        questions: validQuestions.map((q) => ({
          text: q.text.trim(),
          options: q.options
            .filter((opt) => opt.trim())
            .map((opt) => ({
              text: opt.trim(),
            })),
          timeLimitSec: q.timeLimitSec,
        })),
        defaultTimeLimit,
      };

      const response = await apiClient.post("/polls", pollData);

      // Success - call the callback
      if (onPollCreated) {
        onPollCreated(response);
      }

      // Reset form
      setTitle("");
      setQuestions([
        {
          text: "",
          options: ["", ""],
          timeLimitSec: 60,
        },
      ]);
      setError("");
    } catch (error) {
      console.error("Poll creation error:", error);
      setError(error.message || "Failed to create poll");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poll Title
          </label>
          <Input
            placeholder="Enter poll title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Time Limit (seconds)
          </label>
          <Select
            value={defaultTimeLimit.toString()}
            onValueChange={(value) => setDefaultTimeLimit(Number(value))}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">60 seconds</SelectItem>
              <SelectItem value="90">90 seconds</SelectItem>
              <SelectItem value="120">2 minutes</SelectItem>
              <SelectItem value="180">3 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Questions</h3>

        {questions.map((question, qIndex) => (
          <Card key={qIndex} className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Question {qIndex + 1}
                </CardTitle>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(qIndex)}
                    disabled={isSubmitting}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your question"
                value={question.text}
                onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                required
                disabled={isSubmitting}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit
                </label>
                <Select
                  value={question.timeLimitSec.toString()}
                  onValueChange={(value) =>
                    updateQuestion(qIndex, "timeLimitSec", Number(value))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="90">90 seconds</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                    <SelectItem value="180">3 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <Input
                        placeholder={`Option ${oIndex + 1}`}
                        value={option}
                        onChange={(e) =>
                          updateOption(qIndex, oIndex, e.target.value)
                        }
                        required
                        disabled={isSubmitting}
                      />
                      {question.options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(qIndex, oIndex)}
                          disabled={isSubmitting}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(qIndex)}
                    disabled={isSubmitting}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
          className="w-full"
          disabled={isSubmitting}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {isSubmitting ? "Creating Poll..." : "Create Poll"}
      </Button>
    </form>
  );
}