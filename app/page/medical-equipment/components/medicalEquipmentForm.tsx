"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Button,
  Form,
  InputNumber,
  DatePicker,
  message,
  Card,
  Row,
  Col,
  Input,
  Table,
  Tag,
  Typography,
  Modal,
  Space,
  ConfigProvider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import { MaMedicalEquipmentType, MedicalEquipmentType } from "../../common";
import { useSession } from "next-auth/react";
import { buddhistLocale } from "@/app/common";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";

dayjs.extend(buddhistEra);
dayjs.locale("th");

const { TextArea } = Input;
const { Text } = Typography;

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  dataEQ: MedicalEquipmentType[];
  data: MaMedicalEquipmentType[];
  fetchData: () => Promise<void>;
};

export default function CreateMedicalEquipmentForm({
  setLoading,
  dataEQ,
  data,
  fetchData,
}: Props) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();
  const maService = maMedicalEquipmentServices(intraAuth);

  // State สำหรับ Modal และการเลือก
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTools, setSelectedTools] = useState<any[]>([]); // รายการที่เลือกมาลงตารางหลัก
  const [tempSelectedKeys, setTempSelectedKeys] = useState<React.Key[]>([]); // state ชั่วคราวใน Modal
  const [searchText, setSearchText] = useState("");

  // ---------------------------------------------------------------------------
  // 1. Logic แก้ไขการคำนวณ Stock (หัวใจสำคัญ)
  // ---------------------------------------------------------------------------
  const stockData = useMemo(() => {
    return dataEQ.map((eq) => {
      const items = eq.items || [];

      // คำนวณยอดที่ถูกจอง (ต้องเช็ค items ของ eq นั้นๆ)
      const reservedQuantity = items.reduce((sum: number, item: any) => {
        // ต้องเช็คว่า maMedicalEquipment มีอยู่จริงไหมก่อนเรียก status
        const status = item.maMedicalEquipment?.status?.toLowerCase();

        // ถ้าสถานะเป็น Pending หรือ Approve ถือว่าของถูกใช้อยู่
        if (status === "pending" || status === "approve") {
          return sum + (item.quantity || 0);
        }
        return sum;
      }, 0);

      const totalQuantity = eq.quantity || 0;
      const remaining = totalQuantity - reservedQuantity;

      return {
        ...eq,
        key: eq.id, // ต้องมี key สำหรับ Table
        reservedQuantity,
        remainingQuantity: remaining < 0 ? 0 : remaining, // ห้ามติดลบ
      };
    });
  }, [dataEQ]); // คำนวณใหม่เมื่อ dataEQ เปลี่ยน

  // กรองข้อมูลใน Modal ตาม Search Text
  const modalDataSource = stockData.filter((item) =>
    item.equipmentName?.toLowerCase().includes(searchText.toLowerCase()),
  );

  // เปิด Modal
  const handleOpenModal = () => {
    // ให้ Modal เลือกรายการที่มีอยู่แล้วไว้ก่อน (Pre-select)
    setTempSelectedKeys(selectedTools.map((t) => t.id));
    setSearchText("");
    setIsModalOpen(true);
  };

  // กดตกลงใน Modal
  const handleModalOk = () => {
    // กรองเอาเฉพาะข้อมูลของ keys ที่เลือก
    const newSelectedTools = stockData
      .filter((item) => tempSelectedKeys.includes(item.id))
      .map((item) => {
        // ถ้าเคยเลือกไว้แล้ว ให้คงค่าจำนวนเดิม (quantityToSend) ไว้
        const existing = selectedTools.find((t) => t.id === item.id);
        return {
          ...item,
          quantityToSend: existing ? existing.quantityToSend : undefined,
        };
      });

    setSelectedTools(newSelectedTools);
    setIsModalOpen(false);
  };

  // ลบรายการออกจากตารางหลัก
  const handleDeleteItem = (id: number) => {
    setSelectedTools((prev) => prev.filter((item) => item.id !== id));
  };

  // เปลี่ยนค่าจำนวนที่จะส่ง (InputNumber)
  const handleQuantityChange = (id: number, value: number | null) => {
    setSelectedTools((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantityToSend: value } : item,
      ),
    );
  };

  // Submit Form
  const onFinish = async (values: any) => {
    try {
      // Validation: ต้องมีรายการ และทุกรายการต้องระบุจำนวน > 0
      if (selectedTools.length === 0) {
        message.warning("กรุณาเลือกเครื่องมืออย่างน้อย 1 รายการ");
        return;
      }

      const invalidItems = selectedTools.filter(
        (t) => !t.quantityToSend || t.quantityToSend <= 0,
      );
      if (invalidItems.length > 0) {
        message.warning("กรุณาระบุจำนวนที่ส่งซ่อมให้ครบถ้วน");
        return;
      }

      const payload = {
        sentDate: values.sentDate.toISOString(),
        receivedDate: null,
        note: values.note,
        createdBy: session?.user?.fullName,
        createdById: session?.user?.userId,
        createdAt: new Date(),
        // Map จาก state selectedTools แทน values ของ Form เดิม
        items: selectedTools.map((item) => ({
          medicalEquipmentId: item.id,
          quantity: item.quantityToSend,
        })),
      };

      const res = await maService.createMaMedicalEquipment(payload);
      if (res) {
        setLoading(true);
        await fetchData();
        message.success("บันทึกข้อมูลสำเร็จ");
        form.resetFields();
        setSelectedTools([]); // เคลียร์ตาราง
      } else {
        message.error("ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      message.error("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  // ---------------------------------------------------------------------------
  // 3. UI Components (Columns)
  // ---------------------------------------------------------------------------

  // // Columns ของ Modal (เลือกของ)
  const modalColumns = [
    {
      title: "ชื่อเครื่องมือ",
      dataIndex: "equipmentName",
      render: (text: string, record: any) => (
        <span>
          {text}{" "}
          {record.remainingQuantity === 0 && (
            <Tag color="orange">ดำเนินการอยู่</Tag>
          )}
        </span>
      ),
    },
    {
      title: "คงเหลือ",
      dataIndex: "remainingQuantity",
      width: 100,
      align: "center" as const,
      render: (val: number) => (
        <span
          className={val > 0 ? "text-green-600 font-bold" : "text-gray-400"}
        >
          {val}
        </span>
      ),
    },
  ];

  // Columns ของตารางหลัก (กรอกจำนวน)
  const mainTableColumns = [
    {
      title: "ชื่อเครื่องมือ",
      dataIndex: "equipmentName",
      key: "equipmentName",
    },
    {
      title: "คงเหลือ",
      dataIndex: "remainingQuantity",
      key: "remainingQuantity",
      width: 100,
      align: "center" as const,
      render: (val: number) => <Tag>{val}</Tag>,
    },
    {
      title: "จำนวนที่ส่งซ่อม",
      key: "quantityToSend",
      width: 180,
      render: (_: any, record: any) => (
        <InputNumber
          min={1}
          max={record.remainingQuantity}
          placeholder="ระบุจำนวน"
          className="w-full"
          value={record.quantityToSend}
          onChange={(val) => handleQuantityChange(record.id, val)}
          status={!record.quantityToSend ? "warning" : ""}
        />
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(record.id)}
        />
      ),
    },
  ];

  return (
    <Card className="shadow-lg rounded-2xl border-gray-100 overflow-hidden mt-5">
      <Form form={form} layout="vertical" onFinish={onFinish} preserve={false}>
        {/* ส่วนหัวตาราง + ปุ่มกดเลือก */}
        <div className="flex justify-between items-center mb-4">
          <Text strong className="text-base text-gray-700">
            รายการเครื่องมือที่ส่งนึ่งฆ่าเชื้อ
          </Text>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            เลือกเครื่องมือ
          </Button>
        </div>

        {/* ตารางหลัก (แสดงเฉพาะที่เลือก) */}
        <Table
          dataSource={selectedTools}
          columns={mainTableColumns}
          pagination={false}
          locale={{ emptyText: "ยังไม่ได้เลือกเครื่องมือ" }}
          bordered
          size="middle"
          summary={(pageData) => {
            if (pageData.length > 0) return null;
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <div
                    className="text-center py-8 text-gray-400 cursor-pointer"
                    onClick={handleOpenModal}
                  >
                    + กดที่นี่เพื่อเลือกเครื่องมือ
                  </div>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />

        <div className="border-t border-gray-100 my-6 pt-6"></div>

        {/* ส่วนข้อมูลวันที่และหมายเหตุ (เหมือนเดิม) */}
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="วันที่ส่งซ่อม"
              name="sentDate"
              rules={[{ required: true, message: "กรุณาเลือกวันที่ส่ง" }]}
            >
              <DatePicker
                locale={buddhistLocale}
                format="D MMMM BBBB"
                className="w-full h-11 rounded-xl"
                disabledDate={(current) => {
                  if (!current) return false;
                  const today = dayjs().startOf("day");
                  if (current.isBefore(today)) return true;

                  const isDuplicate = data.some((item) => {
                    if (!item.sentDate || item.status === "cancel")
                      return false;
                    return dayjs(item.sentDate).isSame(current, "day");
                  });

                  return isDuplicate;
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="หมายเหตุ" name="note">
              <TextArea
                rows={1}
                placeholder="รายละเอียดเพิ่มเติม"
                className="rounded-xl"
                style={{ minHeight: "44px" }}
                maxLength={150}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="text-center mt-4 mb-0">
          <Button
            type="primary"
            htmlType="submit"
            className="h-10 px-8 rounded-lg shadow-md bg-[#0683e9]"
          >
            บันทึกข้อมูล
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="เลือกเครื่องมือแพทย์"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        okText="ยืนยันการเลือก"
        cancelText="ยกเลิก"
      >
        <Input
          placeholder="ค้นหาชื่อเครื่องมือ..."
          prefix={<SearchOutlined />}
          className="mb-4"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Table
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: tempSelectedKeys,
            onChange: (keys) => setTempSelectedKeys(keys),
            // ปิดไม่ให้เลือกรายการที่ของหมด (Remaining = 0)
            getCheckboxProps: (record) => ({
              disabled: record.remainingQuantity <= 0,
            }),
          }}
          dataSource={modalDataSource}
          columns={modalColumns}
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ y: 300 }} // Fix ความสูงถ้ามีของเยอะ
        />
      </Modal>
    </Card>
  );
}
