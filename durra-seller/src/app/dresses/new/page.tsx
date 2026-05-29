"use client";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const SIZES = ["XS","S","M","L","XL","XXL","مقاس خاص"];

export default function NewDressPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const inp: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.1)", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none", textAlign: "right", direction: "rtl" };

  const handleImages = (files: FileList) => {
    const arr = Array.from(files).slice(0, 5);
    setImages(arr);
    setPreviews(arr.map(f => URL.createObjectURL(f)));
  };

  const toggleSize = (s: string) => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async () => {
    if (!user || !name || !price || images.length === 0) return;
    setLoading(true);
    try {
      const urls: string[] = [];
      for (const img of images) {
        const storageRef = ref(storage, `dresses/${user.uid}/${Date.now()}_${img.name}`);
        await uploadBytes(storageRef, img);
        urls.push(await getDownloadURL(storageRef));
      }
      await addDoc(collection(db, "dresses"), {
        name, price: Number(price), category, color, description,
        size: selectedSizes, images: urls,
        sellerId: user.uid, sellerName: user.displayName,
        approved: false, available: true, rating: 0, reviewCount: 0,
        createdAt: serverTimestamp(),
      });
      router.push("/dresses");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", fontFamily: "Tajawal, sans-serif", direction: "rtl", padding: "56px 20px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 12, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>إضافة فستان جديد</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Images */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: 16 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12, textAlign: "right" }}>صور الفستان (حتى 5)</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {previews.map((p, i) => (
              <img key={i} src={p} style={{ width: 80, height: 100, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
            ))}
            <label style={{ width: 80, height: 100, borderRadius: 12, border: "2px dashed rgba(201,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => e.target.files && handleImages(e.target.files)} />
            </label>
          </div>
        </div>

        {/* Info */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input style={inp} placeholder="اسم الفستان" value={name} onChange={e => setName(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input style={inp} placeholder="السعر (د.ب)" value={price} onChange={e => setPrice(e.target.value)} type="number" />
              <input style={inp} placeholder="اللون" value={color} onChange={e => setColor(e.target.value)} />
            </div>
            <input style={inp} placeholder="الفئة (زفاف، سهرة...)" value={category} onChange={e => setCategory(e.target.value)} />
            <textarea style={{ ...inp, height: 90, resize: "none" }} placeholder="وصف الفستان..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>

        {/* Sizes */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: 16 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12, textAlign: "right" }}>المقاسات المتاحة</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
            {SIZES.map(s => (
              <button key={s} onClick={() => toggleSize(s)} style={{ padding: "7px 16px", borderRadius: 50, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 12, background: selectedSizes.includes(s) ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "rgba(255,255,255,0.06)", color: selectedSizes.includes(s) ? "#1A0E05" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }}>{s}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading || !name || !price || images.length === 0}
          style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !name || !price || images.length === 0 ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !name || !price || images.length === 0 ? "rgba(255,255,255,0.3)" : "#1A0E05", opacity: loading ? 0.7 : 1 }}>
          {loading ? "جاري الرفع..." : "رفع الفستان للمراجعة"}
        </button>
      </div>
    </div>
  );
}
