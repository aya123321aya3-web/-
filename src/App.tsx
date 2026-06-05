import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CandidatePortal from "./components/CandidatePortal";
import RecruiterPanel from "./components/RecruiterPanel";
import BlackListGate from "./components/BlackListGate";
import { standardExams } from "./standardExams";
import { Exam, CandidateSubmission } from "./types";
import { Sparkles, HelpCircle, Star, BrainCircuit } from "lucide-react";

export default function App() {
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<CandidateSubmission[]>([]);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [showGate, setShowGate] = useState(true);

  // Synchronize with local storage on mount
  useEffect(() => {
    // 1. Get custom dynamic exams
    const savedCustomExamsStr = localStorage.getItem("recruiter_custom_exams");
    const savedCustomExams: Exam[] = savedCustomExamsStr ? JSON.parse(savedCustomExamsStr) : [];
    
    // Combine standard exams with recruiter's custom ones
    setExams([...standardExams, ...savedCustomExams]);

    // 2. Get submissions history list
    const savedSubmissionsStr = localStorage.getItem("recruiter_candidate_submissions");
    const savedSubmissions: CandidateSubmission[] = savedSubmissionsStr ? JSON.parse(savedSubmissionsStr) : [];
    setSubmissions(savedSubmissions);
  }, []);

  // Creation of a custom exam
  const handleCreateExam = (newExam: Exam) => {
    const savedCustomExamsStr = localStorage.getItem("recruiter_custom_exams");
    const savedCustomExams: Exam[] = savedCustomExamsStr ? JSON.parse(savedCustomExamsStr) : [];
    
    const updatedCustoms = [newExam, ...savedCustomExams];
    localStorage.setItem("recruiter_custom_exams", JSON.stringify(updatedCustoms));
    
    setExams([...standardExams, ...updatedCustoms]);
  };

  // Deletion of custom dynamic exams
  const handleDeleteExam = (examId: string) => {
    const savedCustomExamsStr = localStorage.getItem("recruiter_custom_exams");
    const savedCustomExams: Exam[] = savedCustomExamsStr ? JSON.parse(savedCustomExamsStr) : [];
    
    const updatedCustoms = savedCustomExams.filter(e => e.id !== examId);
    localStorage.setItem("recruiter_custom_exams", JSON.stringify(updatedCustoms));
    
    setExams([...standardExams, ...updatedCustoms]);
    if (activeExamId === examId) {
      setActiveExamId(null);
    }
  };

  // Adding a candidate submission
  const handleAddSubmission = (submission: CandidateSubmission) => {
    const savedSubmissionsStr = localStorage.getItem("recruiter_candidate_submissions");
    const savedSubmissions: CandidateSubmission[] = savedSubmissionsStr ? JSON.parse(savedSubmissionsStr) : [];
    
    const updatedSubmissions = [submission, ...savedSubmissions];
    localStorage.setItem("recruiter_candidate_submissions", JSON.stringify(updatedSubmissions));
    setSubmissions(updatedSubmissions);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
      
      {/* HEADER NAVBAR */}
      <Navbar currentRole={role} setRole={setRole} examsCount={exams.length} />

      {/* DYNAMIC WELCOME BENTO/HERO FOR SYSTEM INSIGHTS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
      {/* ACTIVE PORTAL INJECTION SECTION */}
        <div className="space-y-8">
          {role === "candidate" ? (
            <CandidatePortal
              exams={exams}
              onSubmitExam={handleAddSubmission}
              activeExamId={activeExamId}
              setActiveExamId={setActiveExamId}
            />
          ) : (
            <RecruiterPanel
              exams={exams}
              submissions={submissions}
              onCreateExam={handleCreateExam}
              onDeleteExam={handleDeleteExam}
            />
          )}
        </div>

      </main>

      {/* MAIN FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200/50 py-6 text-center text-xs text-slate-400 no-print mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 تقديم BLACKLIST - منصة اختبارات التوظيف والتقييم الذكي لمجتمع BLACKLIST</p>
          <div className="flex items-center gap-3 font-semibold text-[11px] text-slate-500">
            <button 
              onClick={() => setShowGate(true)}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition-all cursor-pointer"
            >
              🔑 إعادة إغلاق وعرض بوابة BLACKLIST
            </button>
            <div className="h-3 w-px bg-slate-300"></div>
            <span>لوحة تحكم تفاعلية مدمجة</span>
          </div>
        </div>
      </footer>

      {/* INJECT INTERACTIVE SLIDING GATE */}
      {showGate && <BlackListGate onEnter={() => setShowGate(false)} />}
    </div>
  );
}
