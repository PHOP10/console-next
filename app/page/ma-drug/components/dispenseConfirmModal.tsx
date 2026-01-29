"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Button,
  Row,
  Col,
  Table,
  message,
  Tag,
  Divider,
} from "antd";
import { SaveOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { DispenseType } from "../../common"; // อย่าลืม Import Type ของ Dispense
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
// สมมติว่าคุณรวมฟังก์ชันเกี่ยวกับ Dispense ไว้ใน Service นี้ หรือแยกเป็น DispenseService
import { MaDrug } from "../services/maDrug.service";
import dayjs from "dayjs";
import "dayjs/locale/th";

interface DispenseConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: DispenseType | null;
}

interface ConfirmItem {
  id: number; // ID ของ DispenseItem
  drugId: number;
  drugName: string;
  drugCode: string;
  packagingSize: string;
  price: number;
  qty: number; // จำนวนที่ระบุในใบจ่าย
  dispensedQty: number | null; // จำนวนที่จ่ายจริง (ตัดสต็อก)
}

export default function DispenseConfirmModal({
  visible,
  onClose,
  onSuccess,
  data,
}: DispenseConfirmModalProps) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  // เรียก Service (ถ้าคุณแยก DispenseService ก็เปลี่ยนตรงนี้ได้เลย)
  const dispenseService = MaDrug(intraAuth);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ConfirmItem[]>([]);

  // แปลงข้อมูลเมื่อเปิด Modal
  useEffect(() => {
    if (visible && data?.dispenseItems) {
      const initialItems = data.dispenseItems.map((item: any) => ({
        id: item.id,
        drugId: item.drugId,
        drugName: item.drug?.name || "-",
        drugCode: item.drug?.workingCode || "-",
        packagingSize: item.drug?.packagingSize || "-",
        price: item.price || 0,
        qty: item.quantity,
        dispensedQty: item.quantity, // ค่าเริ่มต้นให้เท่ากับจำนวนที่คีย์มา
      }));
      setItems(initialItems);
    }
  }, [visible, data]);

  // คำนวณยอดรวม Real-time
  const summary = useMemo(() => {
    const totalQty = items.reduce(
      (sum, item) => sum + (item.dispensedQty || 0),
      0,
    );
    const totalAmt = items.reduce(
      (sum, item) => sum + (item.dispensedQty || 0) * item.price,
      0,
    );
    return { totalQty, totalAmt };
  }, [items]);

  const handleQtyChange = (val: number | null, index: number) => {
    const newItems = [...items];
    // ปรับแก้: ถ้าเป็น null ให้ใส่ null ไปก่อน (เพื่อไม่ให้เด้งเป็น 0 ตอนลบ)
    newItems[index].dispensedQty = val;
    setItems(newItems);
  };

  // ในไฟล์ DispenseConfirmModal.tsx

  const handleFinish = async () => {
    if (!data) return;

    // ส่วน Validation (ถ้ามี)
    const invalidItems = items.filter(
      (i) => !i.dispensedQty || i.dispensedQty <= 0,
    );
    // if (invalidItems.length > 0) { ... }

    try {
      setLoading(true);
      const payload = {
        id: data.id,
        items: items.map((item) => ({
          dispenseItemId: item.id,
          drugId: item.drugId,
          quantity: item.dispensedQty || 0,
        })),
        totalPrice: summary.totalAmt,
        status: "completed",
      };

      await dispenseService.executeDispense(payload);

      message.success("บันทึกการจ่ายยาและตัดสต็อกเรียบร้อยแล้ว");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error Detail:", error);

      const backendMessage = error.response?.data?.message;

      if (backendMessage) {
        // ถ้า Backend ส่งมาเป็น Array (กรณี error หลายตัว) ให้รวมข้อความ
        const msgToShow = Array.isArray(backendMessage)
          ? backendMessage.join(", ")
          : backendMessage;

        message.error(msgToShow); // 🚨 จะโชว์สาเหตุจริง เช่น "ยา X มีไม่พอ"
      } else {
        message.error("เกิดข้อผิดพลาดในการบันทึก (Unknown Error)");
      }
    } finally {
      setLoading(false);
    }
  };
  // Columns ตาราง
  const columns = [
    {
      title: "รหัสยา",
      dataIndex: "drugCode",
      width: 100,
      render: (text: string) => <span className="text-slate-500">{text}</span>,
    },
    {
      title: "รายการยา",
      dataIndex: "drugName",
      render: (text: string, record: ConfirmItem) => (
        <div>
          <div className="font-medium text-slate-700">{text}</div>
          <div className="text-xs text-slate-400">
            ขนาด: {record.packagingSize} | ราคา: {record.price.toLocaleString()}{" "}
            บ.
          </div>
        </div>
      ),
    },
    {
      title: "จำนวนขอ",
      dataIndex: "qty",
      align: "center" as const,
      width: 100,
      render: (val: number) => <span className="text-slate-400">{val}</span>,
    },
    {
      title: "จ่ายจริง",
      dataIndex: "dispensedQty",
      align: "center" as const,
      width: 140,
      render: (val: number, record: ConfirmItem, index: number) => (
        <InputNumber
          min={0}
          value={val}
          onChange={(v) => handleQtyChange(v, index)}
          className="w-full border-blue-300 focus:border-blue-500 font-bold text-blue-700 text-center"
        />
      ),
    },
    {
      title: "รวมเงิน",
      key: "total",
      align: "right" as const,
      width: 120,
      render: (_: any, record: ConfirmItem) => (
        <span className="font-semibold text-slate-700">
          {((record.dispensedQty || 0) * record.price).toLocaleString()}
        </span>
      ),
    },
  ];

  if (!data) return null;

  return (
    <Modal
      title={
        <div className="text-xl font-bold text-[#0683e9] flex items-center gap-2">
          <CheckCircleOutlined /> ยืนยันการจ่ายยา (ตัดสต็อก)
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      styles={{
        content: { borderRadius: "16px", padding: 0, overflow: "hidden" },
        header: { padding: "20px 24px", borderBottom: "1px solid #f0f0f0" },
        body: { padding: "24px" },
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div className="text-xs text-slate-500">ผู้จ่ายยา</div>
              <div className="font-bold text-slate-700 text-lg">
                {data.dispenserName}
              </div>
            </Col>
            <Col span={8}>
              <div className="text-xs text-slate-500">ผู้รับยา/หน่วยงาน</div>
              <div className="font-semibold text-slate-700">
                {data.receiverName}
              </div>
            </Col>
            <Col span={8}>
              <div className="text-xs text-slate-500">วันที่จ่าย</div>
              <div className="font-medium text-slate-700">
                {dayjs(data.dispenseDate).locale("th").format("DD MMM YYYY")}
              </div>
            </Col>
          </Row>
          {data.note && (
            <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-slate-500">
              หมายเหตุ: <span className="text-slate-700">{data.note}</span>
            </div>
          )}
        </div>

        {/* 2. ตารางรายการยา */}
        <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-blue-50/50 px-4 py-2 border-b border-blue-100 flex justify-between items-center">
            <span className="font-semibold text-blue-700">
              รายการยาที่จะตัดจ่าย
            </span>
            <Tag color="blue">{items.length} รายการ</Tag>
          </div>
          <Table
            dataSource={items}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            size="small"
            scroll={{ y: 300 }}
            summary={() => (
              <Table.Summary.Row className="bg-slate-50 font-bold">
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  รวมทั้งสิ้น
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="center">
                  <span className="text-blue-600">
                    {summary.totalQty.toLocaleString()}
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <span className="text-blue-600 text-lg">
                    ฿ {summary.totalAmt.toLocaleString()}
                  </span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </div>

        {/* 3. ปุ่มดำเนินการ */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button onClick={onClose} className="h-10 px-6 rounded-lg">
            ยกเลิก
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 shadow-md hover:shadow-lg border-0"
          >
            ยืนยันการตัดสต็อก
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
