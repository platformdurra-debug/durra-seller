"use client";
import SellerNav from "@/components/SellerNav";

const PLANS = [
  { id: "free", label: "مجانية",   price: "0",  desc: "للبداية",          features: ["5 فساتين", "إشعارات أساسية", "تقرير شهري"],                       color: "var(--text3)", popular: false },
  { id: "gold", label: "ذ�هبية",   price: "15", desc: "الأكثر شيوعاً",    features: ["20 فستان", "ظهور مميّز", "أولوية الظهور", "تقارير مفصّلة"],        color: "var(--gold3)", popular: true },
  { id: "vip",  label: "VIP",      price: "35", desc: "للمحترفين",         features: ["غير محدود", "أعلى الصفحة", "شارة VIP", "دعم أولوية"],               color: "var(--blue)",  popular: false },
];

export default function SubscriptionPage() {
  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 2 }}>SELLER</div>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">باقة الاشتراك</div>
        <div className="page-sub">الشهر الأول مجاني لجميع الباقات</div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {PLANS.map(plan => (
            <div key={plan.id} className="card" style={{ borderColor: plan.popular ? "rgba(201,169,110,0.3)" : undefined, background: plan.popular ? "rgba(201,169,110,0.02)" : undefined, position: "relative", overflow: "hidden" }}>
              {plan.popular && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #C9A96E, #E8D5A3)" }} />}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: plan.color }}>{plan.price} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text3)" }}>د.ب/شهر</span></div>
                  <div style={{ fontSize: 11, color: "var(--text4)", marginTop: 2 }}>{plan.desc}</div>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>{plan.label}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text2)" }}>{f}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                ))}
              </div>
              <button className={plan.popular ? "btn-gold" : "btn-ghost"} style={{ opacity: plan.id === "free" ? 0.6 : 1 }}>
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
