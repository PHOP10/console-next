"use client";
import Image from "next/image";
import {
  Button,
  Drawer,
  Dropdown,
  Menu,
  Space,
  ConfigProvider,
  Badge,
} from "antd"; // Import Badge เพิ่ม
import { Header } from "antd/es/layout/layout";
import MenuNav, { MenuSider, IMenu, IMenuChild } from "@/config/menu"; // Import MenuSider(data) แทน function
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useCallback } from "react";
import { UserProfileType } from "@/types";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth"; // เพิ่ม
import { indexService } from "../../services/index.service"; // เพิ่ม

import "./font.css";

interface Prop {
  collapsed: boolean;
  setCollapsed: (setCollapsed: boolean) => void;
  currentPath: string;
  user: UserProfileType;
}

const Navigation: React.FC<Prop> = ({
  collapsed,
  setCollapsed,
  currentPath,
  user,
}) => {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });

  // --- เพิ่ม Logic Notification ---
  const userId = session?.user?.userId || (session?.user as any)?.id;
  const intraAuth = useAxiosAuth();
  const intraAuthService = indexService(intraAuth);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const userRole = session?.user?.role ?? "user";

  const fetchNotificationCounts = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await intraAuthService.getNotificationCounts(userId);
      setCounts(res.menuCounts || {});
    } catch (error) {
      console.error(error);
    }
  }, [userId, intraAuthService]);

  const handleMenuClick = async (key: string) => {
    setOpen(false); // ปิด Drawer
    setCounts((prev) => ({ ...prev, [key]: 0 }));
    if (userId) await intraAuthService.markMenuRead(userId, key);
  };

  useEffect(() => {
    if (open) fetchNotificationCounts(); // ดึงข้อมูลเมื่อเปิด Drawer
  }, [open, fetchNotificationCounts]);
  // ------------------------------

  // --- Logic Map Menu (เหมือน Sidebar) ---
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
              {count > 0 && <Badge count={count} size="small" />}
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
                <div className="flex justify-between items-center w-full pr-4">
                  <span>{child.label}</span>
                  {count > 0 && <Badge count={count} size="small" />}
                </div>
              </Link>
            ),
          };
        }),
    };
  });
  // -------------------------------------

  return (
    <>
      <Header
        className="flex justify-between w-full shadow p-0"
        style={{
          background: "linear-gradient(90deg, #20b2aa 0%, #4facfe 100%)",
        }}
      >
        {/* ... (Code ส่วน Header เหมือนเดิม ไม่ต้องแก้) ... */}
        <div className="hidden md:flex items-center">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 46, height: 46, color: "white" }}
          />
          {/* ... Logo ... */}
          <span className="text-white text-base font-semibold ml-2">
            โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านผาผึ้ง
          </span>
        </div>

        <div className="block md:hidden">
          <Button
            type="text"
            icon={open ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setOpen(!open)}
            style={{ fontSize: "16px", width: 64, height: 64, color: "white" }}
          />
        </div>

        {user && (
          <div className="pr-8">
            <Dropdown
              menu={{ items: MenuNav }}
              className="text-white hover:text-zinc-300"
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <UserOutlined />
                  {user.fullName}
                </Space>
              </a>
            </Dropdown>
          </div>
        )}
      </Header>

      <Drawer
        title={
          <div className="flex justify-center items-center">
            <Image
              width={100}
              height={0}
              src="/rpst.png"
              alt="logo"
              className="h-auto"
            />
          </div>
        }
        placement="left"
        onClose={() => setOpen(!open)}
        open={open}
        width={250}
        closeIcon={<CloseOutlined style={{ color: "white" }} />}
        styles={{
          header: {
            background: "#005167cd",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            color: "white",
          },
          body: {
            padding: "0px",
            background: "linear-gradient(180deg, #005167cd 0%, #083344 100%)",
          },
        }}
      >
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
          <Menu
            mode="inline"
            defaultSelectedKeys={[currentPath]}
            style={{ borderRight: 0, background: "transparent" }}
            items={mapMenu}
            className="h-screen"
          />
        </ConfigProvider>
      </Drawer>
    </>
  );
};

export default Navigation;
