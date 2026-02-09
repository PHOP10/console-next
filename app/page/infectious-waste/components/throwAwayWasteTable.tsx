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
  fetchData: () => Promise<void>;
}

export default function ThrowAwayWasteTable({
  data,
  loading,
  setLoading,
  fetchData,
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
      fetchData();
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
      title: "ประเภท", // ย่อชื่อให้สั้นลง
      dataIndex: "wasteType",
      key: "wasteType",
      align: "center",
      width: 120,
    },
    {
      title: "นํ้าหนัก (กก.)", // ย่อชื่อให้สั้นลง
      dataIndex: "wasteWeight",
      key: "wasteWeight",
      align: "center",
      width: 90,
    },
    {
      title: "วันที่",
      dataIndex: "discardedDate",
      key: "discardedDate",
      width: 150,
      align: "center",
      render: (date: string) => {
        if (!date) return "-";

        const mobileDate = dayjs(date).format("D/M/BB");
        const desktopDate = dayjs(date).format("D MMMM BBBB");

        return (
          <>
            <span className="md:hidden font-normal">{mobileDate}</span>

            <span className="hidden md:block font-normal">{desktopDate}</span>
          </>
        );
      },
    },
    {
      title: "ผู้ส่ง",
      dataIndex: "createdName",
      key: "createdName",
      align: "center",
      responsive: ["md"], // ซ่อนคอลัมน์นี้บนมือถือ
      width: 120,
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 100,
      // เอา fixed ออกแล้วตามที่ขอ
      render: (_, record) => (
        <Space size="small">
          {session?.user.role === "admin" && (
            <>
              <Tooltip title="แก้ไข">
                <EditOutlined
                  onClick={() => handleEdit(record)}
                  style={{
                    fontSize: 18, // ลดขนาดไอคอนลงเล็กน้อยให้สมดุลกับตาราง size small
                    color: "#faad14",
                    cursor: "pointer",
                  }}
                />
              </Tooltip>

              <Popconfirm
                title="ลบข้อมูล?"
                onConfirm={async () => {
                  try {
                    await intraAuthService.deleteInfectiousWaste(record.id);
                    message.success("ลบสำเร็จ");
                    setLoading(true);
                    fetchData();
                  } catch (error) {
                    message.error("ลบไม่สำเร็จ");
                  }
                }}
                okText="ใช่"
                cancelText="ยกเลิก"
              >
                <Tooltip title="ลบ">
                  <DeleteOutlined
                    style={{
                      fontSize: 18,
                      color: "#ff4d4f",
                      cursor: "pointer",
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
    <div className="w-full p-2 sm:p-4">
      <Card
        title={
          <div
            className="text-center font-bold text-[#0683e9]"
            style={{ fontSize: "clamp(18px, 4vw, 24px)" }}
          >
            ข้อมูลขยะติดเชื้อ
          </div>
        }
        // ลด padding body ของ Card บนมือถือ
        styles={{ body: { padding: "8px" } }}
      >
        <CustomTable
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small" // *** สำคัญ: ทำให้ตาราง compact ขึ้น (แถวเตี้ยลง) ***
          pagination={{
            pageSize: 10,
            size: "small", // Pagination ขนาดเล็ก
          }}
          bordered
          scroll={{ x: "max-content" }} // ให้ scroll แนวนอนได้ถ้าเนื้อหาล้น แต่ไม่ตรึงคอลัมน์
        />

        {/* Modal แก้ไข */}
        <Modal
          title={
            <div className="text-xl font-bold text-[#0683e9] text-center w-full">
              แก้ไขข้อมูล
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          centered
          footer={null}
          width={500}
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
                    rules={[{ required: true, message: "โปรดระบุ" }]}
                  >
                    <Input placeholder="ระบุประเภทขยะ" className={inputStyle} />
                  </Form.Item>

                  <Form.Item
                    label="น้ำหนัก (กก.)"
                    name="wasteWeight"
                    rules={[
                      { required: true, message: "โปรดระบุ" },
                      {
                        pattern: /^\d+(\.\d{1,2})?$/,
                        message: "ใส่ตัวเลขเท่านั้น",
                      },
                    ]}
                  >
                    <Input placeholder="เช่น 1.25" className={inputStyle} />
                  </Form.Item>

                  <Form.Item
                    name="discardedDate"
                    label="วันที่"
                    rules={[{ required: true, message: "โปรดเลือกวันที่" }]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="YYYY-MM-DD"
                      placeholder="เลือกวันที่"
                      className={`${inputStyle} pt-2`}
                    />
                  </Form.Item>

                  {/* Buttons Section (ปรับเป็นแนวนอนดูสะอาดตากว่า) */}
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
    </div>
  );
}
