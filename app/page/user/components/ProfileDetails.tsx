import React from "react";
import { Card, Button, Row, Col, message, Avatar } from "antd";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  EditOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

// แก้ไข: กำหนด Interface UserType ที่สมบูรณ์แบบ
interface UserType {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  position?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

// กำหนด Type สำหรับ Props
interface ProfileDetailsProps {
  data: UserType[];
  loading: boolean;
  fetchData: () => void;
  setData: (data: UserType[]) => void;
}

const PRIMARY_COLOR = "#00a191"; // สีหลักของแอปฯ (Teal/Cyan)

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  data,
  loading,
  fetchData,
}) => {
  const currentUser = data[0];

  const handleEdit = () => {
    message.info("ฟังก์ชันแก้ไขโปรไฟล์กำลังจะถูกเปิดใช้งาน");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>ไม่พบข้อมูลโปรไฟล์ผู้ใช้งาน</p>
        <Button type="primary" onClick={fetchData}>
          ลองโหลดใหม่
        </Button>
      </div>
    );
  }

  const fullName =
    currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`;

  // รายการข้อมูลที่จะแสดง
  const profileItems = [
    {
      icon: <IdcardOutlined />,
      label: "รหัสผู้ใช้",
      value: currentUser.id,
    },

    {
      icon: <PhoneOutlined />,
      label: "เบอร์โทร",
      value: currentUser.phoneNumber || "055769999",
    },
    // สามารถเพิ่มข้อมูลอื่น ๆ ที่มีได้ที่นี่ เช่น ตำแหน่ง
    {
      icon: <UserOutlined />,
      label: "ตำแหน่ง",
      value: currentUser.position || "เจ้าของปลาหมึกต่างดาว",
    },
  ];

  return (
    <div>
      <div
        style={{
          textAlign: "center",
          borderBottom: `1px solid ${PRIMARY_COLOR}`,
          paddingBottom: 15,
          marginBottom: 20,
          marginTop: -12,
          marginLeft: -24,
          marginRight: -24,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            color: PRIMARY_COLOR,
            fontSize: "20px",
          }}
        >
          รายละเอียดโปรไฟล์ส่วนตัว
        </span>
      </div>

      {/* Profile */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        {/* Avatar */}
        <Avatar
          size={120}
          src={currentUser.avatarUrl}
          icon={<UserOutlined />}
          style={{
            marginRight: 20,
          }}
        />

        {/* ชื่อและอีเมล */}
        <div style={{ textAlign: "left", flexGrow: 1 }}>
          <h2 style={{ margin: 0, color: PRIMARY_COLOR }}>{fullName}</h2>
          {currentUser.position && (
            <p
              style={{ color: "#888", margin: "4px 0 0 0", fontSize: "1.1em" }}
            >
              {currentUser.position}
            </p>
          )}

          <p style={{ color: "#888", margin: "4px 0 0 0", fontSize: "1em" }}>
            {currentUser.email}
          </p>
        </div>

        {/* ปุ่มแก้ไขโปรไฟล์ */}
        <Button
          type="primary"
          onClick={handleEdit}
          icon={<EditOutlined />}
          style={{
            backgroundColor: PRIMARY_COLOR,
            borderColor: PRIMARY_COLOR,
            marginLeft: "auto", 
          }}
        >
          แก้ไขโปรไฟล์
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ padding: "0 24px" }}>
        {profileItems.map((item, index) => (
          <Col span={24} key={index}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px dotted #e0e0e0",
              }}
            >
              {/* Icon */}
              {React.cloneElement(item.icon, {
                style: { color: PRIMARY_COLOR, marginRight: 15, fontSize: 18 },
              })}

              <p
                style={{
                  margin: 0,
                  display: "flex",
                  flexGrow: 1,
                  justifyContent: "space-between",
                }}
              >
                <strong style={{ color: "#666" }}>{item.label}:</strong>
                <span>{item.value}</span>
              </p>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProfileDetails;
