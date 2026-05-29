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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setName(d.displayName || ""); setPhone(d.phone || "");
        setWhatsapp(d.whatsapp || ""); setInstagram(d.instagram || "");
        setArea(d.area || ""); setDescription(d.description || "");
      }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), { displayName: name, phone, whatsapp, instagram, area, description });
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const inp: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.1)", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none", textAlign: "right", direction: "rtl" };

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ padding: "56px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {saved && <span style={{ fontSize: 12, color: "#34D399", fontWeight: 700 }}>✓ تم الحفظ</span>}
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>الإعدادات</div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 14, textAlign: "right" }}>معلومات المحل</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input style={inp} placeholder="اسم المحل" value={name} onChange={e => setName(e.target.value)} />
            <input style={inp} placeholder="المنطقة" value={area} onChange={e => setArea(e.target.value)} />
            <input style={inp} placeholder="رقم الجوال" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
            <input style={inp} placeholder="واتساب" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} type="tel" />
            <input style={inp} placeholder="إنستقرام" value={instagram} onChange={e => setInstagram(e.target.value)} />
            <textarea style={{ ...inp, height: 90, resize: "none" }} placeholder="وصف المحل..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>

        <button onClick={save} disabled={saving} style={{ width: "100%", padding: "14px", borderRadius: 16, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#1A0E05", marginBottom: 12, opacity: saving ? 0.7 : 1 }}>
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>

        <button onClick={logout} style={{ width: "100%", padding: "14px", borderRadius: 16, border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: "rgba(239,68,68,0.06)", color: "#EF4444" }}>
          تسجيل الخروج
        </button>
      </div>
      <SellerNav />
    </div>
  );
}
