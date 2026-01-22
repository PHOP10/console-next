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
  const [allUserData, setAllUserData] = useState<UserType[]>([]);

  const fetchUserData = async () => {
    if (!session?.user?.userId) return;
    setLoading(true);
    try {
      const allUsers = await intraAuthService.getUserQuery();
      setAllUserData(allUsers);
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
        return "แก้ไขข้อมูลส่วนตัว";
      case "password":
        return "เปลี่ยนรหัสผ่าน";
      default:
        return "ข้อมูลส่วนตัว";
    }
  };

  if (loading && !userData) {
    return (
      <Card style={{ marginTop: 20 }}>
        <Skeleton avatar active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[24, 24]} justify="center">
        {/* Left Side: Profile Picture */}
        <Col xs={24} md={8} lg={6}>
          <Card
            bordered={false}
            style={{
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              />
            </div>
            <h2 style={{ margin: 0 }}>
              {userData?.firstName} {userData?.lastName}
            </h2>
            <p style={{ color: "gray" }}>
              {userData?.position || "ไม่ระบุตำแหน่ง"}
            </p>
          </Card>
        </Col>

        {/* Right Side: Content */}
        <Col xs={24} md={16} lg={18}>
          <Card
            title={getCardTitle()}
            bordered={false}
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            extra={
              editMode === "view" && (
                <Space>
                  <Button
                    // icon={<KeyOutlined />}
                    onClick={() => setEditMode("password")}
                  >
                    เปลี่ยนรหัสผ่าน
                  </Button>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setEditMode("profile")}
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
                userId={userData.userId} // ตรวจสอบ type ให้ตรงกับ interface
                onCancel={() => setEditMode("view")}
                onSuccess={() => setEditMode("view")}
                // allUserData={allUserData}
              />
            )}

            {editMode === "view" && (
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}
                labelStyle={{ fontWeight: "bold", width: "150px" }}
              >
                <Descriptions.Item label="ชื่อ-นามสกุล">
                  {userData?.firstName} {userData?.lastName}
                </Descriptions.Item>
                {/* <Descriptions.Item label="ชื่อเล่น">
                  {userData?.nickName || "-"}
                </Descriptions.Item> */}
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
