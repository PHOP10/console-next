"use client";

import React, { useState } from "react";
import { Button, message, Popconfirm, Space, Tag, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import { UserType } from "../../common";
import { userService } from "../services/user.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import UserForm from "./userForm";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";
import CustomTable from "../../common/CustomTable";
import UserEditModal from "./userEditModal";
import { useSession } from "next-auth/react";

dayjs.locale("th");

interface UserTableProps {
  data: UserType[];
  loading: boolean;
  fetchData: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<UserType[]>>;
}

const UserTable: React.FC<UserTableProps> = ({ data, loading, fetchData }) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const { data: session } = useSession();

  // --- Handlers ---
  const handleEdit = (record: UserType) => {
    setEditingUser(record);
    setIsModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchData(); // Refresh Data
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteUser(id);
      message.success("ลบผู้ใช้สำเร็จ");
      fetchData();
    } catch (err) {
      message.error("ไม่สามารถลบผู้ใช้ได้");
    }
  };

  // --- Columns ---
  const columns: ColumnsType<UserType> = [
    {
      title: "รหัสพนักงาน",
      dataIndex: "employeeId",
      key: "employeeId",
      align: "center",
    },
    {
      title: "ชื่อ",
      dataIndex: "firstName",
      key: "firstName",
      align: "center",
    },
    {
      title: "นามสกุล",
      dataIndex: "lastName",
      key: "lastName",
      align: "center",
    },
    {
      title: "ชื่อผู้ใช้",
      dataIndex: "username",
      key: "username",
      align: "center",
    },
    { title: "อีเมล", dataIndex: "email", key: "email", align: "center" },
    {
      title: "เบอร์โทร",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
    },
    {
      title: "ตำแหน่ง",
      dataIndex: "position",
      key: "position",
      align: "center",
    },
    {
      title: "ความรับผิดชอบ",
      dataIndex: "role",
      key: "role",
      align: "center",
      render: (role: string) => {
        const roleConfig: Record<string, { label: string; color: string }> = {
          admin: { label: "หัวหน้า", color: "volcano" },
          user: { label: "ผู้ใช้", color: "cyan" },
          pharmacy: { label: "ผู้ดูแลคลังยา", color: "green" },
          asset: { label: "ผู้ดูแลครุภัณฑ์", color: "purple" },
          home: { label: "ผู้ดูแลเยี่ยมบ้าน", color: "blue" },
        };
        const config = roleConfig[role] || { label: role, color: "default" };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      render: (_, record) => {
        // ✅ สร้างตัวแปรเช็คว่าเป็น Account ของตัวเองหรือไม่
        // (สมมติว่าใน session มี userId และใน record ก็มี userId)
        const isOwnAccount = session?.user?.userId === record.userId;

        return (
          <Space>
            <Tooltip title="แก้ไข">
              <EditOutlined
                style={{
                  fontSize: 22,
                  color: "#faad14",
                  cursor: "pointer",
                }}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>

            {/* ✅ เพิ่มเงื่อนไข: ถ้าไม่ใช่ Account ตัวเอง ถึงจะแสดงปุ่มลบ */}
            {!isOwnAccount && (
              <Tooltip title="ลบข้อมูล">
                <Popconfirm
                  title="ยืนยันการลบ"
                  description="คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?"
                  okText="ใช่"
                  cancelText="ไม่"
                  onConfirm={() => handleDelete(record.id)}
                  okButtonProps={{ danger: true }}
                >
                  <DeleteOutlined
                    style={{
                      fontSize: 22,
                      color: "#ff4d4f",
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#cf1322")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#ff4d4f")
                    }
                  />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="custom-table-container p-6">
      <div className="text-[24px] text-center text-xl font-bold text-[#0683e9] mb-4">
        จัดการข้อมูลผู้ใช้
        <hr className="border-slate-100/30 -mx-4 md:-mx-6 mt-4" />
      </div>
      <UserForm fetchData={fetchData} />
      <CustomTable
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        scroll={{ x: "max-content" }}
        bordered
      />

      <UserEditModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleEditSuccess}
        record={editingUser}
      />
    </div>
  );
};

export default UserTable;
