"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const DEFAULT = `سياسة الخصوصية — بوابة المعرِضة

١. المعلومات التي نجمعها
نجمع المعلومات اللازمة لتشغيل حسابك: الاسم، رقم الجوال، البريد الإلكتروني، والبيانات البنكية لتحويل الأرباح.

٢. كيف نستخدم معلوماتك
- إدارة حسابك وعرض فساتينك
- تحويل أرباحك لحسابك البنكي
- التواصل معك بخصوص الطلبات

٣. حماية البيانات
نلتزم بحماية بياناتك البنكية والشخصية وعدم مشاركتها مع أي طرف ثالث دون موافقتك.

٤. بيانات الطلبات
نحتفظ بسجل طلباتك وأرباحك لأغراض المحاسبة والدعم.

٥. حقوقك
يمكنك طلب تعديل أو حذف بياناتك في أي وقت بالتواصل مع الإدارة.

٦. التحديثات
قد نحدّث هذه السياسة من وقت لآخر، وسنبلغك بأي تغييرات جوهرية.`;

export default function SellerPrivacyPage() {
  const router = useRouter();
  const [content, setContent] = useState("");

  useEffect(() => {
    getDoc(doc(db, "settings", "legal"))
      .then(snap => setContent(snap.exists() ? (snap.data()?.sellerPrivacy || snap.data()?.privacy || DEFAULT) : DEFAULT))
      .catch(() => setContent(DEFAULT));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "var(--card)", padding: "52px 20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 20 }}>←</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>سياسة الخصوصية</div>
      </div>
      <div style={{ padding: "24px 20px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 2, whiteSpace: "pre-wrap" }}>{content}</div>
      </div>
    </div>
  );
}
