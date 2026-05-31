"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const DEFAULT = `شروط الاستخدام — بوابة المعرِضة

١. القبول بالشروط
باستخدامك لبوابة المعرِضة في منصة درّة، فإنك توافقين على الالتزام بهذه الشروط.

٢. الخدمات المقدمة
تتيح لك المنصة عرض فساتينك للتأجير واستقبال الطلبات وتتبع أرباحك.

٣. واجبات المعرِضة
- تقديم معلومات صحيحة عن الفساتين
- الحفاظ على جودة الفساتين المعروضة
- الالتزام بمواعيد التسليم والاستلام
- عدم تأجير الفساتين خارج المنصة لتجنب العمولة

٤. العمولات
تأخذ درّة نسبة متفق عليها من كل عملية تأجير ناجحة.

٥. الباقات
تختلف مميزات العرض حسب الباقة المشترك فيها.

٦. إنهاء الحساب
تحتفظ درّة بحق إيقاف أي حساب يخالف هذه الشروط.`;

export default function SellerTermsPage() {
  const router = useRouter();
  const [content, setContent] = useState("");

  useEffect(() => {
    getDoc(doc(db, "settings", "legal"))
      .then(snap => setContent(snap.exists() ? (snap.data()?.sellerTerms || snap.data()?.terms || DEFAULT) : DEFAULT))
      .catch(() => setContent(DEFAULT));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "var(--card)", padding: "52px 20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 20 }}>←</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>شروط الاستخدام</div>
      </div>
      <div style={{ padding: "24px 20px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 2, whiteSpace: "pre-wrap" }}>{content}</div>
      </div>
    </div>
  );
}
