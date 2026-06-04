"use client";
import { useState } from "react";
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, getDoc } from "firebase/firestore";
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
      // ── فحص حد الباقة ──
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const planId = userSnap.data()?.plan || "basic";
      const planSnap = await getDoc(doc(db, "subscriptionPlans", planId));
      const maxDresses = planSnap.exists() ? (planSnap.data()?.maxDresses ?? -1) : -1;

      if (maxDresses !== -1) {
        const existing = await getDocs(query(collection(db, "dresses"), where("sellerId", "==", user.uid)));
        if (existing.size >= maxDresses) {
          alert(`وصلتِ للحد الأقصى لباقتك (${maxDresses} فساتين). رقّي باقتك لرفع المزيد.`);
          setLoading(false);
          return;
        }
      }

      const urls: string[] = [];
      for (const img of images) {
        const storageRef = ref(storage, `dressRequests/${user.uid}/${Date.now()}_${img.name}`);
        await uploadBytes(storageRef, img);
        urls.push(await getDownloadURL(storageRef));
      }
      // طلب فستان — يُراجع من الإدارة قبل النشر
      const reqRef = await addDoc(collection(db, "dressRequests"), {
        name: name || "",
        suggestedPrice: Number(price) || 0,
        category: category || "",
        color: color || "",
        description: description || "",
        size: selectedSizes || [],
        images: urls,
        sellerId: user.uid,
        sellerName: user.displayName || "معرِضة",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      // إشعار للأدمن
      await addDoc(collection(db, "notifications"), {
        userId: "admin",
        type: "dress_request",
        title: "👗 طلب فستان جديد للمراجعة",
        body: (user.displayName || "معرِضة") + " قدّمت طلب فستان: " + (name || ""),
        requestId: reqRef.id,
        read: false,
        createdAt: serverTimestamp(),
      });
      router.push("/dresses");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Tajawal, sans-serif", direction: "rtl", padding: "52px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>تقديم طلب فستان</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Images */}
        <div className="card">
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, fontWeight: 600 }}>صور الفستان (حتى 5)</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {previews.map((p, i) => <img key={i} src={p} style={{ width: 80, height: 100, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }} />)}
            <label className="upload-box" style={{ width: 80, height: 100, flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => e.target.files && handleImages(e.target.files)} />
            </label>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="input" placeholder="اسم الفستان" value={name} onChange={e => setName(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input className="input" placeholder="السعر المقترح (د.ب)" value={price} onChange={e => setPrice(e.target.value)} type="number" />
              <input className="input" placeholder="اللون" value={color} onChange={e => setColor(e.target.value)} />
            </div>
            <input className="input" placeholder="الفئة (زفاف، سهرة...)" value={category} onChange={e => setCategory(e.target.value)} />
            <textarea className="input" placeholder="وصف الفستان..." value={description} onChange={e => setDescription(e.target.value)} style={{ height: 80, resize: "none" }} />
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, fontWeight: 600 }}>المقاسات المتاحة</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
            {SIZES.map(s => (
              <button key={s} onClick={() => toggleSize(s)}
                style={{ padding: "7px 16px", borderRadius: 50, border: `1px solid ${selectedSizes.includes(s) ? "transparent" : "var(--border)"}`, cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600, fontSize: 12, background: selectedSizes.includes(s) ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "var(--card)", color: selectedSizes.includes(s) ? "#1A0E02" : "var(--text3)", transition: "all 0.15s" }}>{s}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading || !name || !price || images.length === 0} className="btn-gold"
          style={{ opacity: !name || !price || images.length === 0 ? 0.5 : 1 }}>
          {loading ? "جاري الإرسال..." : "تقديم الطلب للمراجعة"}
        </button>
      </div>
    </div>
  );
}
