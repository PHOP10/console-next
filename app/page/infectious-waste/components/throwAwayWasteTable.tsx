"use client";

import {
  Card,
  Table,
  Button,
  Popconfirm,
  message,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Tooltip,
  ConfigProvider,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { InfectiousWasteType } from "../../common/index";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/infectiouswaste.service";
import { useState } from "react";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";

interface ThrowAwayWasteTableProps {
  data: InfectiousWasteType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ThrowAwayWasteTable({
  data,
  loading,
  setLoading,
}: ThrowAwayWasteTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<InfectiousWasteType | null>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: InfectiousWasteType) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      discardedDate: dayjs(record.discardedDate),
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...editingRecord,
        ...values,
        discardedDate: values.discardedDate.toISOString(),
        wasteWeight: parseFloat(values.wasteWeight),
      };

      await intraAuthService.updateInfectiousWaste(payload);
      message.success("แก้ไขข้อมูลสำเร็จ");
      setIsModalOpen(false);
      setEditingRecord(null);
      setLoading(true);
    } catch (error) {
      console.error("Error updating record:", error);
      message.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  const columns: ColumnsType<InfectiousWasteType> = [
    {
      title: "ประเภทขยะ",
      dataIndex: "wasteType",
      key: "wasteType",
      align: "center",
    },
    {
      title: "น้ำหนัก (กิโลกรัม)",
      dataIndex: "wasteWeight",
      key: "wasteWeight",
      align: "center",
    },
    {
      title: "วันที่ส่งกำจัด",
      dataIndex: "discardedDate",
      key: "discardedDate",
      render: (date: string) => {
        if (!date) return "-";
        return dayjs(date).format("D MMMM BBBB");
      },
      align: "center",
    },
    {
      title: "ผู้ส่งกำจัด",
      dataIndex: "createdName",
      key: "createdName",
      align: "center",
    },
    {
      title: "การจัดการ",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          {session?.user.role === "admin" && (
            <>
              {/* ปุ่มแก้ไข (ดินสอสีส้ม) */}
              <Tooltip title="แก้ไข">
                <EditOutlined
                  onClick={() => handleEdit(record)}
                  style={{
                    fontSize: 22,
                    color: "#faad14", // สีส้ม (ตรงกับสีเดิมที่คุณใช้)
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                />
              </Tooltip>

              <Popconfirm
                title="ยืนยันการลบ"
                description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
                onConfirm={async () => {
                  try {
                    await intraAuthService.deleteInfectiousWaste(record.id);
                    message.success("ลบข้อมูลสำเร็จ");
                    setLoading(true);
                  } catch (error) {
                    console.error("Error deleting waste:", error);
                    message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
                  }
                }}
                okText="ใช่"
                cancelText="ยกเลิก"
              >
                <Tooltip title="ลบ">
                  <DeleteOutlined
                    style={{
                      fontSize: 22,
                      color: "#ff4d4f", // สีแดง Danger
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <div
          style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#0683e9",
          }}
        >
          ข้อมูลขยะติดเชื้อ
        </div>
      }
    >
      <CustomTable
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />

      {/* Modal สำหรับแก้ไข */}
      <Modal
        title={
          <div className="text-xl font-bold text-[#0683e9] text-center w-full">
            แก้ไขข้อมูลขยะติดเชื้อ
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        centered
        footer={null}
        width={600}
        styles={{
          content: { borderRadius: "20px", padding: "24px" },
          header: {
            marginBottom: "16px",
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: "12px",
          },
        }}
      >
        <Form form={form} layout="vertical">
          {/* Style Constants */}
          {(() => {
            const inputStyle =
              "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

            return (
              <>
                <Form.Item
                  name="wasteType"
                  label="ประเภทขยะ"
                  rules={[{ required: true, message: "กรุณากรอกประเภทขยะ" }]}
                >
                  <Input placeholder="ระบุประเภทขยะ" className={inputStyle} />
                </Form.Item>

                <Form.Item
                  label="น้ำหนักขยะติดเชื้อ (กิโลกรัม)"
                  name="wasteWeight"
                  rules={[
                    { required: true, message: "กรุณาระบุน้ำหนักขยะ" },
                    {
                      pattern: /^\d+(\.\d{1,2})?$/,
                      message: "กรุณากรอกตัวเลข เช่น 1.25",
                    },
                  ]}
                >
                  <Input placeholder="เช่น 1.25" className={inputStyle} />
                </Form.Item>

                <Form.Item
                  name="discardedDate"
                  label="วันที่ส่งกำจัด"
                  rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    placeholder="เลือกวันที่"
                    className={`${inputStyle} pt-2`}
                  />
                </Form.Item>

                {/* Buttons Section */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleUpdate}
                    className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0"
                  >
                    บันทึก
                  </Button>
                </div>
              </>
            );
          })()}
        </Form>
      </Modal>
    </Card>
  );
}
