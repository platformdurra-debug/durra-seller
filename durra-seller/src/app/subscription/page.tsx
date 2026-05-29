"use client";
import SellerNav from "@/components/SellerNav";

const PLANS = [
  { id: "free", label: "مجانية", price: "0", desc: "للبداية", features: ["5 فساتين", "إشعارات أساسية", "تقرير شهري"], color: "rgba(255,255,255,0.3)" },
  { id: "gold", label: "ذهبية ⭐", price: "15", desc: "الأكثر شيوعاً", features: ["20 فستان", "ظهور مميّز", "أولوية الظهور", "تقارير مفصّلة"], color: "#C9A96E", popular: true },
  { id: "vip",  label: "VIP 💎",  price: "35", desc: "للمحترفين",    features: ["غير محدود", "أعلى الصفحة", "شارة VIP", "دعم أولوية"], color: "#60A5FA" },
];

export default function SubscriptionPage() {
  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ padding: "56px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", textAlign: "center" }}>باقة الاشتراك</div>
      </div>
      <div style={{ padding: "20px" }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 20 }}>الشهر الأول مجاني لجميع الباقات ✨</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{ background: plan.popular ? "rgba(201,169,110,0.06)" : "rgba(255,255,255,0.04)", borderRadius: 20, border: `1.5px solid ${plan.popular ? "rgba(201,169,110,0.3)" : "rgba(255,255,255,0.07)"}`, padding: "20px", position: "relative", overflow: "hidden" }}>
              {plan.popular && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #C9A96E, #E8D5A3)" }} />}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: plan.color }}>{plan.price} <span style={{ fontSize: 13 }}>د.ب/شهر</span></div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{plan.desc}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{plan.label}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{f}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                ))}
              </div>
              <button style={{ width: "100%", padding: "12px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 14, background: plan.popular ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "rgba(255,255,255,0.08)", color: plan.popular ? "#1A0E05" : "rgba(255,255,255,0.5)" }}>
                {plan.id === "free" ? "باقتي الحالية" : "اختيار الباقة"}
              </button>
            </div>
          ))}
        </div>
      </div>
      <SellerNav />
    </div>
  );
}
