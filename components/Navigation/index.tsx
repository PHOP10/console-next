"use client";
import Image from "next/image";
import { Button, Drawer, Dropdown, Menu, Space } from "antd";
import { Header } from "antd/es/layout/layout";
import MenuNav, { menuSider } from "@/config/menu";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { UserProfileType } from "@/types";
import { signIn, useSession } from "next-auth/react";

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
        className="flex justify-between w-full shadow p-0   "
        // style={{ backgroundColor: "#00a191" }}
      >
        <div className="hidden md:block">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              color: "white",
            }}
          />
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
              className="text-white hover:text-zinc-300">
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
        styles={{ body: { padding: "0px" } }}
        title={
          <div className="flex justify-center bg-white ">
            <Image
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100px", height: "auto" }}
              src="/sangthong.png"
              className={` h-auto`}
              alt={""}
            />
          </div>
        }
        placement="left"
        onClose={() => setOpen(!open)}
        open={open}
        width={250}>
        <Menu
          mode="inline"
          defaultSelectedKeys={[currentPath]}
          style={{ borderRight: 0 }}
          items={menuSider(session?.user)}
          onClick={() => setOpen(!open)}
          className=" h-screen"
        />
      </Drawer>
    </>
  );
};

export default Navigation;
