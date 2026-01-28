"use client";
import Image from "next/image";
// ✅ 1. เพิ่ม ConfigProvider
import { Button, Drawer, Dropdown, Menu, Space, ConfigProvider } from "antd";
import { Header } from "antd/es/layout/layout";
import MenuNav, { menuSider } from "@/config/menu";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  CloseOutlined, // ✅ 2. เพิ่มไอคอนกากบาท (ไว้เปลี่ยนสีปุ่มปิด)
} from "@ant-design/icons";
import { useState } from "react";
import { UserProfileType } from "@/types";
import { signIn, useSession } from "next-auth/react";

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

  return (
    <>
      <Header
        className="flex justify-between w-full shadow p-0"
        style={{
          // สี Header เดิมของคุณ
          background: "linear-gradient(90deg, #20b2aa 0%, #4facfe 100%)",
        }}
      >
        <div className="hidden md:flex items-center">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 46,
              height: 46,
              color: "white",
            }}
          />
          <Image
            src="/rpst.png"
            alt="RPST Logo"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "40px", height: "auto", marginRight: "4px" }}
          />
          <span className="text-white text-base font-semibold ml-2">
            โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านผาผึ้ง
          </span>
        </div>

        <div className="block md:hidden">
          <Button
            type="text"
            icon={open ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setOpen(!open)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              color: "white",
            }}
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

      {/* ==========================================================
          ✅ แก้ไขส่วน Drawer (เมนูมือถือ) ให้เป็นสีเข้ม
         ========================================================== */}
      <Drawer
        title={
          <div className="flex justify-center items-center">
            <Image
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100px", height: "auto" }}
              src="/sangthong.png"
              className={`h-auto`}
              alt={""}
            />
          </div>
        }
        placement="left"
        onClose={() => setOpen(!open)}
        open={open}
        width={250}
        // ✅ เปลี่ยนสีกากบาทเป็นสีขาว
        closeIcon={<CloseOutlined style={{ color: "white" }} />}
        // ✅ ใส่สไตล์สีพื้นหลัง (Gradient) ให้เหมือนหน้าเว็บหลัก
        styles={{
          header: {
            background: "#005167cd", // สีเดียวกับส่วนบนของ Gradient
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            color: "white", // สีตัวหนังสือ Title (ถ้ามี)
          },
          body: {
            padding: "0px",
            // Gradient สีเขียว-น้ำเงินเข้ม
            background: "linear-gradient(180deg, #005167cd 0%, #083344 100%)",
          },
        }}
      >
        {/* ✅ ครอบด้วย ConfigProvider เพื่อปรับสีตัวหนังสือเมนู */}
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                colorBgContainer: "transparent",

                // ตัวหนังสือสีขาวจางๆ
                itemColor: "rgba(255, 255, 255, 0.75)",

                // ตอนชี้เมาส์
                itemHoverColor: "#ffffff",
                itemHoverBg: "rgba(255, 255, 255, 0.15)",

                // ตอนเลือกเมนู (Active)
                itemSelectedColor: "#ffffff",
                itemSelectedBg: "#06b6d4", // สี Cyan สว่าง
              },
            },
          }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={[currentPath]}
            style={{ borderRight: 0, background: "transparent" }}
            items={menuSider()}
            onClick={() => setOpen(!open)}
            className="h-screen"
          />
        </ConfigProvider>
      </Drawer>
    </>
  );
};

export default Navigation;
