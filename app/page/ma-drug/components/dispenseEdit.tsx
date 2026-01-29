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
  Select,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { DispenseType, DrugType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import th_TH from "antd/locale/th_TH";
import CustomTable from "../../common/CustomTable";
import { useSession } from "next-auth/react";

interface DispenseEditProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: DispenseType | null;
  drugs: DrugType[];
  existingData: DispenseType[];
}

export default function DispenseEdit({
  visible,
  onClose,
  onSuccess,
  data,
  drugs = [],
  existingData,
}: DispenseEditProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const intraAuth = useAxiosAuth();
  const dispenseService = MaDrug(intraAuth);
  const [items, setItems] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const { data: session } = useSession();

  // คำนวณยอดรวม Real-time
  const summary = useMemo(() => {
    const totalItems = items.length;
    const totalPrice = items.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.price || 0);
    }, 0);
    return { totalItems, totalPrice };
  }, [items]);

  useEffect(() => {
    if (visible && data) {
      // 1. Set Header
      form.setFieldsValue({
        dispenseDate: data.dispenseDate ? dayjs(data.dispenseDate) : null,
        note: data.note,
      });

      // 2. Set Items
      if (data.dispenseItems) {
        setItems(
          data.dispenseItems.map((item) => {
            const masterDrug = drugs.find((d) => d.id === item.drugId);
            const availableStock = (masterDrug?.quantity || 0) + item.quantity;

            return {
              key: item.id || `temp_${item.drugId}`,
              drugId: item.drugId,
              drugName: item.drug?.name || masterDrug?.name,
              packagingSize:
                item.drug?.packagingSize || masterDrug?.packagingSize,
              price: item.price, // ราคาเดิมที่เคยบันทึก
              quantity: item.quantity,
              maxQty: availableStock, // เก็บค่า Max ไว้เช็ค
            };
          }),
        );
      }
    }
  }, [visible, data, form, drugs]);

  // ฟังก์ชันแก้ไขจำนวน
  const handleQuantityChange = (val: number | null, recordKey: React.Key) => {
    const newItems = items.map((item) => {
      if (item.key === recordKey) {
        return { ...item, quantity: val };
      }
      return item;
    });
    setItems(newItems);
  };

  // ฟังก์ชันลบรายการ
  const handleDeleteItem = (recordKey: React.Key) => {
    setItems(items.filter((item) => item.key !== recordKey));
  };

  // ฟังก์ชันจาก Modal เลือกยาเพิ่ม
  const handleAddDrugs = () => {
    const newItems = [...items];
    selectedRowKeys.forEach((key) => {
      const drugId = Number(key);
      // เช็คว่ามีในรายการแล้วหรือยัง
      if (!newItems.find((i) => i.drugId === drugId)) {
        const masterDrug = drugs.find((d) => d.id === drugId);
        if (masterDrug) {
          newItems.push({
            key: `new_${masterDrug.id}_${Date.now()}`,
            drugId: masterDrug.id,
            drugName: masterDrug.name,
            packagingSize: masterDrug.packagingSize,
            price: masterDrug.price,
            quantity: 1,
            maxQty: masterDrug.quantity, // สำหรับของใหม่ Max คือสต็อกปัจจุบัน
          });
        }
      }
    });
    setItems(newItems);
    setIsAddModalOpen(false);
    setSelectedRowKeys([]);
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
        dispenseDate: values.dispenseDate.toISOString(),
        dispenserName: session?.user?.fullName,
        note: values.note,
        totalPrice: summary.totalPrice,

        // ส่งรายการยาทั้งหมดไป (Backend จะลบของเก่าแล้วสร้างชุดนี้ใหม่)
        dispenseItems: items.map((item) => ({
          drugId: item.drugId,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await dispenseService.editDispense(payload);

      message.success("แก้ไขข้อมูลจ่ายยาสำเร็จ");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("แก้ไขข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // Filter ยาสำหรับ Modal เพิ่ม
  const filteredDrugs = drugs.filter(
    (d) =>
      d.name.toLowerCase().includes(searchText.toLowerCase()) ||
      d.workingCode.toLowerCase().includes(searchText.toLowerCase()),
  );
  const disabledDate = (current: any) => {
    return current && current < dayjs().startOf("day");
  };

  // --- Columns ---
  const itemColumns = [
    {
      title: "รายการยา",
      dataIndex: "drugName",
      render: (text: string, record: any) => (
        <div>
          <div className="font-medium text-slate-700">{text}</div>
          <div className="text-xs text-slate-500">
            ขนาด: {record.packagingSize} | ราคา: {record.price}
          </div>
        </div>
      ),
    },
    {
      title: "จำนวนคงเหลือ",
      dataIndex: "maxQty",
      width: 90,
      align: "center" as const,
      render: (val: number) => (
        <span className="text-gray-400 text-xs">({val})</span>
      ),
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      width: 120,
      render: (val: number, record: any) => (
        <Form.Item
          validateStatus={val > record.maxQty ? "error" : ""}
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            min={1}
            max={record.maxQty} // ห้ามแก้เกินสต็อกที่มี (รวมของที่คืนมาแล้ว)
            value={val}
            onChange={(value) => handleQuantityChange(value, record.key)}
            className="w-full"
          />
        </Form.Item>
      ),
    },
    {
      title: "รวมเงิน",
      align: "right" as const,
      width: 100,
      render: (_: any, record: any) => (
        <span className="font-semibold text-blue-600">
          {((record.quantity || 0) * (record.price || 0)).toLocaleString()}
        </span>
      ),
    },
    {
      title: "",
      width: 50,
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(record.key)}
        />
      ),
    },
  ];

  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 transition-all";

  return (
    <>
      <Modal
        title={
          <div className="text-xl font-bold text-[#0683e9] text-center w-full">
            แก้ไขข้อมูลการจ่ายยา
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        centered
        styles={{
          content: { borderRadius: "20px", padding: "24px" },
          header: {
            marginBottom: "16px",
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: "12px",
          },
        }}
      >
        <ConfigProvider locale={th_TH}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="วันที่จ่าย"
                  name="dispenseDate"
                  validateTrigger={["onChange", "onBlur"]}
                  rules={[
                    { required: true, message: "ระบุวันที่" },
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        const selectedDateStr =
                          dayjs(value).format("YYYY-MM-DD");
                        const isDuplicate = existingData.some((item) => {
                          if (item.id === data?.id) return false; // ยกเว้นตัวเอง
                          return (
                            dayjs(item.dispenseDate).format("YYYY-MM-DD") ===
                            selectedDateStr
                          );
                        });
                        if (isDuplicate)
                          return Promise.reject(new Error("วันที่ซ้ำ"));
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    className={`${inputStyle} pt-2`}
                    disabledDate={disabledDate}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="หมายเหตุ" name="note">
                  <Input className={inputStyle} />
                </Form.Item>
              </Col>
            </Row>

            {/* ส่วนรายการยา */}
            <div className="mt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-700">
                  รายการยา ({summary.totalItems})
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    *Max คือจำนวนสูงสุดที่เบิกได้ (รวมที่เคยเบิกไปแล้ว)
                  </span>
                </span>
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  เพิ่มรายการ
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table
                  dataSource={items}
                  columns={itemColumns}
                  pagination={false}
                  size="small"
                  scroll={{ y: 250 }}
                  rowKey="key"
                />
              </div>
              <div className="text-right mt-2 text-red-500 font-bold">
                รวมเป็นเงิน: {summary.totalPrice.toLocaleString()} บาท
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button onClick={onClose} className="h-10 px-6 rounded-lg">
                ยกเลิก
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9]"
              >
                บันทึกการแก้ไข
              </Button>
            </div>
          </Form>
        </ConfigProvider>
      </Modal>

      <Modal
        title="เพิ่มรายการยา"
        open={isAddModalOpen}
        onOk={handleAddDrugs}
        onCancel={() => setIsAddModalOpen(false)}
        width={700}
        centered
      >
        <Input
          prefix={<SearchOutlined />}
          placeholder="ค้นหายา..."
          className="mb-4 h-10 rounded-lg"
          onChange={(e) => setSearchText(e.target.value)}
        />
        <CustomTable
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            getCheckboxProps: (r: DrugType) => ({ disabled: r.quantity <= 0 }),
          }}
          columns={[
            { title: "ชื่อยา", dataIndex: "name" },
            { title: "คงเหลือ", dataIndex: "quantity", width: 100 },
          ]}
          dataSource={filteredDrugs}
          rowKey="id"
          size="small"
          scroll={{ y: 300 }}
        />
      </Modal>
    </>
  );
}
