"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Button,
  Descriptions,
  Avatar,
  Space,
  message,
  Skeleton,
  Tag,
  Grid,
} from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../services/user.service";
import { UserType } from "../../common";

// Import Components
import EditProfileForm from "./editProfileForm";
import ChangePasswordForm from "./changePasswordForm";

const { useBreakpoint } = Grid;

export default function UserProfile() {
  const { data: session } = useSession();
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState<"view" | "profile" | "password">(
    "view",
  );
  const [userData, setUserData] = useState<UserType | null>(null);

  const screens = useBreakpoint();

  const fetchUserData = async () => {
    if (!session?.user?.userId) return;
    setLoading(true);
    try {
      const allUsers = await intraAuthService.getUserQuery();
      const myUser = allUsers.find(
        (u: any) => u.userId === session.user.userId,
      );
      if (myUser) setUserData(myUser);
      else message.warning("ไม่พบข้อมูลผู้ใช้");
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [session]);

  const getCardTitle = () => {
    switch (editMode) {
      case "profile":
        return <span className="text-[#0683e9]">แก้ไขข้อมูลส่วนตัว</span>;
      case "password":
        return <span className="text-[#0683e9]">เปลี่ยนรหัสผ่าน</span>;
      default:
        return <span className="text-[#0683e9]">ข้อมูลผู้ใช้งาน</span>;
    }
  };

  if (loading && !userData) {
    return (
      <Card style={{ marginTop: 20, borderRadius: "16px" }}>
        <Skeleton avatar active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  const descriptionLabelStyle: React.CSSProperties = {
    backgroundColor: "#f0f5ff",
    fontWeight: "600",
    color: "#1d39c4",
    width: screens.md ? "180px" : "auto",
    verticalAlign: "middle",
  };

  const descriptionContentStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    color: "#333",
    verticalAlign: "middle",
  };

  return (
    <div style={{ padding: screens.md ? "20px" : "10px" }}>
      <Row gutter={[24, 24]} justify="center">
        {/* Left Side: Profile Picture */}
        <Col xs={24} md={8} lg={6}>
          <Card
            bordered={false}
            style={{
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              borderRadius: "16px",
              height: "100%",
            }}
          >
            <div style={{ marginBottom: 24, marginTop: 12 }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "#0683e9",
                  fontSize: "48px",
                  boxShadow: "0 4px 10px rgba(6, 131, 233, 0.3)",
                }}
              />
            </div>
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              {userData?.firstName} {userData?.lastName}
            </h2>
            <div style={{ marginBottom: 16 }}>
              <Tag
                color="blue"
                style={{
                  fontSize: "14px",
                  padding: "4px 12px",
                  borderRadius: "12px",
                }}
              >
                {userData?.position || "ไม่ระบุตำแหน่ง"}
              </Tag>
            </div>

            {/* [Optional] อาจจะเพิ่ม Username ตัวเล็กๆ ตรงนี้ด้วยก็ได้ */}
            <div style={{ color: "#888", fontSize: "14px" }}>
              {userData?.username}
            </div>
          </Card>
        </Col>

        {/* Right Side: Content */}
        <Col xs={24} md={16} lg={18}>
          <Card
            title={getCardTitle()}
            bordered={false}
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              borderRadius: "16px",
              minHeight: "100%",
            }}
            styles={{
              header: { padding: screens.md ? "16px 24px" : "12px 16px" },
            }}
            extra={
              editMode === "view" && (
                <Space wrap>
                  <Button
                    onClick={() => setEditMode("password")}
                    style={{ borderRadius: "8px" }}
                  >
                    เปลี่ยนรหัสผ่าน
                  </Button>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setEditMode("profile")}
                    style={{
                      borderRadius: "8px",
                      backgroundColor: "#0683e9",
                    }}
                  >
                    แก้ไขข้อมูล
                  </Button>
                </Space>
              )
            }
          >
            {editMode === "profile" && userData && (
              <EditProfileForm
                userData={userData}
                onCancel={() => setEditMode("view")}
                onSuccess={() => {
                  setEditMode("view");
                  fetchUserData();
                }}
              />
            )}

            {editMode === "password" && userData && (
              <ChangePasswordForm
                userId={userData.userId}
                onCancel={() => setEditMode("view")}
                onSuccess={() => setEditMode("view")}
              />
            )}

            {editMode === "view" && (
              <Descriptions
                bordered
                layout={screens.md ? "horizontal" : "vertical"}
                column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}
                size={screens.md ? "middle" : "small"}
                labelStyle={descriptionLabelStyle}
                contentStyle={descriptionContentStyle}
              >
                <Descriptions.Item label="ชื่อผู้ใช้">
                  <span className="font-semibold text-gray-700">
                    {userData?.username}
                  </span>
                </Descriptions.Item>

                <Descriptions.Item label="ชื่อ-นามสกุล">
                  {userData?.firstName} {userData?.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="คำนำหน้า">
                  {userData?.gender === "male"
                    ? "ชาย"
                    : userData?.gender === "female"
                      ? "หญิง"
                      : userData?.gender === "miss"
                        ? "หญิง"
                        : userData?.gender || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="อีเมล">
                  {userData?.email}
                </Descriptions.Item>
                <Descriptions.Item label="เบอร์โทรศัพท์">
                  {userData?.phoneNumber || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="รหัสพนักงาน">
                  {userData?.employeeId || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="ตำแหน่ง">
                  {userData?.position || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่เริ่มงาน">
                  {userData?.startDate
                    ? dayjs(userData.startDate).format("DD MMMM BBBB")
                    : "-"}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
