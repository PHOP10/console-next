"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Row,
  Col,
  message,
  Button,
  ConfigProvider,
  Table,
  Popconfirm,
  Statistic,
  Card,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { MaDrugType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import th_TH from "antd/locale/th_TH";
import { buddhistLocale } from "@/app/common";

interface MaDrugEditProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: MaDrugType | null;
  existingData: MaDrugType[];
}

export default function MaDrugEdit({
  visible,
  onClose,
  onSuccess,
  data,
  existingData,
}: MaDrugEditProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);
  const [items, setItems] = useState<any[]>([]);

  const summary = useMemo(() => {
    const totalItems = items.length;
    const totalPrice = items.reduce((sum, item) => {
      const price = item.drug?.price || 0;
      return sum + (item.quantity || 0) * price;
    }, 0);
    return { totalItems, totalPrice };
  }, [items]);

  useEffect(() => {
    if (visible && data) {
      form.setFieldsValue({
        requestNumber: data.requestNumber,
        requestDate: data.requestDate ? dayjs(data.requestDate) : null,
        requestUnit: data.requestUnit,
        roundNumber: data.roundNumber,
        note: data.note,
      });

      if (data.maDrugItems) {
        setItems(
          data.maDrugItems.map((item) => ({
            ...item,
            key: item.id,
            drugName: item.drug?.name,
            packagingSize: item.drug?.packagingSize,
            price: item.drug?.price,
            stockQty: item.drug?.quantity,
          })),
        );
      }
    }
  }, [visible, data, form]);

  const disabledDate = (current: any) => {
    return current && current < dayjs().startOf("day");
  };

  const handleQuantityChange = (val: number | null, recordKey: number) => {
    const newItems = items.map((item) => {
      if (item.key === recordKey) {
        return { ...item, quantity: val };
      }
      return item;
    });
    setItems(newItems);
  };

  const handleDeleteItem = (recordKey: number) => {
    const newItems = items.filter((item) => item.key !== recordKey);
    setItems(newItems);
  };

  const onFinish = async (values: any) => {
    if (!data) return;

    if (items.length === 0) {
      message.error("ต้องมีรายการยาอย่างน้อย 1 รายการ");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        id: data.id,
        requestNumber: values.requestNumber,
        requestDate: values.requestDate.toISOString(),
        requestUnit: values.requestUnit,
        roundNumber: values.roundNumber,
        note: values.note,
        totalPrice: summary.totalPrice,
        quantityUsed: summary.totalItems,
        maDrugItems: items.map((item) => ({
          id: item.id,
          drugId: item.drugId,
          quantity: item.quantity,
        })),
      };

      await intraAuthService.editMaDrug(payload);

      message.success("แก้ไขข้อมูลสำเร็จ");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating:", error);
      message.error("แก้ไขข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = [
    {
      title: "รายการยา",
      dataIndex: "drugName",
      key: "drugName",
      render: (text: string, record: any) => (
        <div className="py-1">
          <div className="font-medium text-slate-700 text-sm">{text}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            ขนาด: {record.packagingSize} | ราคา:{" "}
            {record.price?.toLocaleString()} บ.
          </div>
        </div>
      ),
    },
    {
      title: "คลัง",
      dataIndex: "stockQty",
      align: "center" as const,
      width: 70,
      render: (val: number) => (
        <span className="text-gray-400 text-sm">{val}</span>
      ),
    },
    {
      title: "จำนวนเบิก",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (val: number, record: any) => (
        <InputNumber
          min={1}
          value={val}
          onChange={(value) => handleQuantityChange(value, record.key)}
          className="w-full text-center"
          size="middle"
        />
      ),
    },
    {
      title: "รวมเงิน",
      align: "right" as const,
      width: 100,
      render: (_: any, record: any) => (
        <span className="font-semibold text-blue-600 text-sm">
          {((record.quantity || 0) * (record.price || 0)).toLocaleString()}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Popconfirm
          title="ลบรายการ?"
          onConfirm={() => handleDeleteItem(record.key)}
          okText="ลบ"
          cancelText="ยกเลิก"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
          />
        </Popconfirm>
      ),
    },
  ];

  const inputStyle =
    "w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";

  return (
    <Modal
      title={
        <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขข้อมูลการเบิกยา
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      style={{ maxWidth: "95%", top: 20, paddingBottom: 0 }}
      styles={{
        content: { borderRadius: "20px", padding: "16px sm:24px" },
        header: {
          marginBottom: "16px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
        },
      }}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="เลขที่เบิก"
                name="requestNumber"
                rules={[{ required: true, message: "กรุณากรอกเลขที่เบิก" }]}
              >
                <Input className={inputStyle} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="วันที่ขอเบิก"
                name="requestDate"
                rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
              >
                <DatePicker
                  format="D MMMM BBBB"
                  className={inputStyle}
                  style={{ width: "100%" }}
                  disabledDate={disabledDate}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="หน่วยงานที่เบิก"
                name="requestUnit"
                rules={[{ required: true }]}
              >
                <Input className={inputStyle} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="เบิกครั้งที่"
                name="roundNumber"
                rules={[{ required: true }]}
              >
                <InputNumber
                  className={`${inputStyle} pt-1 w-full text-center`}
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea
              rows={2}
              className="rounded-xl"
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
            />
          </Form.Item>

          {/* ส่วนตารางแก้ไขรายการยา */}
          <div className="mt-4 mb-6">
            <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
              <span className="font-bold text-gray-700 text-base">
                รายการยา ({summary.totalItems})
              </span>
              <span className="text-red-500 font-bold text-base sm:text-lg bg-red-50 px-3 py-1 rounded-lg">
                รวม {summary.totalPrice.toLocaleString()} บาท
              </span>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table
                dataSource={items}
                columns={itemColumns}
                pagination={false}
                size="small"
                scroll={{ x: "max-content", y: 300 }}
                rowKey="key"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="h-10 px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300 w-full sm:w-auto"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0 w-full sm:w-auto"
            >
              บันทึกการแก้ไข
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
}
