import { useState, useEffect, FormEvent } from "react";
import { 
  User, Mail, Phone, BookOpen, Clock, AlertCircle, Play, ChevronLeft, ChevronRight, 
  Hourglass, CheckCircle2, XCircle, BrainCircuit, Sparkles, LogOut, Award, ClipboardCheck
} from "lucide-react";
import { Exam, CandidateSubmission } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import Certificate from "./Certificate";
// @ts-ignore
import bgImage from "../assets/images/blacklist_bg_1780693070413.png";

interface CandidatePortalProps {
  exams: Exam[];
  onSubmitExam: (submission: CandidateSubmission) => void;
  activeExamId: string | null;
  setActiveExamId: (id: string | null) => void;
}

export default function CandidatePortal({
  exams,
  onSubmitExam,
  activeExamId,
  setActiveExamId,
}: CandidatePortalProps) {
  // User profile
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [profileConfirmed, setProfileConfirmed] = useState(false);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  // Active testing state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testStartTime, setTestStartTime] = useState("");

  // Exam result/review states
  const [latestSubmission, setLatestSubmission] = useState<CandidateSubmission | null>(null);
  const [activeTab, setActiveTab] = useState<"certificate" | "report" | "review">("report");
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState("");

  const activeExam = exams.find(e => e.id === activeExamId);

  // Countdown timer inside the exam
  useEffect(() => {
    if (!isTestRunning || timeLeft <= 0) {
      if (isTestRunning && timeLeft === 0) {
        handleAutoSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestRunning, timeLeft]);

  // Load profile from local storage if exists
  useEffect(() => {
    const savedName = localStorage.getItem("candidate_name") || "";
    const savedEmail = localStorage.getItem("candidate_email") || "";
    const savedPhone = localStorage.getItem("candidate_phone") || "";
    if (savedName && savedEmail) {
      setCandidateName(savedName);
      setCandidateEmail(savedEmail);
      setCandidatePhone(savedPhone);
      setProfileConfirmed(true);
    }
  }, []);

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim()) return;

    localStorage.setItem("candidate_name", candidateName);
    localStorage.setItem("candidate_email", candidateEmail);
    localStorage.setItem("candidate_phone", candidatePhone);
    setProfileConfirmed(true);
  };

  const handleClearProfile = () => {
    localStorage.removeItem("candidate_name");
    localStorage.removeItem("candidate_email");
    localStorage.removeItem("candidate_phone");
    setCandidateName("");
    setCandidateEmail("");
    setCandidatePhone("");
    setProfileConfirmed(false);
    handleResetTest();
  };

  const startExam = (exam: Exam) => {
    setActiveExamId(exam.id);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(exam.timeLimit * 60);
    setIsTestRunning(true);
    setTestStartTime(new Date().toISOString());
    setLatestSubmission(null);
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (!activeExam) return;
    if (currentQuestionIndex < activeExam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAutoSubmit = () => {
    alert("لقد انتهى الوقت المحدد للاختبار! سيتم تسليم إجابتك تلقائياً.");
    submitTest();
  };

  const submitTest = async () => {
    if (!activeExam) return;

    setIsTestRunning(false);
    setEvaluating(true);
    setEvalError("");

    // Make sure all unanswered questions are designated as -1 (indicating incorrect/unanswered)
    const finalAnswers = { ...answers };
    activeExam.questions.forEach(q => {
      if (finalAnswers[q.id] === undefined) {
        finalAnswers[q.id] = -1;
      }
    });

    // Calculate score based on final answers
    let correctCount = 0;
    activeExam.questions.forEach(q => {
      if (finalAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / activeExam.questions.length) * 100);
    const passed = finalScore >= 60; // passing grade threshold 60%

    // Prepare draft submission
    const submissionId = `sub-${Date.now()}`;
    const completedAt = new Date().toISOString();

    const tempSubmission: CandidateSubmission = {
      id: submissionId,
      candidateName,
      candidateEmail,
      candidatePhone,
      examId: activeExam.id,
      examTitle: activeExam.title,
      startedAt: testStartTime,
      completedAt,
      answers: finalAnswers,
      score: finalScore,
      passed,
      feedback: "" // will be hydrated shortly via AI call
    };

    try {
      // API call to evaluate answers and give personalized feedback via server-side Gemini
      const response = await fetch("/api/evaluate-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName,
          examTitle: activeExam.title,
          questions: activeExam.questions,
          answers: finalAnswers,
          score: finalScore
        })
      });

      if (!response.ok) {
        throw new Error("حدث خطأ أثناء إجراء تقييم الذكاء الاصطناعي للسيرفر");
      }

      const resData = await response.json();
      tempSubmission.feedback = resData.feedback;
    } catch (err: any) {
      console.error(err);
      // Fallback evaluation description if API fails
      tempSubmission.feedback = `### 📊 تقرير مبسط (تعذر الاتصال بالذكاء الاصطناعي)
لقد أتممت بنجاح اختبار **${activeExam.title}** بنتيجة **${finalScore}%**.
لقد أجبت بنجاح على **${correctCount} من أصل ${activeExam.questions.length}** أسئلة بشكل صحيح.`;
      setEvalError("تنبيه: تعذر توليد مراجعة الذكاء الاصطناعي المتقدمة بسبب خطأ في الشبكة، ولكن تم تسجيل درجتك بنجاح.");
    } finally {
      setEvaluating(false);
      setLatestSubmission(tempSubmission);
      onSubmitExam(tempSubmission);
      setActiveTab(passed ? "certificate" : "report");
    }
  };

  const handleResetTest = () => {
    setActiveExamId(null);
    setIsTestRunning(false);
    setLatestSubmission(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  // Helper formatting for remaining seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Categories lookup
  const categories = ["الكل", ...Array.from(new Set(exams.map(e => e.category)))];

  // Filtering exams list
  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "الكل" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* PROFILE WELCOME CARD */}
      {profileConfirmed ? (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white p-3.5 rounded-xl shadow-md">
              <User className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">أهلاً بك في بوابة التقييم</span>
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                {candidateName}
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {candidateEmail} {candidatePhone ? `| ${candidatePhone}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleClearProfile}
            className="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100/60 px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 self-end md:self-auto cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>تسجيل الخروج أو تبديل الحساب</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-md max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="bg-indigo-50 p-4 rounded-full inline-block border border-indigo-100">
              <ClipboardCheck className="h-10 w-10 text-indigo-700" />
            </div>
            <h2 className="text-2xl font-extrabold text-indigo-950 font-sans">بوابة المتقدمين للاختبار</h2>
            <p className="text-sm text-slate-500">
              يرجى ملء بياناتك الشخصية للبدء في إجراء الاختبارات والتقييمات التخصصية بنجاح
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">اسمك <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="مثال: سفاح"
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">ايديك <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute right-3.5 top-[14px] text-[11px] font-extrabold text-slate-400 select-none tracking-wider font-mono">ID</div>
                <input
                  type="text"
                  required
                  placeholder="مثال: 12345"
                  value={candidateEmail}
                  onChange={e => setCandidateEmail(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">خبراتك (اختياري)</label>
              <div className="relative">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="absolute right-3.5 top-[13px] h-4 w-4 text-slate-400"
                >
                  <path d="M19 11v-3.5a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1h4.5l3 5.5a1 1 0 0 0 1.2.4l1.5-.7a1 1 0 0 0 .5-1.2L16 11H19z" />
                  <path d="M11 9h.01" />
                </svg>
                <input
                  type="text"
                  placeholder="مثال: ايم تدبيل سواقه"
                  value={candidatePhone}
                  onChange={e => setCandidatePhone(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>تأكيد البيانات والانتقال لقائمة الاختبارات</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* DETAILED EXAM SELECTION / DASHBOARD (Only shown after profile is confirmed and no active test/result screen) */}
      {profileConfirmed && !isTestRunning && !evaluating && !latestSubmission && (
        <div className="space-y-6">
          <div className="text-center py-4">
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2 select-none">
              <BookOpen className="h-6 w-6 text-indigo-700" />
              <span>هيا بنا لنبدا</span>
            </h2>
          </div>

          {/* EXAMS CONTAINER */}
          {filteredExams.length > 0 ? (
            <div className="flex justify-center">
              {filteredExams.map(exam => {
                return (
                  <div 
                    key={exam.id}
                    className="bg-white border border-slate-100/90 rounded-3xl p-6 hover:shadow-lg transition-all flex flex-col justify-between space-y-5 hover:border-slate-200 max-w-sm w-full shadow-sm text-center"
                  >
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-slate-950 text-lg leading-snug">
                        {exam.title}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        {exam.description}
                      </p>
                    </div>

                    <button
                      onClick={() => startExam(exam)}
                      className="w-full flex items-center justify-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all focus:ring-2 focus:ring-indigo-300 group cursor-pointer"
                    >
                      <span>ابدأ الاختبار المعتمد</span>
                      <Play className="h-4 w-4 text-white transition-transform group-hover:translate-x-[-2px]" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center bg-white p-12 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <BookOpen className="h-10 w-10 text-slate-300" />
              <p className="text-xs font-bold text-slate-500">لم يتم العثور على أي اختبارات مطابقة.</p>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE TESTING ENVIRONMENT SCREEN */}
      {isTestRunning && activeExam && (
        <div className="relative border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-2xl mx-auto bg-slate-950 text-white min-h-[450px]">
          {/* Ambient background with dark overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.28] pointer-events-none"
            style={{ backgroundImage: `url(${bgImage})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-950/98 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col justify-between h-full min-h-[450px]">
            {/* Header statistics of test */}
            <div className="bg-slate-900/60 border-b border-slate-800/80 p-4 sm:p-6 flex items-center justify-between backdrop-blur-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-indigo-400 block tracking-wide uppercase">اختبار جريان التوظيف النشط</span>
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{activeExam.title}</h3>
              </div>
              
              {/* Visual timer countdown */}
              <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-slate-800">
                <Hourglass className="h-4 w-4 text-amber-500 animate-spin" />
                <span className="text-xs sm:text-sm font-bold font-mono tracking-wider text-amber-400">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Graphical progress line */}
            <div className="bg-slate-900 h-1.5 w-full">
              <div 
                className="bg-indigo-600 h-1.5 transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                style={{ width: `${((currentQuestionIndex + 1) / activeExam.questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Active Question Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                <span>السؤال {currentQuestionIndex + 1} من {activeExam.questions.length}</span>
                <span className="bg-slate-900/80 text-indigo-400 px-2.5 py-1 rounded border border-slate-800 font-extrabold shadow-sm">
                  الدرجة المستحقة: {(100 / activeExam.questions.length).toFixed(1)} درجة
                </span>
              </div>

              {/* Title text */}
              <h2 className="text-base sm:text-lg font-extrabold text-white leading-relaxed text-right drop-shadow">
                {activeExam.questions[currentQuestionIndex].text}
              </h2>

              {/* Code Highlight snippet if is technical */}
              {activeExam.questions[currentQuestionIndex].codeSnippet && (
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-emerald-450 font-mono text-xs p-4 border border-slate-800/80 text-left" style={{ direction: "ltr" }}>
                  <div className="absolute top-2 right-3 text-[10px] text-slate-500 select-none">كود برمجي</div>
                  <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed mt-2">
                    <code>{activeExam.questions[currentQuestionIndex].codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Vertical Multioptions selection */}
              <div className="space-y-3">
                {activeExam.questions[currentQuestionIndex].options.map((option, idx) => {
                  const questionId = activeExam.questions[currentQuestionIndex].id;
                  const isSelected = answers[questionId] === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(questionId, idx)}
                      className={`w-full p-4 rounded-xl text-right text-xs sm:text-sm border transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10 font-black text-indigo-200"
                          : "bg-slate-900/40 hover:bg-slate-900/70 border-slate-800/80 hover:border-slate-700 text-slate-350"
                      }`}
                    >
                      <span className="flex-1 pr-2">{option}</span>
                      <span className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-indigo-500 bg-indigo-500/80" : "border-slate-700 bg-slate-850"
                      }`}>
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white"></span>}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Alert Message for Server Name Requirement */}
              <div className="mt-6 p-4 bg-amber-950/20 border border-amber-500/20 text-amber-200 rounded-2xl flex flex-col gap-2.5 shadow-sm text-right backdrop-blur-sm">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-400">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>تنبيه هام جداً</span>
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-amber-100 leading-relaxed">
                  يجب عليك وضع هذا الاسم داخل السيرفر (إجباري)
                </p>
                <div className="bg-amber-950/60 border border-amber-500/30 py-2.5 px-4 rounded-xl font-mono text-center text-xs sm:text-sm select-all text-amber-300 font-extrabold tracking-wider">
                  BL | SAFAH | 30851
                </div>
                <p className="text-xs text-amber-400/85 font-bold">
                  * فقط عدل الاسم والايدي
                </p>
              </div>
            </div>

            {/* Control Actions bottom bar */}
            <div className="bg-slate-900/60 border-t border-slate-800/80 p-4 sm:p-6 flex items-center justify-between backdrop-blur-sm">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-xl transition-all border cursor-pointer ${
                  currentQuestionIndex === 0
                    ? "opacity-30 cursor-not-allowed text-slate-500 border-slate-800 bg-transparent"
                    : "text-slate-300 bg-slate-900 hover:bg-slate-800 border-slate-800"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
                <span>السابق</span>
              </button>

              {currentQuestionIndex < activeExam.questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 text-white bg-indigo-600 hover:bg-indigo-700 font-bold text-xs px-4  py-2 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                >
                  <span>التالي</span>
                  <ChevronLeft className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={submitTest}
                  className="flex items-center gap-1.5 text-white bg-emerald-600 hover:bg-emerald-700 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all focus:ring-2 focus:ring-emerald-300 animate-pulse cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>إنهاء وتسليم الاختبار</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI EVALUATING INTERMEDIARY LOADING SCREEN */}
      {evaluating && (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-lg max-w-md mx-auto text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <BrainCircuit className="absolute top-5 left-5 h-10 w-10 text-indigo-600 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">يتم المراجعة الآن...</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              يرجى الانتظار ثوانٍ معدودة.
            </p>
          </div>

          <div className="p-3 bg-indigo-50 rounded-xl space-y-1 text-right text-xs text-indigo-950 font-bold">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>مراجعة الإجابات الفنية...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>تحليل الفجوات ومطابقتها مع سوق العمل...</span>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS AND COMPREHENSIVE PERSONAL EVALUATION REPORT VIEW */}
      {latestSubmission && activeExam && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Title Badge Banner */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                  latestSubmission.passed ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                }`}>
                  {latestSubmission.passed ? "تم الاجتياز بنجاح" : "لم يتم اجتياز الحد الأدنى للقبول"}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
                  {activeExam.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-sans leading-snug">
                نتيجة اختبار: {activeExam.title}
              </h2>
              <p className="text-xs text-slate-500">
                المرشح: <strong className="text-slate-700 font-bold">{latestSubmission.candidateName}</strong> | انتهى بـ {new Date(latestSubmission.completedAt).toLocaleTimeString("ar-EG")}
              </p>
            </div>

            {/* Score circle */}
            <div className="flex items-center justify-center gap-4 shrink-0">
              <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    stroke={latestSubmission.passed ? "#10b981" : "#ef4444"} 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - latestSubmission.score / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">{latestSubmission.score}%</span>
                  <span className="text-[9px] text-slate-400 block font-semibold">المعدل النهائي</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs">
                  <span className="text-slate-400 block">درجة اجتياز القبول</span>
                  <span className="font-bold text-slate-700 text-xs">60% كحد أدنى</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block">مرآة القرار</span>
                  <span className={`font-bold test-sm ${latestSubmission.passed ? "text-emerald-600" : "text-red-500"}`}>
                    {latestSubmission.passed ? "تأهيل للخطوة التالية" : "محاولة أخرى مفضلة"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tab selection */}
          <div className="flex items-center gap-1 border-b border-slate-100">
            {latestSubmission.passed && (
              <button
                onClick={() => setActiveTab("certificate")}
                className={`py-3 px-4 sm:px-6 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "certificate"
                    ? "border-amber-500 text-amber-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Award className="h-4 w-4" />
                <span>شهادة التوطين والاجتياز</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("report")}
              className={`py-3 px-4 sm:px-6 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "report"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BrainCircuit className="h-4 w-4" />
              <span>تقرير التقييم التفصيلي بالذكاء الاصطناعي</span>
            </button>

            <button
              onClick={() => setActiveTab("review")}
              className={`py-3 px-4 sm:px-6 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "review"
                  ? "border-slate-800 text-slate-800"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>مراجعة وتفسير جميع إجاباتك</span>
            </button>
          </div>

          {evalError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs py-2.5 px-4 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{evalError}</span>
            </div>
          )}

          {/* Tab Contents */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            {activeTab === "certificate" && latestSubmission.passed && (
              <Certificate
                candidateName={latestSubmission.candidateName}
                examTitle={latestSubmission.examTitle}
                score={latestSubmission.score}
                dateString={latestSubmission.completedAt}
                onReset={handleResetTest}
              />
            )}

            {activeTab === "report" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">تحليل الخبير الافتراضي التخصصي</h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> تم التوليد بنموذج الذكاء الاصطناعي
                  </span>
                </div>
                <MarkdownRenderer content={latestSubmission.feedback} />
              </div>
            )}

            {activeTab === "review" && (
              <div className="space-y-8">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">مقارنة وتفنيد إجاباتك الفردية</h3>
                  <p className="text-xs text-slate-400 mt-1">يُنظر في كل إجابة لشرح الفائدة العلمية منها لتحويل التقييم لفرصة تعليمية قيمة.</p>
                </div>

                <div className="space-y-6">
                  {activeExam.questions.map((q, qIndex) => {
                    const selectedIdx = latestSubmission.answers[q.id];
                    const isCorrect = selectedIdx === q.correctOptionIndex;

                    return (
                      <div 
                        key={q.id}
                        className={`p-5 rounded-2xl border text-right space-y-4 transition-all ${
                          isCorrect 
                            ? "bg-emerald-50/20 border-emerald-200/50" 
                            : "bg-red-50/10 border-red-200/40"
                        }`}
                      >
                        {/* Question state header */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">السؤال {qIndex + 1}:</span>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                            isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}>
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" /> إجابة صحيحة
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" /> إجابة غير صحيحة
                              </>
                            )}
                          </span>
                        </div>

                        {/* Text */}
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{q.text}</h4>

                        {/* Options comparison */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt, oIdx) => {
                            const isCorrectOpt = oIdx === q.correctOptionIndex;
                            const isSelectedOpt = oIdx === selectedIdx;

                            let optClass = "bg-white border-slate-100 text-slate-700";
                            if (isCorrectOpt) {
                              optClass = "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold";
                            } else if (isSelectedOpt && !isCorrectOpt) {
                              optClass = "bg-red-50 border-red-300 text-red-950 font-medium";
                            }

                            return (
                              <div key={oIdx} className={`p-3 rounded-xl border flex items-center justify-between ${optClass}`}>
                                <span>{opt}</span>
                                {isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                                {isSelectedOpt && !isCorrectOpt && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Scientific Explanation */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs leading-relaxed text-slate-600">
                          <strong className="text-slate-800 block mb-1">💡 التفسير الفني:</strong>
                          {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* F8 Overlays Configuration Notice */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-right space-y-6">
            <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-full text-rose-400">
              <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">تنويه هام جداً للأعضاء</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-white">مع تمنياتنا لكم بالتوفيق .. يعطيكم العافية</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                يلي مش مفعّل الخيارات اللي بالصورة التوضيحية أدناه من قائمة <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-indigo-400 font-mono text-xs">F8</span>، ضروري تفعلونها لمراقبة أداء اللعبة وبينغ الاتصال في السيرفر بشكل مستمر.
              </p>
            </div>

            {/* Pixel Perfect F8 Console Simulation */}
            <div className="max-w-md mx-auto bg-[#181a1f] border border-[#2d3139] rounded-xl overflow-hidden shadow-2xl font-mono text-left text-xs text-white relative">
              {/* Header Menu Tabs */}
              <div className="bg-[#2d3238] flex select-none text-[10px] sm:text-xs border-b border-[#181a1f] items-center">
                <div className="bg-[#3a6598] px-3.5 py-2 text-white font-bold flex items-center gap-1 border-r border-[#181a1f]">
                  Overlays
                </div>
                <div className="px-3.5 py-2 text-slate-300 hover:text-white transition-colors border-r border-[#181a1f]">
                  Launch
                </div>
                <div className="px-3.5 py-2 text-slate-300 hover:text-white transition-colors border-r border-[#181a1f]">
                  Quit
                </div>
                <div className="px-3.5 py-2 text-slate-300 hover:text-white transition-colors border-r border-[#181a1f]">
                  Tools
                </div>
                <div className="px-3.5 py-2 text-slate-300 hover:text-white transition-colors">
                  Game
                </div>
              </div>

              {/* Console Log Simulation Background with Translucent Overlays */}
              <div className="p-4 bg-[#14151a] min-h-[140px] relative overflow-hidden flex flex-col gap-1 select-none">
                {/* Console scroll mock logs */}
                <div className="opacity-[0.12] text-[9px] space-y-0.5 leading-none pointer-events-none select-none">
                  <div className="text-amber-500">script:G8-Emtoe V4.4 [G8.Mods] Animation Initialized...</div>
                  <div className="text-indigo-400">script:G8-Emtoe V4.4 [G8.Mods] Animation Core Load OK</div>
                  <div className="text-amber-500">script:G8-Emtoe V4.4 [G8.Mods] Animation Loop Started</div>
                  <div className="text-purple-400">script:Danger_Robbery SCRIPT ERROR: Missing asset frame_lock</div>
                  <div className="text-indigo-400">script:G8-Emtoe V4.4 [G8.Mods] Animation Sync active_players=1</div>
                  <div className="text-emerald-400">script:G8-Emtoe V4.4 [G8.Mods] Insertion success_ack</div>
                </div>

                {/* Overlays Nested Dropdowns */}
                <div className="absolute inset-0 p-4 flex gap-3 items-start justify-start z-10 bg-black/40 backdrop-blur-[1px]">
                  {/* Left Dropdown (Overlays Main) */}
                  <div className="bg-[#242120] border border-[#3b3531] rounded shadow-lg overflow-hidden w-28 shrink-0">
                    <div className="px-2.5 py-1.5 text-slate-300 hover:bg-slate-800 text-[10px] sm:text-xs">
                      Draw FPS
                    </div>
                    <div className="px-2.5 py-1.5 text-slate-300 hover:bg-slate-800 text-[10px] sm:text-xs border-t border-[#3b3531]">
                      NetGraph
                    </div>
                    <div className="px-2.5 py-1.5 bg-[#2d8cf0] text-white text-[10px] sm:text-xs font-bold border-t border-[#3b3531] flex items-center justify-between relative group/item">
                      <span>Performance</span>
                      <span className="text-[9px]">▶</span>
                      {/* Simulation Mouse Pointer */}
                      <div className="absolute top-2 right-1.5 pointer-events-none">
                        <svg className="w-3 h-3 text-white fill-white drop-shadow" viewBox="0 0 24 24">
                          <path d="M4 4l11.73 11.73H8.55l-4.72 4.72V4z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Right Popout Dropdown (Performance Submenu) */}
                  <div className="bg-[#242120] border border-[#3b3531] rounded shadow-xl overflow-hidden flex-1 max-w-[200px]">
                    <div className="px-2.5 py-1.5 text-white text-[10px] sm:text-xs flex items-center justify-between border-b border-[#3b3531]">
                      <span>Draw Performance</span>
                      <span className="text-[#3fc060] font-bold">✔</span>
                    </div>
                    <div className="px-2.5 py-1.5 text-white text-[10px] sm:text-xs flex items-center justify-between border-b border-[#3b3531]">
                      <span>FPS</span>
                      <span className="text-[#3fc060] font-bold">✔</span>
                    </div>
                    <div className="px-2.5 py-1.5 text-white text-[10px] sm:text-xs flex items-center justify-between border-b border-[#3b3531]">
                      <span>Ping</span>
                      <span className="text-[#3fc060] font-bold">✔</span>
                    </div>
                    <div className="px-2.5 py-1.5 text-white text-[10px] sm:text-xs flex items-center justify-between">
                      <span>Packet Loss</span>
                      <span className="text-[#3fc060] font-bold">✔</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center select-none font-sans mt-2">
              * يرجى تطبيق الإعدادات المذكورة في شاشة التحكم لضمان جودة الأداء وحفظ حقوقك بالكامل داخل الكيان.
            </p>
          </div>

          {/* Action to redo or exit */}
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={handleResetTest}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm border border-slate-200 shadow-slate-100 cursor-pointer"
            >
              العودة إلى قائمة الاختبارات مجدداً
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
