"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function QuestionCard({
  question,
  onSubmitAnswer,
  hasAnswered,
  timeLeft,
}) {
  const [selectedOption, setSelectedOption] = useState("");

  const handleSubmit = () => {
    if (selectedOption && !hasAnswered) {
      onSubmitAnswer(selectedOption);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedOption}
          onValueChange={setSelectedOption}
          disabled={hasAnswered}
          className="space-y-3"
        >
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label
                htmlFor={option.id}
                className="flex-1 cursor-pointer text-base font-medium text-gray-700"
              >
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!selectedOption || hasAnswered || timeLeft <= 0}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
          >
            {hasAnswered ? "Answer Submitted" : "Submit"}
          </Button>
        </div>

        {hasAnswered && (
          <div className="text-center text-sm text-gray-600">
            ✅ Your answer has been recorded. Wait for results...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
