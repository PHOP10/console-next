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
import { SaveOutlined, CalculatorOutlined } from "@ant-design/icons";
import { MaDrugType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import dayjs from "dayjs";
import "dayjs/locale/th";

interface MaDrugReceiveModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: MaDrugType | null;
}

interface ReceiveItem {
  id: number; // ID ของ MaDrugItem
  drugId: number;
  drugName: string;
  drugCode: string;
  packagingSize: string;
  price: number;
  requestQty: number; // จำนวนที่ขอเบิก
  receivedQty: number | null;
}

export default function MaDrugReceiveModal({
  visible,
  onClose,
  onSuccess,
  data,
}: MaDrugReceiveModalProps) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ReceiveItem[]>([]);

  // แปลงข้อมูลเมื่อเปิด Modal
  useEffect(() => {
    if (visible && data?.maDrugItems) {
      const initialItems = data.maDrugItems.map((item: any) => ({
        id: item.id,
        drugId: item.drugId,
        drugName: item.drug?.name || "-",
        drugCode: item.drug?.workingCode || "-",
        packagingSize: item.drug?.packagingSize || "-",
        price: item.drug?.price || 0,
        requestQty: item.quantity,
        receivedQty: item.quantity,
      }));
      setItems(initialItems);
    }
  }, [visible, data]);

  // คำนวณยอดรวม Real-time
  const summary = useMemo(() => {
    const totalQty = items.reduce(
      (sum, item) => sum + (item.receivedQty || 0),
      0,
    );
    const totalAmt = items.reduce(
      (sum, item) => sum + (item.receivedQty || 0) * item.price,
      0,
    );
    return { totalQty, totalAmt };
  }, [items]);

  const handleQtyChange = (val: number | null, index: number) => {
    const newItems = [...items];
    newItems[index].receivedQty = val;

    setItems(newItems);
  };
  const handleFinish = async () => {
    if (!data) return;

    try {
      setLoading(true);
      const payload = {
        id: data.id,
        items: items.map((item) => ({
          maDrugItemId: item.id,
          drugId: item.drugId,
          receivedQuantity: item.receivedQty,
        })),
        totalPrice: summary.totalAmt,
      };
      await intraAuthService.receiveMaDrug(payload);

      message.success("บันทึกการรับยาเรียบร้อยแล้ว");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการบันทึก");
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
      render: (text: string, record: ReceiveItem) => (
        <div>
          <div className="font-medium text-slate-700">{text}</div>
          <div className="text-xs text-slate-400">
            ขนาด: {record.packagingSize} | ราคา: {record.price} บ.
          </div>
        </div>
      ),
    },
    {
      title: "ขอเบิก",
      dataIndex: "requestQty",
      align: "center" as const,
      width: 100,
      render: (val: number) => <span className="text-slate-500">{val}</span>,
    },
    {
      title: "รับจริง",
      dataIndex: "receivedQty",
      align: "center" as const,
      width: 140,
      render: (val: number, record: ReceiveItem, index: number) => (
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
      render: (_: any, record: ReceiveItem) => (
        <span className="font-semibold text-slate-700">
          {((record.receivedQty || 0) * record.price).toLocaleString()}
        </span>
      ),
    },
  ];

  if (!data) return null;

  return (
    <Modal
      title={
        <div className="text-xl font-bold text-[#0683e9] flex items-center gap-2">
          ยืนยันการรับยาเข้าคลัง
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
        {/* 1. ส่วนแสดงข้อมูลใบเบิก (Read Only) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div className="text-xs text-slate-500">เลขที่ใบเบิก</div>
              <div className="font-bold text-slate-700 text-lg">
                {data.requestNumber}
              </div>
            </Col>
            <Col span={8}>
              <div className="text-xs text-slate-500">หน่วยงาน</div>
              <div className="font-semibold text-slate-700">
                {data.requestUnit}
              </div>
            </Col>
            <Col span={8}>
              <div className="text-xs text-slate-500">วันที่ขอเบิก</div>
              <div className="font-medium text-slate-700">
                {dayjs(data.requestDate).locale("th").format("DD MMM YYYY")}
              </div>
            </Col>
          </Row>
        </div>

        {/* 2. ตารางรายการยา */}
        <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-blue-50/50 px-4 py-2 border-b border-blue-100 flex justify-between items-center">
            <span className="font-semibold text-blue-700">
              รายการยาที่ขอเบิก
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
                  <span className="text-red-600 text-lg">
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
            className="h-10 px-6 rounded-lg bg-[#0683e9] shadow-md hover:shadow-lg border-0"
          >
            ยืนยันการรับยา (อัปเดตสต็อก)
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
