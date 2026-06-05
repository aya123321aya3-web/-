import { useState, FormEvent } from "react";
import { 
  PlusCircle, Sparkles, AlertCircle, BarChart3, Users, Award, Percent, 
  Trash2, BrainCircuit, Check, ClipboardCopy, Search, CheckCircle2, ChevronLeft,
  Lock, Unlock, LogOut, UserPlus, ShieldAlert, KeyRound
} from "lucide-react";
import { Exam, CandidateSubmission, DifficultyLevel } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";

interface RecruiterPanelProps {
  exams: Exam[];
  submissions: CandidateSubmission[];
  onCreateExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
}

export default function RecruiterPanel({
  exams,
  submissions,
  onCreateExam,
  onDeleteExam,
}: RecruiterPanelProps) {
  // Recruiter authorization state
  const [authorizedNames, setAuthorizedNames] = useState<string[]>(() => {
    const saved = localStorage.getItem("recruiter_authorized_names");
    const defaultList = ["safa7syfr"];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Keep only safa7syfr and any custom-added names, filter out the old default mock names
          const filtered = parsed.filter(name => 
            !["سفاح", "ياسر", "أبو بكر", "أحمد", "عمر", "أيا", "عبدالله"].includes(name)
          );
          if (!filtered.includes("safa7syfr")) {
            filtered.unshift("safa7syfr");
          }
          localStorage.setItem("recruiter_authorized_names", JSON.stringify(filtered));
          return filtered;
        }
      } catch (e) {
        // Fallback
      }
    }
    localStorage.setItem("recruiter_authorized_names", JSON.stringify(defaultList));
    return defaultList;
  });

  const [enteredAuthName, setEnteredAuthName] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem("recruiter_active_session_verified") === "true";
  });
  const [activeRecruiterName, setActiveRecruiterName] = useState(() => {
    return sessionStorage.getItem("recruiter_active_name") || "";
  });
  const [authError, setAuthError] = useState("");
  const [newAuthNameInput, setNewAuthNameInput] = useState("");

  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<"ai-generator" | "manual-builder" | "analytics" | "exams-manager" | "authorized-names-manager">("ai-generator");

  // AI Exam Generator inputs
  const [jobTitle, setJobTitle] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("mid");
  const [generating, setGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<Exam | null>(null);
  const [error, setError] = useState("");

  // Manual Exam Builder States
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualCategory, setManualCategory] = useState("اختبار مخصص");
  const [manualDifficulty, setManualDifficulty] = useState<DifficultyLevel>("mid");
  const [manualTimeLimit, setManualTimeLimit] = useState(30);
  const [manualQuestions, setManualQuestions] = useState<Array<{
    text: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }>>([
    { text: "", options: ["", "", "", ""], correctOptionIndex: 0, explanation: "" }
  ]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Authorization actions
  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanInput = enteredAuthName.trim();
    if (!cleanInput) return;

    const matched = authorizedNames.some(
      (name) => name.trim().toLowerCase() === cleanInput.toLowerCase()
    );

    if (matched) {
      setIsAuthorized(true);
      setActiveRecruiterName(cleanInput);
      setAuthError("");
      sessionStorage.setItem("recruiter_active_session_verified", "true");
      sessionStorage.setItem("recruiter_active_name", cleanInput);
    } else {
      setAuthError("عذراً، هذا الاسم ليس مسجلاً في قائمة المشرفين المصرح لهم بـ BLACKLIST.");
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setActiveRecruiterName("");
    setEnteredAuthName("");
    sessionStorage.removeItem("recruiter_active_session_verified");
    sessionStorage.removeItem("recruiter_active_name");
  };

  const handleAddAuthorizedName = (e: FormEvent) => {
    e.preventDefault();
    if (activeRecruiterName.trim().toLowerCase() !== "safa7syfr") {
      alert("عذراً، فقط المشرف الرئيسي safa7syfr لديه الصلاحية لإضافة مشرفين جدد.");
      return;
    }
    const cleanNewName = newAuthNameInput.trim();
    if (!cleanNewName) return;

    if (authorizedNames.some(name => name.trim().toLowerCase() === cleanNewName.toLowerCase())) {
      alert("هذا الاسم مسجل بالفعل في القائمة.");
      return;
    }

    const updated = [...authorizedNames, cleanNewName];
    setAuthorizedNames(updated);
    localStorage.setItem("recruiter_authorized_names", JSON.stringify(updated));
    setNewAuthNameInput("");
  };

  const handleRemoveAuthorizedName = (nameToRemove: string) => {
    if (activeRecruiterName.trim().toLowerCase() !== "safa7syfr") {
      alert("عذراً، فقط المشرف الرئيسي safa7syfr لديه الصلاحية لإلغاء تصاريح المشرفين.");
      return;
    }
    if (nameToRemove.trim().toLowerCase() === activeRecruiterName.trim().toLowerCase()) {
      alert("لا يمكنك مسح اسمك الفعال بينما أنت مسجل الدخول به تجنباً لغلق الجلسة المباشرة!");
      return;
    }
    if (authorizedNames.length <= 1) {
      alert("يجب الإبقاء على اسم مصرح واحد على الأقل بالنظام.");
      return;
    }
    if (confirm(`هل أنت متأكد من إلغاء تصريح المشرف "${nameToRemove}"؟`)) {
      const updated = authorizedNames.filter(name => name !== nameToRemove);
      setAuthorizedNames(updated);
      localStorage.setItem("recruiter_authorized_names", JSON.stringify(updated));
    }
  };

  // Manual Exam Builder handlers
  const updateQuestionText = (index: number, val: string) => {
    const updated = [...manualQuestions];
    updated[index].text = val;
    setManualQuestions(updated);
  };

  const updateQuestionOption = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].options[optIndex] = val;
    setManualQuestions(updated);
  };

  const updateQuestionCorrectIndex = (qIndex: number, val: number) => {
    const updated = [...manualQuestions];
    updated[qIndex].correctOptionIndex = val;
    setManualQuestions(updated);
  };

  const updateQuestionExplanation = (qIndex: number, val: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].explanation = val;
    setManualQuestions(updated);
  };

  const addManualQuestionSlot = () => {
    if (manualQuestions.length >= 30) {
      alert("الحد الأقصى هو 30 سؤالاً فقط.");
      return;
    }
    setManualQuestions([
      ...manualQuestions,
      { text: "", options: ["", "", "", ""], correctOptionIndex: 0, explanation: "" }
    ]);
  };

  const removeManualQuestionSlot = (index: number) => {
    if (manualQuestions.length <= 1) return;
    const updated = manualQuestions.filter((_, idx) => idx !== index);
    setManualQuestions(updated);
  };

  const handleCreateManualExam = (e: FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    // Filter out empty questions or complete questions
    const formattedQuestions = manualQuestions.map((q, idx) => ({
      id: idx + 1,
      text: q.text.trim() || `سؤال رقم ${idx + 1}`,
      options: q.options.map((opt, oIdx) => opt.trim() || `الخيار رقم ${oIdx + 1}`),
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation.trim() || "تفسير تلقائي للإجابة المختارة."
    }));

    const newExam: Exam = {
      id: `manual-${Date.now()}`,
      title: manualTitle,
      description: manualDescription || "اختبار مخصص تم صياغته يدوياً بواسطة الإدارة.",
      category: manualCategory,
      difficulty: manualDifficulty,
      timeLimit: manualTimeLimit,
      questions: formattedQuestions,
      isDynamic: true
    };

    onCreateExam(newExam);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    // Reset fields
    setManualTitle("");
    setManualDescription("");
    setManualQuestions([{ text: "", options: ["", "", "", ""], correctOptionIndex: 0, explanation: "" }]);
    setActiveSubTab("exams-manager"); // Redirect to manager to show it
  };

  // Inspect specific submission
  const [selectedSubmission, setSelectedSubmission] = useState<CandidateSubmission | null>(null);

  // Search Filter
  const [searchSubmissions, setSearchSubmissions] = useState("");

  const handleGenerateExam = async (e: FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    setGenerating(true);
    setError("");
    setGeneratedExam(null);

    try {
      const response = await fetch("/api/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, difficulty })
      });

      if (!response.ok) {
        throw new Error("فشل الخادم في تلبية طلب توليد الاختبار الذكي");
      }

      const resData = await response.json();
      if (!resData.exam) {
        throw new Error("بنية بيانات الاختبار المنتج من الخادم غير صالحة");
      }

      setGeneratedExam(resData.exam);
      onCreateExam(resData.exam); // save to central dashboard state
    } catch (err: any) {
      console.error(err);
      setError("حدث عائق تقني أثناء الاتصال بالذكاء الاصطناعي: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Calculations for analytics tab
  const totalCompleted = submissions.length;
  const averageScore = totalCompleted 
    ? Math.round(submissions.reduce((acc, curr) => acc + curr.score, 0) / totalCompleted)
    : 0;
  const passingSubmissions = submissions.filter(s => s.passed).length;
  const averagePassingRate = totalCompleted
    ? Math.round((passingSubmissions / totalCompleted) * 100)
    : 0;

  // Filtered submissions log
  const filteredSubmissions = submissions.filter(s => {
    return s.candidateName.toLowerCase().includes(searchSubmissions.toLowerCase()) ||
           s.candidateEmail.toLowerCase().includes(searchSubmissions.toLowerCase()) ||
           s.examTitle.toLowerCase().includes(searchSubmissions.toLowerCase());
  });

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-8 bg-slate-900 border border-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 text-right relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/15 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-600/10 rounded-full filter blur-2xl"></div>

        <div className="text-center space-y-3 relative z-10">
          <div className="bg-gradient-to-tr from-indigo-500 to-indigo-700 p-4 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center shadow-lg border border-indigo-400/20">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg sm:text-xl text-white">لوحة تحكم المشرفين والتوظيف</h2>
            <p className="text-xs text-slate-400 mt-1">بوابة الحماية والمراقبة لعائلة BLACKLIST</p>
          </div>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">يرجى إدخال اسم مسؤول التوظيف المصرح له:</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="أدخل اسمك هنا..."
                value={enteredAuthName}
                onChange={(e) => setEnteredAuthName(e.target.value)}
                className="w-full pl-4 pr-11 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-white transition-all focus:outline-none placeholder-slate-600 text-right font-semibold"
              />
              <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {authError && (
            <div className="bg-red-950/80 border border-red-900 text-red-300 text-[11px] py-2 px-3 rounded-xl flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Unlock className="h-4 w-4" />
            <span>تسجيل الدخول والتحقق</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ACTIVE RECRUITER STATE BANNER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 text-right">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <Unlock className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">بوابة المشرف المعتمد</span>
            <span className="text-xs sm:text-sm font-extrabold text-white">أنت مسجل الدخول باسم: <span className="text-emerald-400">{activeRecruiterName}</span></span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-red-200 border border-red-900/40 rounded-xl text-xs font-bold transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>تسجيل خروج مشرف</span>
        </button>
      </div>

      {/* SECTION NAV TABS */}
      <div className="flex items-center gap-1 border-b border-slate-100 pb-px flex-wrap">
        <button
          onClick={() => {
            setActiveSubTab("ai-generator");
            setSelectedSubmission(null);
          }}
          className={`py-3 px-4 sm:px-6 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === "ai-generator"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>مُولّد الاختبارات بالذكاء الاصطناعي</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab("manual-builder");
            setSelectedSubmission(null);
          }}
          className={`py-3 px-4 sm:px-6 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === "manual-builder"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <PlusCircle className="h-4 w-4 text-emerald-600" />
          <span>صانع الاختبارات يدويًا</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab("analytics");
            setSelectedSubmission(null);
          }}
          className={`py-3 px-4 sm:px-6 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === "analytics"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>سجل المتقدمين والإحصائيات</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab("exams-manager");
            setSelectedSubmission(null);
          }}
          className={`py-3 px-4 sm:px-6 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === "exams-manager"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          <span>إدارة الاختبارات النشطة ({exams.length})</span>
        </button>

        {activeRecruiterName.trim().toLowerCase() === "safa7syfr" && (
          <button
            onClick={() => {
              setActiveSubTab("authorized-names-manager");
              setSelectedSubmission(null);
            }}
            className={`py-3 px-4 sm:px-6 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "authorized-names-manager"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="h-4 w-4 text-indigo-600" />
            <span>المشرفون المصرح لهم ({authorizedNames.length})</span>
          </button>
        )}
      </div>

      {/* SELECTED CANDIDATE DETAILED REPORT SHEET OVERLAY/MODAL */}
      {selectedSubmission && (
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">سجل تقييمات المتقدمين للعمل</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                تقرير المتقدم: {selectedSubmission.candidateName}
              </h3>
            </div>
            <button
              onClick={() => setSelectedSubmission(null)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-1"
            >
              <span>العودة للجدول</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80 space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">المعدل والنجاح</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">{selectedSubmission.score}%</span>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                  selectedSubmission.passed ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                }`}>
                  {selectedSubmission.passed ? "مؤهل" : "غير مؤهل"}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80 space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">الايدي والخبرات</span>
              <span className="text-xs font-bold text-slate-700 block line-clamp-1">{selectedSubmission.candidateEmail}</span>
              <span className="text-[10px] text-slate-500 block">{selectedSubmission.candidatePhone || "لا توجد خبرات مسجلة"}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80 space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">تاريخ الانتهاء</span>
              <span className="text-xs font-bold text-slate-700 block">
                {new Date(selectedSubmission.completedAt).toLocaleDateString("ar-EG")}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {new Date(selectedSubmission.completedAt).toLocaleTimeString("ar-EG")}
              </span>
            </div>
          </div>

          <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
            <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950 mb-3 border-r-4 border-indigo-600 pr-2">
              تقرير التقييم التفصيلي والمسيرة المهنية من المساعد الافتراضي (Markdown):
            </h4>
            <MarkdownRenderer content={selectedSubmission.feedback} />
          </div>
        </div>
      )}

      {/* RENDER ACTIVE TABS */}
      {!selectedSubmission && (
        <div className="space-y-6">
          
          {/* AI EXAM GENERATOR TAB */}
          {activeSubTab === "ai-generator" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Form Input Container */}
              <div className="lg:col-span-5 bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    <span>مُولّد الاختبارات الذكي</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    اكتب اسم أي مسمى وظيفي أو تخصص مستهدف، وسيقوم الذكاء الاصطناعي بصياغة اختبار متكامل من 5 أسئلة مع التفسير العلمي للإجابات لتصفيات الموظفين تلو الأخرى!
                  </p>
                </div>

                <form onSubmit={handleGenerateExam} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">اسم الوظيفة أو المجال التخصصي</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: مطور بايثون، كاتب محتوى، محاسب رئيسي، الخ"
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-xs sm:text-sm transition-all focus:outline-none placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">مستوى الصعوبة التقني</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { level: "junior", label: "مبتدئ" },
                        { level: "mid", label: "متوسط" },
                        { level: "senior", label: "متقدم" },
                      ].map(item => (
                        <button
                          key={item.level}
                          type="button"
                          onClick={() => setDifficulty(item.level as DifficultyLevel)}
                          className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            difficulty === item.level
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-800 text-xs py-2.5 px-4 rounded-xl flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={generating}
                    className={`w-full py-3 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      generating ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {generating ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري صياغة الأسئلة...</span>
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="h-4 w-4" />
                        <span>توليد الاختبار بالذكاء الاصطناعي</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Preview Container */}
              <div className="lg:col-span-7 space-y-4">
                {generatedExam ? (
                  <div className="bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
                    <div className="pb-4 border-b border-rose-50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" /> تم الإنتاج والدمج بنجاح
                        </span>
                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mt-2">
                          {generatedExam.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{generatedExam.description}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">معاينة أسئلة الاختبار:</h4>
                      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                        {generatedExam.questions.map((q, qIdx) => (
                          <div key={q.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60 text-right space-y-2">
                            <span className="font-extrabold text-xs text-slate-500">س {qIdx + 1}: {q.text}</span>
                            
                            {q.codeSnippet && (
                              <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-lg overflow-x-auto text-left" style={{ direction: "ltr" }}>
                                <code>{q.codeSnippet}</code>
                              </pre>
                            )}

                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                              {q.options.map((opt, oIdx) => (
                                <div 
                                  key={oIdx} 
                                  className={`p-2 rounded-lg border text-right ${
                                    oIdx === q.correctOptionIndex 
                                      ? "bg-emerald-50 text-emerald-950 border-emerald-200 font-bold" 
                                      : "bg-white border-slate-100 text-slate-600"
                                  }`}
                                >
                                  {opt}
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-200/50">
                              <span className="font-bold text-slate-600 block">التفسير العلمي المعتمد:</span>
                              {q.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3 h-full min-h-[400px]">
                    <Sparkles className="h-10 w-10 text-slate-300 animate-pulse" />
                    <h4 className="font-bold text-sm text-slate-600">لوصف الفحص التقني التلقائي</h4>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                      عند كتابة مسمى مهني كـ &quot;أخصائي خدمة عملاء&quot; ثم النقر على زر التوليد، ستظهر هنا معاينة فنية دقيقة لجميع الأسئلة والخيارات والتعليلات المنتجة ذكاءً.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MANUAL EXAM BUILDER TAB */}
          {activeSubTab === "manual-builder" && (
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-lg text-white bg-slate-950 px-4 py-2.5 rounded-2xl inline-flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-emerald-400" />
                  <span>صانع الاختبارات اليدوي المتقدم</span>
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  أنشئ اختباراً تخصصياً مخصصاً لـ BLACKLIST يدويًا باحترافية كاملة. يمكنك كتابة الأسئلة والخيارات الأربعة بالتفصيل واختيار الإجابة الصحيحة وإضافة التفسيرات لـ 30 سؤالاً كحد أقصى!
                </p>
              </div>

              <form onSubmit={handleCreateManualExam} className="space-y-6">
                {/* Meta Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block">عنوان الاختبار</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: اختبار تكتيكات وسلوك الرماية الفنية"
                      value={manualTitle}
                      onChange={e => setManualTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs transition-all focus:outline-none text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">فئة الاختبار</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: اختبار قبول، تكتيك"
                      value={manualCategory}
                      onChange={e => setManualCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs transition-all focus:outline-none text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">وقت المحاولة (بالدقائق)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={180}
                      value={manualTimeLimit}
                      onChange={e => setManualTimeLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs transition-all focus:outline-none font-mono text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">مستوى الصعوبة</label>
                    <select
                      value={manualDifficulty}
                      onChange={e => setManualDifficulty(e.target.value as DifficultyLevel)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs transition-all focus:outline-none text-right"
                    >
                      <option value="junior">مبتدئ</option>
                      <option value="mid">متوسط</option>
                      <option value="senior">متقدم</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">وصف عام عن هذا الاختبار للمتقدمين</label>
                  <textarea
                    placeholder="اكتب هنا فقرة سريعة تشرح أهمية هذا الاختبار وتوجيهاتك الخاصة..."
                    value={manualDescription}
                    onChange={e => setManualDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs transition-all focus:outline-none text-right"
                  />
                </div>

                {/* Questions List */}
                <div className="space-y-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900">
                      مجموعة الأسئلة والخيارات المكتوبة ({manualQuestions.length} سؤال حالي)
                    </h4>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded font-bold">
                      الأقصى: 30 سؤالاً
                    </span>
                  </div>

                  <div className="space-y-6">
                    {manualQuestions.map((q, idx) => (
                      <div key={idx} className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-4 shadow-sm relative text-right">
                        {/* Question title index header with remove action */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-extrabold text-indigo-700 flex items-center gap-1">
                            <span className="bg-indigo-100 text-indigo-800 h-5 w-5 rounded-full flex items-center justify-center text-[10px]">{idx + 1}</span>
                            <span>السؤال رقم {idx + 1}</span>
                          </span>

                          {manualQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeManualQuestionSlot(idx)}
                              className="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100/60 px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>حذف هذا السؤال</span>
                            </button>
                          )}
                        </div>

                        {/* Text of question */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 block">نص السؤال</label>
                          <textarea
                            required
                            placeholder="اكتب هنا نص السؤال التكتيكي أو السلوكي..."
                            value={q.text}
                            onChange={e => updateQuestionText(idx, e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-xs transition-all focus:outline-none placeholder-slate-400 text-right"
                          />
                        </div>

                        {/* Options inputs */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">الخيارات الأربعة المتاحة للإجابة</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-400 font-bold shrink-0">أ {oIdx + 1}</span>
                                <input
                                  type="text"
                                  required
                                  placeholder={`الخيار رقم ${oIdx + 1}`}
                                  value={opt}
                                  onChange={e => updateQuestionOption(idx, oIdx, e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-xs transition-all focus:outline-none placeholder-slate-400 text-right"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Correct Index Selecting & Scientific explanation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 block">الخيار الصحيح المعتمد</label>
                            <select
                              value={q.correctOptionIndex}
                              onChange={e => updateQuestionCorrectIndex(idx, Number(e.target.value))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs transition-all focus:outline-none text-right"
                            >
                              <option value={0}>الخيار الأول (أ 1)</option>
                              <option value={1}>الخيار الثاني (أ 2)</option>
                              <option value={2}>الخيار الثالث (أ 3)</option>
                              <option value={3}>الخيار الرابع (أ 4)</option>
                            </select>
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-slate-600 block">تفسير الإجابة الصحيحة للطلاب</label>
                            <input
                              type="text"
                              placeholder="مثال: تمثيل الخوف إلزامي لضمان محاكاة واقعية والحفاظ على الحياة."
                              value={q.explanation}
                              onChange={e => updateQuestionExplanation(idx, e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-xs transition-all focus:outline-none placeholder-slate-400 text-right"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add dynamic buttons control */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={addManualQuestionSlot}
                    disabled={manualQuestions.length >= 30}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all border border-slate-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="h-4 w-4 text-emerald-600" />
                    <span>إضافة سؤال جديد ({manualQuestions.length}/30)</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>حفظ ونشر التقييم المخصص للطلاب</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ANALYTICS AND CANDIDATE TABLE TAB */}
          {activeSubTab === "analytics" && (
            <div className="space-y-6">
              
              {/* Stat Counters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">إجمالي محاولات الاختبار</span>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{totalCompleted}</h3>
                    <span className="text-[10px] text-slate-400">مرشحين موثقين بالسجل</span>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">متوسط نتيجة الدرجات</span>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{averageScore}%</h3>
                    <span className="text-[10px] text-slate-400">من إجمالي العلامات</span>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                    <Award className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">نسبة الاجتياز والقبول</span>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{averagePassingRate}%</h3>
                    <span className="text-[10px] text-slate-400">تجاوزوا 60% بنجاح</span>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                    <Percent className="h-5 w-5" />
                  </div>
                </div>

              </div>

              {/* Candidates Logs Table list */}
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                
                {/* Search Bar header */}
                <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base">سجل التقارير ومسار المتقدمين للوظائف</h3>
                    <p className="text-xs text-slate-400 mt-0.5">تفصح هذه اللوحة عن بيانات الفرز وتقرير التحكيم المعتمد لكل وافد.</p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ابحث باسم المتقدم أو اسم الاختبار..."
                      value={searchSubmissions}
                      onChange={e => setSearchSubmissions(e.target.value)}
                      className="w-full pl-4 pr-11 py-2 rounded-xl text-xs bg-slate-50/80 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 placeholder-slate-400 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Table Layout */}
                {filteredSubmissions.length > 0 ? (
                  <div className="overflow-x-auto text-right">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-100">
                          <th className="p-4">اسم المتقدم</th>
                          <th className="p-4">اسم الاختبار المنجز</th>
                          <th className="p-4 text-center">الدرجة</th>
                          <th className="p-4 text-center">حالة التأهيل</th>
                          <th className="p-4">تاريخ التقديم</th>
                          <th className="p-4 text-center">التقرير الطبي والمهني</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs">
                        {filteredSubmissions.map(sub => (
                          <tr key={sub.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-sm">{sub.candidateName}</span>
                                <span className="text-slate-400 text-[10px] mt-0.5">الايدي: {sub.candidateEmail} | الخبرات: {sub.candidatePhone || "بدون خبرات"}</span>
                              </div>
                            </td>
                            <td className="p-4 font-medium text-slate-700">{sub.examTitle}</td>
                            <td className="p-4 text-center text-sm font-bold font-mono text-indigo-900">{sub.score}%</td>
                            <td className="p-4 text-center">
                              <span className={`inline-block font-extrabold text-[10px] px-2.5 py-1 rounded-full ${
                                sub.passed 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                  : "bg-red-50 text-red-700 border border-red-100"
                              }`}>
                                {sub.passed ? "ناجح ومؤهل" : "لم يجتز"}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400">
                              {new Date(sub.completedAt).toLocaleDateString("ar-EG")}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => setSelectedSubmission(sub)}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/50 rounded-xl font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <BrainCircuit className="h-3.5 w-3.5" />
                                <span>شاهد مراجعة الذكاء الاصطناعي</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                    <Users className="h-8 w-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-500">لا تتوفر محاولات توظيف أو بنتائج حالية.</p>
                    <p className="text-[10px] text-slate-400">عند ولوج أحد المتقدمين للاختبار وتسليم إجاباته، ستظهر تفاصيل تقديراته وحكمه التلقائي فوراً هنا.</p>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* EXAMS MANAGER TAB */}
          {activeSubTab === "exams-manager" && (
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">إدارة ومراقبة الاختبارات الفعالة بالمنصة</h3>
                <p className="text-xs text-slate-400 mt-1">توضح هذه القائمة مجموع الاختبارات التي يمكن للمتقدم تصفحها وخوضها فوراً.</p>
              </div>

              <div className="space-y-4">
                {exams.map((exam, index) => {
                  const isCustom = exam.isDynamic;
                  return (
                    <div 
                      key={exam.id} 
                      className="p-4 rounded-2xl border border-slate-100/80 hover:border-slate-200 transition-all flex items-center justify-between gap-4 text-right bg-slate-50/30"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400">{index + 1} #</span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">
                            {exam.category}
                          </span>
                          {isCustom && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                              مُولد بالذكاء الاصطناعي
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{exam.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">{exam.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-left text-[11px] text-slate-400 hidden sm:block">
                          <span className="block font-bold">الأسئلة: {exam.questions.length}</span>
                          <span className="block">الوقت: {exam.timeLimit} دقيقة</span>
                        </div>

                        {/* Deny deleting initial standard exams for stability */}
                        {isCustom ? (
                          <button
                            onClick={() => onDeleteExam(exam.id)}
                            className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 border border-red-100 rounded-xl transition-all cursor-pointer"
                            title="احذف الاختبار"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded font-bold uppercase select-none cursor-not-allowed">
                            رسمي أساسي
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AUTHORIZED NAMES MANAGER TAB */}
          {activeSubTab === "authorized-names-manager" && activeRecruiterName.trim().toLowerCase() === "safa7syfr" && (
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">إدارة المشرفين والمسؤولين المصرح لهم بـ BLACKLIST</h3>
                <p className="text-xs text-slate-400 mt-1">تتيح لك هذه القائمة التحكم بالأسماء المسموح لها دخول لوحة التحكم والتحكيم الفني للمرشحين.</p>
              </div>

              {/* FORM TO ADD NEW ADMIN */}
              <form onSubmit={handleAddAuthorizedName} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-3 items-end text-right">
                <div className="space-y-1.5 flex-1 w-full">
                  <label className="text-xs font-bold text-slate-600 block">إضافة اسم مشرف مصرح جديد:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: يوسف، فهد، عبدالرحمن..."
                    value={newAuthNameInput}
                    onChange={(e) => setNewAuthNameInput(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm transition-all focus:outline-none placeholder-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>إضافة للقائمة</span>
                </button>
              </form>

              {/* LIST OF CURRENT ADMINS */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-500">قائمة المسؤولين الحاليين المؤهلين للولوج ({authorizedNames.length}):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {authorizedNames.map((name, index) => {
                    const isSelf = name.trim().toLowerCase() === activeRecruiterName.trim().toLowerCase();
                    return (
                      <div 
                        key={index}
                        className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between text-right"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isSelf ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></div>
                          <span className="text-xs font-bold text-slate-800">
                            {name} {isSelf && <span className="text-[10px] text-emerald-600 font-extrabold">(أنت حالياً)</span>}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAuthorizedName(name)}
                          disabled={isSelf}
                          className={`p-1.5 rounded-lg transition-all ${
                            isSelf 
                              ? "text-slate-300 cursor-not-allowed" 
                              : "text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          }`}
                          title={isSelf ? "لا يمكنك حذف نفسك أثناء تشغيل الجلسة" : "حذف هذا الاسم من المصرحين"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
