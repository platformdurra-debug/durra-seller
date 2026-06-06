"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

// ═══════════════════════════════════════════════
// بوابة العقد — تمنع الوصول حتى يوقّع المنضمّ العقد
// seller = "seller" أو "provider"
// ═══════════════════════════════════════════════
export default function ContractGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [needSign, setNeedSign] = useState(false);
  const [contractTitle, setContractTitle] = useState("");
  const [contractTerms, setContractTerms] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (loading || !user?.uid) return;
    (async () => {
      try {
        // هل وقّع العقد من قبل؟
        const signedSnap = await getDoc(doc(db, "contracts", "seller_" + user.uid));
        if (signedSnap.exists() && signedSnap.data()?.signed) {
          setNeedSign(false); setChecking(false); return;
        }
        // اجلب بنود العقد
        const termsSnap = await getDoc(doc(db, "settings", "contractSeller"));
        if (termsSnap.exists() && termsSnap.data()?.terms) {
          setContractTitle(termsSnap.data()!.title || "العقد");
          setContractTerms(termsSnap.data()!.terms || "");
          setNeedSign(true);
        } else {
          // الأدمن ما حدّد عقد بعد → اسمح بالمرور
          setNeedSign(false);
        }
        setChecking(false);
      } catch {
        setNeedSign(false); setChecking(false);
      }
    })();
  }, [user, loading]);

  const sign = async () => {
    if (!agreed || !user?.uid) return;
    setSigning(true);
    try {
      await setDoc(doc(db, "contracts", "seller_" + user.uid), {
        userId: user.uid,
        userName: user.displayName || "",
        audience: "seller",
        signed: true,
        signedAt: serverTimestamp(),
        contractTitle,
      });
      setNeedSign(false);
    } finally { setSigning(false); }
  };

  // ما في مستخدم → مرّر (صفحات الدخول/التسجيل تشتغل عادي)
  if (!loading && !user) return <>{children}</>;

  if (loading || checking) return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #0F0A05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div>
    </div>
  );

  if (needSign) return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #0F0A05)", padding: "40px 20px", fontFamily: "Tajawal, sans-serif", direction: "rtl", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 600, width: "100%", background: "var(--card, #1A1209)", borderRadius: 24, border: "1px solid rgba(201,169,110,0.2)", padding: 28 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📜</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text, #fff)" }}>{contractTitle}</div>
          <div style={{ fontSize: 13, color: "var(--text3, #9B8577)", marginTop: 4 }}>اقرأ البنود ووقّع للمتابعة</div>
        </div>

        <div style={{ maxHeight: "45vh", overflowY: "auto", background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 18, marginBottom: 18, fontSize: 14, lineHeight: 2, color: "var(--text2, #D5C9B8)", whiteSpace: "pre-wrap", textAlign: "right" }}>
          {contractTerms}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 18, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 14, color: "var(--text, #fff)", fontWeight: 600 }}>قرأت البنود وأوافق عليها</span>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 20, height: 20, accentColor: "#C9A96E", cursor: "pointer" }} />
        </label>

        <button onClick={sign} disabled={!agreed || signing}
          style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: agreed ? "pointer" : "not-allowed", fontFamily: "Tajawal", fontWeight: 700, fontSize: 15, background: agreed ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "rgba(255,255,255,0.1)", color: agreed ? "#1A0E02" : "#9B8577" }}>
          {signing ? "جاري التوقيع..." : "أوافق وأوقّع ✍️"}
        </button>
      </div>
    </div>
  );

  return <>{children}</>;
}
