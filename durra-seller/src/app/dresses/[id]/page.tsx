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

  if (!dress) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Tajawal, sans-serif", direction: "rtl", padding: "52px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>تعديل الفستان</div>
      </div>

      {dress.images?.[0] && (
        <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
          <img src={dress.images[0]} style={{ width: "100%", height: 200, objectFit: "cover" }} />
        </div>
      )}

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4, textAlign: "right" }}>{dress.name}</div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, textAlign: "right" }}>{dress.category} · {dress.color}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input className="input" placeholder="السعر (د.ب)" value={price} onChange={e => setPrice(e.target.value)} type="number" />
          <textarea className="input" placeholder="الوصف..." value={description} onChange={e => setDescription(e.target.value)} style={{ height: 100, resize: "none" }} />
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-gold">{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</button>
    </div>
  );
}
