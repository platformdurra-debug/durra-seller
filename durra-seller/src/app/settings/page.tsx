"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SellerNav from "@/components/SellerNav";

export default function SellerSettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // بيانات المحل
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");

  // بيانات الاستلام البنكية
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [iban, setIban] = useState("");
  const [beneficiaryPhone, setBeneficiaryPhone] = useState("");

  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setName(d.displayName || "");
        setPhone(d.phone || "");
        setWhatsapp(d.whatsapp || "");
        setInstagram(d.instagram || "");
        setArea(d.area || "");
        setDescription(d.description || "");
        setBankName(d.bankName || "");
        setAccountName(d.accountName || "");
        setIban(d.iban || "");
        setBeneficiaryPhone(d.beneficiaryPhone || "");
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [user, loading]);

  const saveSection = async (section: string) => {
    if (!user) return;
    setSaving(section);
    try {
      if (section === "profile") {
        await updateDoc(doc(db, "users", user.uid), { displayName: name, phone, whatsapp, instagram, area, description });
      } else if (section === "bank") {
        await updateDoc(doc(db, "users", user.uid), { bankName, accountName, iban, beneficiaryPhone });
      }
      setSaved(section);
      setTimeout(() => setSaved(null), 2000);
    } finally { setSaving(null); }
  };

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 2 }}>SELLER</div>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">الإعدادات</div>
        <div className="page-sub">معلومات محلك وبيانات الاستلام</div>
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── معلومات المحل ── */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            {saved === "profile" && <span style={{ fontSize: 12, color: "#34D399", fontWeight: 700 }}>✓ تم الحفظ</span>}
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", textAlign: "right" }}>معلومات المحل</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="input" placeholder="اسم المحل" value={name} onChange={e => setName(e.target.value)} />
            <input className="input" placeholder="المنطقة" value={area} onChange={e => setArea(e.target.value)} />
            <input className="input" placeholder="رقم الجوال" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
            <input className="input" placeholder="واتساب" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} type="tel" />
            <input className="input" placeholder="إنستقرام (اختياري)" value={instagram} onChange={e => setInstagram(e.target.value)} />
            <textarea className="input" placeholder="وصف المحل..." value={description} onChange={e => setDescription(e.target.value)} style={{ height: 90, resize: "none" }} />
          </div>
          <button onClick={() => saveSection("profile")} disabled={saving === "profile"} className="btn-gold" style={{ marginTop: 14 }}>
            {saving === "profile" ? "جاري الحفظ..." : "حفظ المعلومات"}
          </button>
        </div>

        {/* ── بيانات الاستلام ── */}
        <div className="card" style={{ borderColor: "rgba(201,169,110,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            {saved === "bank" && <span style={{ fontSize: 12, color: "#34D399", fontWeight: 700 }}>✓ تم الحفظ</span>}
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", textAlign: "right" }}>🏦 بيانات الاستلام</div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text4)", marginBottom: 14, textAlign: "right", lineHeight: 1.6 }}>
            ستُستخدم هذه البيانات لتحويل أرباحك عند طلب الصرف
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="input" placeholder="اسم البنك" value={bankName} onChange={e => setBankName(e.target.value)} />
            <input className="input" placeholder="اسم صاحب الحساب" value={accountName} onChange={e => setAccountName(e.target.value)} />
            <input className="input" placeholder="رقم IBAN" value={iban} onChange={e => setIban(e.target.value.toUpperCase())} style={{ direction: "ltr", textAlign: "left" }} />
            <input className="input" placeholder="رقم جوال المستفيد" value={beneficiaryPhone} onChange={e => setBeneficiaryPhone(e.target.value)} type="tel" />
          </div>
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.15)" }}>
            <div style={{ fontSize: 11, color: "rgba(201,169,110,0.5)", lineHeight: 1.7, textAlign: "right" }}>
              ⚠️ تأكدي من صحة البيانات — درّة غير مسؤولة عن أي تحويل خاطئ
            </div>
          </div>
          <button onClick={() => saveSection("bank")} disabled={saving === "bank"} className="btn-gold" style={{ marginTop: 14 }}>
            {saving === "bank" ? "جاري الحفظ..." : "حفظ بيانات الاستلام"}
          </button>
        </div>

        {/* ── تسجيل الخروج ── */}
        <button onClick={logout} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "1px solid rgba(192,57,43,0.2)", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 700, fontSize: 14, background: "rgba(192,57,43,0.05)", color: "var(--red)" }}>
          تسجيل الخروج
        </button>

      </div>
      <SellerNav />
    </div>
  );
}
