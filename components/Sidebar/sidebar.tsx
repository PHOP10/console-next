"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Menu, Badge } from "antd";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { MenuSider, IMenu, IMenuChild } from "../../config/menu";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { indexService } from "../../services/index.service";
import { useNotificationSocket } from "../../app/lib/axios/hooks/useNotificationSocket";

const Sidebar: React.FC<{ collapsed?: boolean }> = ({ collapsed }) => {
  // เพิ่ม status เพื่อเช็คสถานะการโหลด
  const { data: session, status } = useSession();
  const userRole = session?.user?.role ?? "user";

  // แปลง userId
  const rawUserId = session?.user?.userId || (session?.user as any)?.id;
  const userId = rawUserId ? String(rawUserId) : undefined;

  const pathname = usePathname();
  const intraAuth = useAxiosAuth();

  // ✅ แก้ไข 1: ใช้ useMemo เพื่อไม่ให้ service ถูกสร้างใหม่ทุกครั้งที่ render
  // ถ้าไม่ใส่ useMemo ตัว useEffect ด้านล่างจะทำงานรัวๆ เพราะ object เปลี่ยนตลอดเวลา
  const intraAuthService = useMemo(() => indexService(intraAuth), [intraAuth]);

  const [counts, setCounts] = useState<{ [key: string]: number }>({});

  // Debug: Log ดูว่า Component ถูกเรียกไหม (ดูที่ F12 Browser Console นะครับ)
  console.log("Render Sidebar | Status:", status, "| UserId:", userId);

  const fetchNotificationCounts = useCallback(async () => {
    // รอให้ Session โหลดเสร็จก่อน (authenticated)
    if (status === "loading") return;

    if (!userId) {
      console.log("❌ Sidebar: No UserId found (User might be logged out)");
      return;
    }

    try {
      // console.log("🔍 Sidebar: Fetching API...");
      const res = await intraAuthService.getNotificationCounts(userId);
      console.log("✅ Sidebar: API Response:", res);
      setCounts(res.menuCounts || {});
    } catch (error) {
      console.error("❌ Sidebar Error:", error);
    }
  }, [userId, intraAuthService, status]);

  // เรียก Socket Hook
  useNotificationSocket(userId, setCounts);

  const handleMenuClick = async (key: string) => {
    setCounts((prev) => ({ ...prev, [key]: 0 }));
    if (userId) {
      try {
        await intraAuthService.markMenuRead(userId, key);
      } catch (error) {
        console.error("Error marking read:", error);
      }
    }
  };

  // ✅ แก้ไข 2: Effect นี้จะทำงานเมื่อ userId หรือ service เปลี่ยน (ซึ่งตอนนี้เสถียรแล้ว)
  useEffect(() => {
    fetchNotificationCounts();

    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchNotificationCounts]);

  // Trigger เมื่อเปลี่ยนหน้า
  useEffect(() => {
    fetchNotificationCounts();
  }, [pathname, fetchNotificationCounts]);

  // ... (Logic Map Menu เหมือนเดิม) ...
  const filterByRole = (menu: IMenu) =>
    !menu.roles || menu.roles.includes(userRole);

  const mapMenu = MenuSider.filter(filterByRole).map((item: IMenu) => {
    if (!item.children) {
      const count = counts[item.key] || 0;
      return {
        ...item,
        label: (
          <Link
            href={`/page/${item.key}`}
            onClick={() => handleMenuClick(item.key)}
          >
            <div className="flex justify-between items-center w-full">
              <span>{item.label}</span>
              {count > 0 && (
                <Badge
                  count={count}
                  offset={[0, 0]}
                  size="small"
                  className="badge-pulse"
                />
              )}
            </div>
          </Link>
        ),
      };
    }

    const childHasNotification = item.children.some(
      (c) => (counts[c.key] || 0) > 0,
    );

    return {
      ...item,
      icon: (
        <Badge dot={childHasNotification} offset={[5, 0]}>
          {item.icon}
        </Badge>
      ),
      children: item.children
        ?.filter((child: any) => !child.roles || child.roles.includes(userRole))
        .map((child: IMenuChild) => {
          const count = counts[child.key] || 0;
          return {
            ...child,
            label: (
              <Link
                href={`/page/${item.key}/${child.key}`}
                onClick={() => handleMenuClick(child.key)}
              >
                <div className="flex justify-between items-center w-full pr-2">
                  <span>{child.label}</span>
                  {count > 0 && (
                    <Badge count={count} size="small" className="badge-pulse" />
                  )}
                </div>
              </Link>
            ),
          };
        }),
    };
  });

  return (
    <Menu items={mapMenu} mode="inline" defaultSelectedKeys={[pathname]} />
  );
};

export default Sidebar;
