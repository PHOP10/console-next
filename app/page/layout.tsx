"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import { Layout, Menu, ConfigProvider, Spin, Badge } from "antd"; // 1. เพิ่ม Badge
// 2. เปลี่ยนจาก menuSider เป็น MenuSider (ตัวแปร Data) และ Interface
import { MenuSider, IMenu, IMenuChild } from "@/config/menu";
import { signIn, useSession } from "next-auth/react";
import { UserProfileType } from "@/types";
import config from "@/config";
import { useRefreshToken } from "../lib/axios/hooks/useRefreshToken";
import Link from "next/link"; // 3. เพิ่ม Link

// 4. Import Hooks สำหรับแจ้งเตือน
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { indexService } from "@/services/index.service";
import { useNotificationSocket } from "@/app/lib/axios/hooks/useNotificationSocket";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession({
    // เพิ่ม status
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });

  const refreshToken = useRefreshToken();

  // ---------------------------------------------------------------------------
  // ส่วนที่เพิ่ม: Logic แจ้งเตือน (Notification Logic)
  // ---------------------------------------------------------------------------
  const rawUserId = session?.user?.userId || (session?.user as any)?.id;
  const userId = rawUserId ? String(rawUserId) : undefined;

  const intraAuth = useAxiosAuth();
  // ใช้ useMemo กัน service ถูกสร้างใหม่รัวๆ
  const intraAuthService = useMemo(() => indexService(intraAuth), [intraAuth]);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});

  const fetchNotificationCounts = useCallback(async () => {
    if (status === "loading" || !userId) return;
    try {
      const res = await intraAuthService.getNotificationCounts(userId);
      setCounts(res.menuCounts || {});
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [userId, intraAuthService, status]);

  // เชื่อมต่อ Socket
  useNotificationSocket(userId, setCounts);

  // กดแล้วเคลียร์เลข
  const handleMenuClick = async (key: string) => {
    setCounts((prev) => ({ ...prev, [key]: 0 }));
    if (userId) {
      await intraAuthService.markMenuRead(userId, key).catch(console.error);
    }
  };

  useEffect(() => {
    fetchNotificationCounts();
    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchNotificationCounts]);
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (session) {
      const renewTokenTask = setInterval(async () => {
        await refreshToken();
      }, config.refreshTokenIntervalInSeconds);
      return () => {
        clearTimeout(renewTokenTask);
      };
    }
  }, [session, refreshToken]);

  const [collapsed, setCollapsed] = useState(false);
  const { Content, Sider } = Layout;
  const pathname = usePathname();
  const currentPath = pathname.split("/")[2];

  // ---------------------------------------------------------------------------
  // ส่วนที่แก้: Map เมนูใหม่เพื่อใส่ Badge (แทนที่ const menus = menuSider())
  // ---------------------------------------------------------------------------
  const userRole = session?.user?.role ?? "user";
  const pathParts = pathname.split("/");
  const selectedKey = pathParts[3] || pathParts[2];
  const openKey = pathParts[2];

  const filterByRole = (menu: IMenu) =>
    !menu.roles || menu.roles.includes(userRole);

  const mapMenu = MenuSider.filter(filterByRole).map((item: IMenu) => {
    // กรณีเมนูหลัก (ไม่มีลูก)
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

    // กรณีมีเมนูย่อย -> เช็คว่าลูกมีเลขไหม ถ้ามีให้แม่ขึ้น Dot
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
        ?.filter((child) => !child.roles || child.roles.includes(userRole))
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
  // ---------------------------------------------------------------------------

  if (!session) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: `
                radial-gradient(at 40% 20%, hsla(152, 100%, 90%, 1) 0px, transparent 50%),
                radial-gradient(at 80% 0%, hsla(189, 100%, 90%, 1) 0px, transparent 50%),
                radial-gradient(at 0% 50%, hsla(120, 100%, 93%, 1) 0px, transparent 50%),
                radial-gradient(at 80% 50%, hsla(210, 100%, 92%, 1) 0px, transparent 50%),
                radial-gradient(at 0% 100%, hsla(170, 100%, 88%, 1) 0px, transparent 50%),
                radial-gradient(at 80% 100%, hsla(200, 100%, 92%, 1) 0px, transparent 50%),
                radial-gradient(at 0% 0%, hsla(190, 100%, 95%, 1) 0px, transparent 50%)
            `,
          backgroundSize: "100% 100%",
        }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <Layout
      className="min-h-screen h-full"
      style={{ background: "transparent" }}
    >
      <Sider
        width={220}
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="hidden md:block"
        theme="dark"
        style={{
          background: "linear-gradient(180deg, #005167cd 0%, #083344 100%)",
          boxShadow: "4px 0 15px rgba(0,0,0,0.1)",
          borderRight: "none",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <div className="flex flex-col h-full py-6">
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  colorBgContainer: "transparent",
                  itemColor: "rgba(255, 255, 255, 0.75)",
                  itemHoverColor: "#ffffff",
                  itemHoverBg: "rgba(255, 255, 255, 0.15)",
                  itemSelectedColor: "#ffffff",
                  itemSelectedBg: "#06b6d4",
                },
              },
            }}
          >
            {/* ✅ ใช้ mapMenu (ที่มี Badge) แทน menus เดิม */}
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              defaultOpenKeys={[openKey]}
              style={{
                borderRight: 0,
                background: "transparent",
                padding: "0 8px",
              }}
              items={mapMenu}
            />
          </ConfigProvider>
        </div>
      </Sider>

      <Layout style={{ background: "transparent" }}>
        <div className="w-full sticky top-0 z-50">
          <Navigation
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            currentPath={currentPath}
            user={session.user as UserProfileType}
          />
        </div>

        <Content
          style={{
            padding: "24px",
            margin: 0,
            minHeight: 280,
            overflow: "initial",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
