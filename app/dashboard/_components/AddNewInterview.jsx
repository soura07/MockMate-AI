"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState(null);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!jobPosition || !jobDesc || !jobExperience) {
        console.error("All fields are required.");
        setLoading(false);
        return;
      }

      const questionCount = process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT || 10; // Default to 10 questions
      const inputPrompt = `Job position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}. Based on these details, generate ${questionCount} interview questions along with answers in JSON format with 'question' and 'answer' fields only.`;

      // Send prompt to AI model
      const result = await chatSession.sendMessage(inputPrompt);
      let mockJsonResp = result.response.text().trim();

      // Remove unnecessary JSON markdown
      mockJsonResp = mockJsonResp.replace(/^```json/, "").replace(/```$/, "").trim();

      // Parse AI response safely
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(mockJsonResp);
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        setLoading(false);
        return;
      }

      console.log("Parsed AI Response:", parsedResponse);
      setJsonResponse(parsedResponse);

      // Insert into database
      const resp = await db.insert(MockInterview).values({
        mockId: uuidv4(),
        jsonMockResp: mockJsonResp,
        jobPosition,
        jobDesc,
        jobExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress || "Anonymous",
        createAt: moment().format("DD-MM-YYYY"),
      }).returning({ mockId: MockInterview.mockId });

      console.log("Inserted ID:", resp);
      if (resp) {
        setOpenDialog(false);
        router.push('/dashboard/interview/'+resp[0]?.mockId);
        resetForm();
      }
    } catch (error) {
      console.error("Submission Error:", error);
    }

    setLoading(false);
  };

  // Reset form after successful submission
  const resetForm = () => {
    setJobPosition("");
    setJobDesc("");
    setJobExperience("");
    setJsonResponse(null);
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New</h2>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your job Interviewing
            </DialogTitle>
            <DialogDescription>
              <div>
                <h2>
                  Please provide details about your job position, job description, and years of experience.
                </h2>

                <form onSubmit={onSubmit}>
                  <div className="mt-4 my-3">
                    <label className="block text-sm font-medium">
                      Job Role/Job Position
                    </label>
                    <Input
                      placeholder="Ex. Full Stack Developer"
                      required
                      value={jobPosition}
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>

                  <div className="my-3">
                    <label className="block text-sm font-medium">
                      Job Description / Tech Stack (In Short)
                    </label>
                    <Textarea
                      placeholder="Ex. C++, Java, Python, OOPS, DSA, React, Angular, NodeJS, MySQL etc."
                      required
                      value={jobDesc}
                      onChange={(event) => setJobDesc(event.target.value)}
                    />
                  </div>

                  <div className="my-3">
                    <label className="block text-sm font-medium">
                      Years of Experience
                    </label>
                    <Input
                      placeholder="Ex. 3"
                      type="number"
                      max="50"
                      required
                      value={jobExperience}
                      onChange={(event) => setJobExperience(event.target.value)}
                    />
                  </div>

                  <div className="flex gap-5 justify-end mt-5">
                    <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <LoaderCircle className="animate-spin" /> Generating from AI
                        </>
                      ) : (
                        "Start Interview"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
