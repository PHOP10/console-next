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
  Alert, // ✅ 1. Import Alert เพิ่มเข้ามา
} from "antd";
import { CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons"; // ✅ 2. Import InfoCircleOutlined
import { DispenseType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
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
  id: number;
  drugId: number;
  drugName: string;
  drugCode: string;
  packagingSize: string;
  price: number;
  qty: number;
  dispensedQty: number | null;
}

export default function DispenseConfirmModal({
  visible,
  onClose,
  onSuccess,
  data,
}: DispenseConfirmModalProps) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const dispenseService = MaDrug(intraAuth);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ConfirmItem[]>([]);

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
        dispensedQty: item.quantity,
      }));
      setItems(initialItems);
    }
  }, [visible, data]);

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
    newItems[index].dispensedQty = val;
    setItems(newItems);
  };

  const handleFinish = async () => {
    if (!data) return;

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
      const msgToShow = Array.isArray(backendMessage)
        ? backendMessage.join(", ")
        : backendMessage || "เกิดข้อผิดพลาดในการบันทึก";
      message.error(msgToShow);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "รหัสยา",
      dataIndex: "drugCode",
      width: 120,
      render: (text: string) => <span className="text-slate-500">{text}</span>,
    },
    {
      title: "รายการยา",
      dataIndex: "drugName",
      render: (text: string, record: ConfirmItem) => (
        <div>
          <div className="font-medium text-slate-700 text-base">{text}</div>
          <div className="text-sm text-slate-400">
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
      render: (val: number) => (
        <span className="text-slate-500 text-base">{val}</span>
      ),
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
          className="w-full border-blue-300 focus:border-blue-500 font-bold text-blue-700 text-center text-base"
        />
      ),
    },
    {
      title: "รวมเงิน",
      key: "total",
      align: "right" as const,
      width: 150,
      render: (_: any, record: ConfirmItem) => (
        <span className="font-semibold text-slate-700 text-base">
          {((record.dispensedQty || 0) * record.price).toLocaleString()}
        </span>
      ),
    },
  ];

  if (!data) return null;

  return (
    <Modal
      title={
        <div className="text-2xl font-bold text-[#0683e9] flex items-center gap-2 py-2">
          ยืนยันการจ่ายยา
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="85%"
      style={{ top: 20 }}
      centered
      styles={{
        content: { borderRadius: "16px", padding: 0, overflow: "hidden" },
        header: { padding: "20px 24px", borderBottom: "1px solid #f0f0f0" },
        body: { padding: "24px", height: "85vh", overflowY: "auto" },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="h-full flex flex-col"
      >
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-6 flex-shrink-0">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <div className="text-sm text-slate-500">ผู้จ่ายยา</div>
              <div className="font-bold text-slate-700 text-xl">
                {data.dispenserName}
              </div>
            </Col>

            <Col xs={24} sm={8}>
              <div className="text-sm text-slate-500">วันที่จ่าย</div>
              <div className="font-medium text-slate-700 text-lg">
                {dayjs(data.dispenseDate).locale("th").format("DD MMMM YYYY")}
              </div>
            </Col>
          </Row>
          {data.note && (
            <div className="mt-3 pt-3 border-t border-blue-200 text-sm text-slate-500">
              หมายเหตุ: <span className="text-slate-700">{data.note}</span>
            </div>
          )}
        </div>

        <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden flex-1 flex flex-col">
          <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-100 flex justify-between items-center flex-shrink-0">
            <span className="font-semibold text-blue-700 text-lg">
              รายการยาที่จะตัดจ่าย
            </span>
            <Tag color="blue" className="text-base px-3 py-1">
              {items.length} รายการ
            </Tag>
          </div>

          {/* ✅ 3. เพิ่มกล่องแจ้งเตือน FEFO ตรงนี้เพื่อให้คนหยิบยารับทราบ */}
          <div className="px-6 pt-4 pb-2 flex-shrink-0">
            <Alert
              message="ระบบจะทำการตัดสต็อกอัตโนมัติแบบ "
              description="กรุณาหยิบยาจากชั้นวางในล๊อตที่ ใกล้หมดอายุที่สุด จ่ายออกไปก่อน เพื่อให้ตรงกับการตัดสต็อกในระบบ"
              type="warning"
              showIcon
              icon={<InfoCircleOutlined />}
              className="rounded-lg border-orange-200 bg-orange-50 text-orange-700"
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <Table
              dataSource={items}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="middle"
              scroll={{ y: "40vh" }} // ปรับความสูงลงมานิดหน่อยเพื่อให้พอกับ Alert
              summary={() => (
                <Table.Summary.Row className="bg-slate-50 font-bold text-lg">
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
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 flex-shrink-0">
          <Button onClick={onClose} className="h-12 px-8 rounded-xl text-lg">
            ยกเลิก
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-md hover:shadow-lg border-0 text-lg"
          >
            ยืนยันการจ่ายยา
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
