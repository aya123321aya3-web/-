import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // Initialize Gemini lazily to avoid crashing on start if API key is missing
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): { ai: GoogleGenAI | null; apiKeyExists: boolean } {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
      return { ai: null, apiKeyExists: false };
    }
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return { ai: aiClient, apiKeyExists: true };
  }

  // API Route: Dynamic Quiz Generation
  app.post("/api/generate-exam", async (req, res) => {
    try {
      const { jobTitle, difficulty } = req.body;

      if (!jobTitle) {
        return res.status(400).json({ error: "اسم الوظيفة مطلوب لتوليد الاختبار" });
      }

      const diffInArabic = 
        difficulty === "junior" ? "مبتدئ (Junior)" :
        difficulty === "mid" ? "متوسط (Mid-level)" : "متقدم (Senior/Expert)";

      const { ai, apiKeyExists } = getGeminiClient();

      if (!apiKeyExists || !ai) {
        // Fallback mock generator if Gemini API key is not configured in Secrets
        console.log("No active Gemini API key found, serving smart mock generation");
        const mockExam = {
          id: `mock-${Date.now()}`,
          title: `اختبار تقييمي لوظيفة: ${jobTitle}`,
          description: `اختبار تجريبي مخصص لقياس الكفاءة لمهارات ${jobTitle} بمستوى ${diffInArabic}. (ملاحظة: هذا الاختبار تم توليده تلقائياً كنموذج بديل لعدم تفعيل مفتاح الذكاء الاصطناعي)`,
          category: "تقييم ذكي تخصصي",
          difficulty: difficulty || "mid",
          timeLimit: 12,
          isDynamic: true,
          questions: [
            {
              id: 1,
              text: `ما هي المهارة الأساسية الأهم للنجاح في دورك كـ (${jobTitle})؟`,
              options: [
                "الفهم السطحي والتطبيق السريع بلا مراجعة.",
                "التواصل الفعال لحل المشكلات وفهم متطلبات العمل بدقة وجودة عالية.",
                "تجنب العمل الجماعي والاعتماد الكلي على الآراء الشخصية.",
                "العمل بدون تخطيط مسبق والاعتماد على الصدفة والارتجال."
              ],
              correctOptionIndex: 1,
              explanation: "التواصل وفهم متطلبات العمل بدقة يمثل حجر الأساس لأي وظيفة احترافية لتحقيق نتائج مستدامة تتطابق مع أهداف المنظمة."
            },
            {
              id: 2,
              text: `إذا واجهتك مشكلة غير مألوفة أثناء تأدية مهامك كـ (${jobTitle})، كيف ستتعامل معها؟`,
              options: [
                "إنكار وجود المشكلة تماماً وانتظار أن تحل نفسها بنفسها.",
                "الاستسلام وطلب الانتقال الفوري لمهام تجنبك التحديات.",
                "البحث والتحليل المنهجي للمشكلة، استشارة الزملاء ذوي الخبرة، وتقييم الحلول البديلة قبل التطبيق.",
                "اتخاذ قرارات عشوائية متسارعة قد تؤدي لتفاقم الوضع."
              ],
              correctOptionIndex: 2,
              explanation: "الوصول المنهجي لحل المشكلات من خلال البحث، والتقييم، واستشارة مرجعيات الكفاءة يقلل من الأخطاء ويساهم في استقرار العمل."
            },
            {
              id: 3,
              text: `كيف تقيس مدى جودة مخرجات عملك في منصب (${jobTitle}) بمرور السنين؟`,
              options: [
                "تحقيق ردود فعل إيجابية متسقة، وتوافق تام مع مقاييس الأداء الرئيسية (KPIs)، والتعلم المستمر وتفادي تكرار الأخطاء.",
                "بمقدار ساعات النوم اليومية أثناء الدوام.",
                "بعدد الرسائل الإلكترونية التي تتجاهلها أسبوعياً.",
                "بعدم التحدث مع زملائك أو الإدارات المعنية نهائياً."
              ],
              correctOptionIndex: 0,
              explanation: "الجودة والإنتاجية تُقاس بمدى رضا المستفيد و تحقيق الأهداف المرسومة للمنصب عبر مؤشرات أداء نوعية ورقمية واضحة."
            },
            {
              id: 4,
              text: `ما هو الأسلوب الأمثل للتطوير المهني ومواكبة تغيرات سوق العمل المتسارعة في مجال (${jobTitle})؟`,
              options: [
                "الاعتماد كلياً على معلومات قديمة تم تحصيلها منذ سنوات وتجاهل الابتكارات.",
                "الالتحاق بالدورات التدريبية المعتمدة، قراءة التقارير الدورية للشركات الرائدة، والتجربة العملية للتقنيات والمنهجيات الحديثة.",
                "الاعتراض الدائم على كل تغيير تقني وإبقاء آليات العمل كلاسيكية بالكامل.",
                "مغادرة العمل فوراً بمجرد طلب تحديث الأدوات المستعملة."
              ],
              correctOptionIndex: 1,
              explanation: "التعليم المستمر والمرونة والمواكبة الديناميكية للتطور هو الضامن الأوحد لعدم تراجع تنافسيتك المهنية في كافة القطاعات الحيوية."
            },
            {
              id: 5,
              text: `ما هي الطريقة الفضلى لإدارة الوقت والمهام المتداخلة بكفاءة في بيئة العمل المضغوطة؟`,
              options: [
                "العمل على جميع المهام معاً في نفس الوقت ببطء وبدون ترتيب أولوية.",
                "تأجيل كافة المهام لنهاية الشهر وتراكم الضغوط المهنية.",
                "تصنيف المهام حسب الأولوية والأثر (مصفوفة أيزنهاور: عاجل وهام)، ووضع جدول زمني للمتابعة واستغلال التفويض عند المتاح.",
                "الاعتذار المستمر عن القيام بالواجبات بحجة عدم توافر الوقت المريح."
              ],
              correctOptionIndex: 2,
              explanation: "ترتيب الأولويات والتنظيم العقلاني للمجهود يحد من التوتر ويمنح القدرة لتسليم المهام الكبرى في مواعيدها المقررة بجاذبية واثقة."
            }
          ]
        };
        return res.json({ exam: mockExam });
      }

      const prompt = `أنت خبير توظيف ومسؤول موارد بشرية تقني أول. قم بإنشاء اختبار توظيف مهني باللغة العربية مكون من 5 أسئلة اختيار من متعدد لوظيفة أو مهارة تدعى: "${jobTitle}"، لمستوى خبرة: "${diffInArabic}". 
يجب أن تركز الأسئلة على الكفاءة الهيكلية والمهارات الحقيقية والمواقف الواقعية لهذه الوظيفة. 
تأكد من صياغة ترويسة الأسئلة والإجابات والتوضيحات بلغة عربية سليمة وواضحة جداً وخالية من أي شوائب.
إذا كانت الوظيفة تقنية مثل (برمجة، شبكات، هندسة بيانات، أمن سيبراني)، يرجى تضمين حقل codeSnippet لعمل عينة كود أو إعدادات برمجية ليكون السؤال تفاعلياً وممتازاً، وإلا اتركه فارغاً.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "عنوان متميز ومهني ومختصر للاختبار بالكامل باللغة العربية" },
              description: { type: Type.STRING, description: "وصف ملخص وشامل لأهداف الاختبار والمهارات التي يتم محاولة قياسها" },
              category: { type: Type.STRING, description: "التخصص العام الفرعي لهذه الوظيفة" },
              difficulty: { type: Type.STRING, description: "مستوى الصعوبة" },
              timeLimit: { type: Type.INTEGER, description: "الوقت المقترح لحل الاختبار الكلي بالدقائق (مثلاً بين 8 إلى 15 دقيقة)" },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER, description: "رقم معرّف فريد للسؤال يبدأ من 1 إلى 5" },
                    text: { type: Type.STRING, description: "السؤال المطروح باللغة العربية بأسلوب واضح ومحدد" },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "مصفوفة تحتوي على 4 خيارات حصرية ومدروسة"
                    },
                    correctOptionIndex: { type: Type.INTEGER, description: "فهرس الخيار الصحيح (رقم بين 0 إلى 3)" },
                    explanation: { type: Type.STRING, description: "تفسير علمي ومهني مميز للإجابة الصحيحة باللغة العربية يوضح للباحث سبب صحة هذا الخيار وتفنيد الآخرين باختصار" },
                    codeSnippet: { type: Type.STRING, description: "كود برمجي أو سطر أوامر معروض إذا كان السؤال يتطلب تحليل كود برمجياً (اختياري)" }
                  },
                  required: ["id", "text", "options", "correctOptionIndex", "explanation"]
                }
              }
            },
            required: ["title", "description", "category", "difficulty", "timeLimit", "questions"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("الفشل في استرداد نص الاستجابة من الذكاء الاصطناعي");
      }

      const cleanJson = text.trim();
      const parsedExam = JSON.parse(cleanJson);
      
      // Inject unique dynamic ID
      parsedExam.id = `dynamic-${Date.now()}`;
      parsedExam.isDynamic = true;

      return res.json({ exam: parsedExam });
    } catch (error: any) {
      console.error("Error generating exam:", error);
      return res.status(500).json({ error: "فشل في توليد الاختبار عبر الذكاء الاصطناعي: " + error.message });
    }
  });

  // API Route: AI-powered Candidate evaluation and comprehensive personal feedback reports
  app.post("/api/evaluate-submission", async (req, res) => {
    try {
      return res.json({ feedback: "### نتمنى لك التوفيق والنجاح" });
    } catch (error: any) {
      console.error("Error evaluating submission:", error);
      return res.status(500).json({ error: "فشل استدعاء تقييم الذكاء الاصطناعي: " + error.message });
    }
  });

  // Client static assets serving logic based on environmental guidelines
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Employment Testing server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
