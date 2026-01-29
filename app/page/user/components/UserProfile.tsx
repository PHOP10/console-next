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
} from "antd";
import { UserOutlined, EditOutlined, KeyOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../services/user.service";
import { UserType } from "../../common";

// Import Components ที่แยกออกมา
import EditProfileForm from "./editProfileForm";
import ChangePasswordForm from "./changePasswordForm";

export default function UserProfile() {
  const { data: session } = useSession();
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState<"view" | "profile" | "password">(
    "view",
  );
  const [userData, setUserData] = useState<UserType | null>(null);

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
        return <span className="text-[#0683e9]">ข้อมูลส่วนตัว</span>;
    }
  };

  if (loading && !userData) {
    return (
      <Card style={{ marginTop: 20, borderRadius: "16px" }}>
        <Skeleton avatar active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  // --- Style สำหรับ Label (หัวข้อ) ให้เป็นสีฟ้าอ่อน ---
  const descriptionLabelStyle: React.CSSProperties = {
    backgroundColor: "#f0f5ff", // สีฟ้าอ่อน
    fontWeight: "600",
    color: "#1d39c4", // สีตัวหนังสือโทนน้ำเงินเข้ม
    width: "180px", // กำหนดความกว้างให้เท่ากันสวยงาม
    verticalAlign: "middle",
  };

  const descriptionContentStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    color: "#333",
    verticalAlign: "middle",
  };

  return (
    <div style={{ padding: "20px" }}>
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
                  backgroundColor: "#0683e9", // สีฟ้าหลักของแอป
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
            extra={
              editMode === "view" && (
                <Space>
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
                userData={userData} // ถ้า error ตรงนี้ให้แก้ UserEditModalProps ให้รับ record หรือ userData ให้ตรงกัน
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
                column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}
                size="middle"
                // --- ใส่ Style ตรงนี้ ---
                labelStyle={descriptionLabelStyle}
                contentStyle={descriptionContentStyle}
              >
                <Descriptions.Item label="ชื่อ-นามสกุล">
                  {userData?.firstName} {userData?.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="เพศ">
                  {userData?.gender === "male"
                    ? "ชาย"
                    : userData?.gender === "female"
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
                    ? dayjs(userData.startDate).format("DD/MM/YYYY")
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
