export type DifficultyLevel = "junior" | "mid" | "senior";

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  codeSnippet?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: DifficultyLevel;
  timeLimit: number; // in minutes
  questions: Question[];
  isDynamic?: boolean;
}

export interface CandidateSubmission {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  examId: string;
  examTitle: string;
  startedAt: string;
  completedAt: string;
  answers: Record<number, number>; // questionId -> selectedOptionIndex
  score: number;
  passed: boolean;
  feedback: string;
}

export interface DashboardStats {
  totalSubmissions: number;
  averageScore: number;
  passingRate: number;
  categoryDistribution: Record<string, number>;
}
