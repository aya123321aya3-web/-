import { ShieldCheck, UserCheck, Skull, Activity } from "lucide-react";

interface NavbarProps {
  currentRole: "candidate" | "recruiter";
  setRole: (role: "candidate" | "recruiter") => void;
  examsCount: number;
}

export default function Navbar({ currentRole, setRole, examsCount }: NavbarProps) {
  return (
    <header className="bg-slate-950 text-white border-b border-slate-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* LOGO & TITLE */}
        <div className="flex items-center gap-3 text-right">
          <div className="bg-gradient-to-tr from-indigo-500 to-indigo-700 p-2.5 rounded-xl shadow-md border border-indigo-400/20">
            <Skull className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight font-sans text-white">
                تقديم BLACKLIST
              </h1>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400">
              بوابة التوظيف المعتمدة لمجتمع BLACKLIST
            </p>
          </div>
        </div>

        {/* ROLE SELECTOR SWITCHES */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner w-full sm:w-auto justify-center">
          <button
            onClick={() => setRole("candidate")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 uppercase tracking-wide cursor-pointer w-1/2 sm:w-auto justify-center ${
              currentRole === "candidate"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <UserCheck className="h-4 w-4 shrink-0" />
            <span>بوابة المرشحين</span>
          </button>

          <button
            onClick={() => setRole("recruiter")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 uppercase tracking-wide cursor-pointer w-1/2 sm:w-auto justify-center ${
              currentRole === "recruiter"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>لوحة تحكم التوظيف</span>
          </button>
        </div>

        {/* STATS METRICS info */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-400 text-left">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>الحالة: <span className="text-emerald-400">نشط</span></span>
          </div>
          <div className="h-4 w-px bg-slate-800"></div>
          <div>
            <span>الاختبارات المتاحة: <span className="text-white font-bold">{examsCount} اختبار</span></span>
          </div>
        </div>

      </div>
    </header>
  );
}
