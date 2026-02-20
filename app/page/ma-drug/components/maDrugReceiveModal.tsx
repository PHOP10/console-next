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
  DatePicker,
} from "antd";
import { MaDrugType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { buddhistLocale } from "@/app/common";

interface MaDrugReceiveModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: MaDrugType | null;
}

interface ReceiveItem {
  id: number;
  drugId: number;
  drugName: string;
  drugCode: string;
  packagingSize: string;
  price: number;
  requestQty: number;
  receivedQty: number | null;
  expiryDate?: dayjs.Dayjs | null;
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
        expiryDate: item.expiryDate ? dayjs(item.expiryDate) : null,
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

  const handleExpiryChange = (date: dayjs.Dayjs | null, index: number) => {
    const newItems = [...items];
    newItems[index].expiryDate = date;
    setItems(newItems);
  };

  const handleFinish = async () => {
    if (!data) return;

    // ✅ Validation: ตรวจสอบว่ากรอกวันหมดอายุครบไหม (เฉพาะรายการที่มีการรับ)
    const incompleteItems = items.filter(
      (item) => (item.receivedQty || 0) > 0 && !item.expiryDate,
    );

    if (incompleteItems.length > 0) {
      message.error(
        `กรุณาระบุ "วันหมดอายุ" ให้ครบถ้วน (${incompleteItems.length} รายการ)`,
      );
      return;
    }

    try {
      setLoading(true);
      const payload = {
        id: data.id,
        items: items.map((item) => ({
          maDrugItemId: item.id,
          drugId: item.drugId,
          receivedQuantity: item.receivedQty,
          expiryDate: item.expiryDate ? item.expiryDate.toISOString() : null,
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
      width: 120,
      render: (text: string) => <span className="text-slate-500">{text}</span>,
    },
    {
      title: "รายการยา",
      dataIndex: "drugName",
      render: (text: string, record: ReceiveItem) => (
        <div>
          <div className="font-medium text-slate-700 text-base">{text}</div>
          <div className="text-sm text-slate-400">
            ขนาด: {record.packagingSize} | ราคา: {record.price} บ.
          </div>
        </div>
      ),
    },
    {
      title: (
        <span>
          วันหมดอายุ <span className="text-red-500">*</span>
        </span>
      ),
      dataIndex: "expiryDate",
      width: 180,
      render: (val: dayjs.Dayjs | null, record: ReceiveItem, index: number) => {
        const isRequiredAndEmpty = (record.receivedQty || 0) > 0 && !val;

        return (
          <DatePicker
            locale={buddhistLocale}
            format="D MMMM BBBB"
            value={val}
            onChange={(date) => handleExpiryChange(date, index)}
            className={`w-full text-center ${
              isRequiredAndEmpty
                ? "border-red-400 bg-red-50"
                : "border-blue-300"
            }`}
            placeholder="ระบุวันหมดอายุ"
            allowClear={false}
            status={isRequiredAndEmpty ? "error" : ""}
            disabledDate={(current) => {
              return current && current <= dayjs().endOf("day");
            }}
          />
        );
      },
    },
    {
      title: "ขอเบิก",
      dataIndex: "requestQty",
      align: "center" as const,
      width: 100,
      render: (val: number) => (
        <span className="text-slate-500 text-base">{val}</span>
      ),
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
          className="w-full border-blue-300 focus:border-blue-500 font-bold text-blue-700 text-center text-base"
        />
      ),
    },
    {
      title: "รวมเงิน",
      key: "total",
      align: "right" as const,
      width: 150,
      render: (_: any, record: ReceiveItem) => (
        <span className="font-semibold text-slate-700 text-base">
          {((record.receivedQty || 0) * record.price).toLocaleString()}
        </span>
      ),
    },
  ];

  if (!data) return null;

  return (
    <Modal
      title={
        <div className="text-2xl font-bold text-[#0683e9] flex items-center gap-2 py-2">
          ยืนยันการรับยาเข้าคลัง
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="80vw"
      style={{ top: 20 }}
      centered
      styles={{
        content: { borderRadius: "16px", padding: 0, overflow: "hidden" },
        header: { padding: "20px 24px", borderBottom: "1px solid #f0f0f0" },
        // ✅ เปลี่ยนจาก height เป็น maxHeight เพื่อให้ขยายตามเนื้อหาข้างใน และ Scroll ได้ปกติ
        body: { padding: "24px", maxHeight: "85vh", overflowY: "auto" },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="flex flex-col gap-6" // ✅ ลบ h-full และใช้ gap ช่วยระยะห่างแทน
      >
        {/* 1. ส่วนแสดงข้อมูลใบเบิก */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <div className="text-sm text-slate-500">เลขที่ใบเบิก</div>
              <div className="font-bold text-slate-700 text-xl">
                {data.requestNumber}
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-sm text-slate-500">หน่วยงาน</div>
              <div className="font-semibold text-slate-700 text-lg">
                {data.requestUnit}
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-sm text-slate-500">วันที่ขอเบิก</div>
              <div className="font-medium text-slate-700 text-lg">
                {dayjs(data.requestDate).locale("th").format("DD MMMM YYYY")}
              </div>
            </Col>
          </Row>
        </div>

        {/* 2. ตารางรายการยา */}
        {/* ✅ นำคลาส overflow-hidden/flex-1 ที่บีบกล่องตารางออก */}
        <div className="border border-slate-200 rounded-lg bg-white">
          <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-100 flex justify-between items-center rounded-t-lg">
            <span className="font-semibold text-blue-700 text-lg">
              รายการยาที่ขอเบิก
            </span>
            <Tag color="blue" className="text-base px-3 py-1">
              {items.length} รายการ
            </Tag>
          </div>
          <div className="w-full">
            <Table
              dataSource={items}
              columns={columns}
              rowKey="id"
              size="middle"
              scroll={{ x: "max-content", y: 450 }}
              pagination={{
                pageSizeOptions: ["10", "20", "50", "100"],
                showSizeChanger: true,
                defaultPageSize: 20,
                showTotal: (total, range) => (
                  <span className="text-gray-500 text-xs sm:text-sm font-light">
                    แสดง {range[0]}-{range[1]} จากทั้งหมด{" "}
                    <span className="font-bold text-blue-600">{total}</span>{" "}
                    รายการ
                  </span>
                ),
                locale: { items_per_page: "/ หน้า" },
                position: ["bottomRight"],
              }}
              summary={() => (
                <Table.Summary.Row className="bg-slate-50 font-bold text-lg">
                  <Table.Summary.Cell index={0} colSpan={4} align="right">
                    รวมทั้งสิ้น
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="center">
                    <span className="text-blue-600">
                      {summary.totalQty.toLocaleString()}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <span className="text-red-600">
                      ฿ {summary.totalAmt.toLocaleString()}
                    </span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>
        </div>

        {/* 3. ปุ่มดำเนินการ */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
          <Button onClick={onClose} className="h-12 px-8 rounded-xl text-lg">
            ยกเลิก
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="h-12 px-8 rounded-xl bg-[#0683e9] shadow-md hover:shadow-lg border-0 text-lg"
          >
            ยืนยันการรับยา (อัปเดตสต็อก)
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
