import { useRef } from "react";
import { Award, Calendar, CheckCircle, Download, AwardIcon, User, RefreshCw, Printer } from "lucide-react";

interface CertificateProps {
  candidateName: string;
  examTitle: string;
  score: number;
  dateString: string;
  onReset: () => void;
}

export default function Certificate({
  candidateName,
  examTitle,
  score,
  dateString,
  onReset,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = certificateRef.current?.innerHTML;
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body {
          direction: rtl;
          font-family: 'Cairo', 'Tajawal', sans-serif;
          background: white;
          padding: 0;
          margin: 0;
        }
        .no-print {
          display: none !important;
        }
        .cert-container {
          box-shadow: none !important;
          border: 2px solid #0f172a !important;
          margin: 0 !important;
          width: 100% !important;
          height: auto !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  const formattedDate = new Date(dateString).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-900 leading-relaxed no-print">
        <Award className="h-6 w-6 text-amber-600 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">تهانينا الحارة! لقد حققت متطلبات النجاح</h4>
          <p className="text-xs text-amber-800">يمكنك طباعة هذه الشهادة المهنية المعتمدة لتقديمها مع سيرتك الذاتية لمديري الموارد البشرية.</p>
        </div>
      </div>

      {/* Frame of Certificate */}
      <div 
        ref={certificateRef}
        className="cert-container bg-white border-16 border-double border-indigo-950 p-6 sm:p-12 rounded-lg relative overflow-hidden shadow-2xl mx-auto max-w-3xl"
        style={{ backgroundImage: "radial-gradient(circle, #f8fafc 10%, transparent 11%)", backgroundSize: "20px 20px" }}
      >
        {/* Decorative corner motifs */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-amber-500 m-2"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-amber-500 m-2"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-amber-500 m-2"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-amber-500 m-2"></div>

        {/* Certificate Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
          <AwardIcon className="w-96 h-96 text-indigo-900" />
        </div>

        <div className="relative text-center space-y-6 z-10">
          {/* Logo & Header */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="bg-amber-500/10 p-3 rounded-full border border-amber-500/30">
              <Award className="h-10 w-10 text-amber-600" />
            </div>
            <span className="text-xs uppercase tracking-widest text-indigo-900 font-bold">سمارت ريكروتر • Smart Recruiter</span>
            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-950 font-sans tracking-wide">
            شهادة توظيف معتمدة
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            تُمنح هذه الشهادة كإثبات رسمي لتجاوز اختبار التقييم التخصصي
          </p>

          <div className="py-2">
            <p className="text-sm font-semibold text-slate-400">نشهد بكل فخر أن السيد/ة:</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 my-2 underline decoration-amber-500 decoration-wavy offset-8">
              {candidateName}
            </h2>
          </div>

          <p className="max-w-md mx-auto text-slate-700 text-sm sm:text-base leading-relaxed">
            قد أكمل واجتاز بنجاح مذهل الاختبار التقييمي الاحترافي بعنوان:
            <br />
            <strong className="text-indigo-900 text-base sm:text-lg block mt-1 font-bold">
              &quot;{examTitle}&quot;
            </strong>
          </p>

          <div className="bg-slate-50 border border-slate-100 py-3 px-6 rounded-xl inline-flex items-center gap-6 justify-center my-4">
            <div className="text-center">
              <span className="text-xs text-slate-500 block">النسبة المحققة</span>
              <span className="text-xl font-bold text-emerald-600">{score}%</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-center">
              <span className="text-xs text-slate-500 block">الحالة</span>
              <span className="text-xs font-bold text-white bg-emerald-600 px-3 py-1 rounded-full block mt-0.5">ناجح ومؤهل</span>
            </div>
          </div>

          {/* Signatures and Seals */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100 text-right">
            <div>
              <span className="text-[10px] text-slate-400 block">تاريخ الإصدار</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium mt-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-800" />
                <span>{formattedDate}</span>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-slate-400 block">جهة البث والتقييم</span>
              <div className="mt-1">
                <span className="text-xs font-medium text-slate-900 block font-serif italic">Smart Recruiter HR Team</span>
                <span className="text-[9px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                  <CheckCircle className="h-2.5 w-2.5" /> تم التحقق بنجاح
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-950 hover:bg-slate-900 text-white rounded-xl shadow-md font-medium text-sm transition-all focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>طباعة الشهادة الرسمية</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 font-medium text-sm transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>الولوج لاختبار آخر</span>
        </button>
      </div>
    </div>
  );
}
