"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import { Layout, Menu, ConfigProvider, Spin } from "antd";
import { menuSider } from "@/config/menu";
import { signIn, useSession } from "next-auth/react";
import { UserProfileType } from "@/types";
import config from "@/config";
import { useRefreshToken } from "../lib/axios/hooks/useRefreshToken";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });

  const refreshToken = useRefreshToken();

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
  const menus = menuSider();
  const pathParts = pathname.split("/");
  const selectedKey = pathParts[3] || pathParts[2];
  const openKey = pathParts[2];

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
                  itemSelectedBg: "#06b6d4", // สี Cyan ตามธีม
                },
              },
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              defaultOpenKeys={[openKey]}
              style={{
                borderRight: 0,
                background: "transparent",
                padding: "0 8px",
              }}
              items={menus}
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
