"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";

const NAV = [
  {
    href: "/notifications", label: "إشعاراتي",
    svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  },
  {
    href: "/earnings", label: "أرباحي",
    svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  },
  {
    href: "/orders", label: "الطلبات",
    svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  },
  {
    href: "/dresses", label: "فساتيني",
    svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  },
  {
    href: "/dashboard", label: "الرئيسية",
    svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  },
];

export default function SellerNav() {
  const path = usePathname();
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    getDocs(query(collection(db, "notifications"), where("userId", "==", user.uid), where("read", "==", false)))
      .then(snap => setUnreadCount(snap.size))
      .catch(() => {});
  }, [user, path]);

  if (path === "/auth") return null;

  return (
    <div className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV.map(item => {
          const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
          return (
            <Link href={item.href} key={item.href} style={{ textDecoration: "none", flex: 1 }}>
              <div className={`bn-item ${active ? "active" : ""}`}>
                <div className="bn-bar" />
                <div className="bn-svg" style={{ position: "relative" }}>
                  {item.svg}
                  {item.href === "/notifications" && unreadCount > 0 && (
                    <div style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: "#C9A96E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 8, fontWeight: 800, color: "#1A0E02" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                    </div>
                  )}
                </div>
                <span className="bn-label">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
