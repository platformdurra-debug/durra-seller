"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";

export default function EditDressPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dress, setDress] = useState<any>(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "dresses", id as string)).then(snap => {
      if (snap.exists()) { const d = snap.data(); setDress(d); setPrice(String(d.price || "")); setDescription(d.description || ""); }
    });
  }, [id]);

  const save = async () => {
    setSaving(true);
    await updateDoc(doc(db, "dresses", id as string), { price: Number(price), description });
    setSaving(false);
    router.push("/dresses");
  };

  const inp: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.1)", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none", textAlign: "right", direction: "rtl" };

  if (!dress) return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", fontFamily: "Tajawal, sans-serif", direction: "rtl", padding: "56px 20px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 12, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>تعديل الفستان</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input style={inp} placeholder="السعر (د.ب)" value={price} onChange={e => setPrice(e.target.value)} type="number" />
        <textarea style={{ ...inp, height: 100, resize: "none" }} placeholder="الوصف..." value={description} onChange={e => setDescription(e.target.value)} />
        <button onClick={save} disabled={saving} style={{ width: "100%", padding: "14px", borderRadius: 16, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#1A0E05", opacity: saving ? 0.7 : 1 }}>
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
}
