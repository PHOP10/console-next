"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  message,
  Card,
  Row,
  Col,
  Modal,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DispenseType, DrugType } from "../../common";
import { useSession } from "next-auth/react";
import CustomTable from "../../common/CustomTable";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { buddhistLocale } from "@/app/common";
import { useRouter } from "next/navigation";

interface DispenseItemRow {
  key: string;
  drugId: number;
  drugName: string;
  workingCode: string;
  packagingSize: string;
  stockQty: number;
  quantity: number;
  price: number;
}

interface DispenseFormProps {
  drugs: DrugType[];
  refreshData: () => void;
  data: DispenseType[];
}

export default function DispenseForm({
  drugs,
  refreshData,
  data,
}: DispenseFormProps) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const dispenseService = MaDrug(intraAuth);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DispenseItemRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  // คำนวณยอดรวม (Items & Price)
  const summary = useMemo(() => {
    const totalItems = dataSource.length;
    const totalPrice = dataSource.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);
    return { totalItems, totalPrice };
  }, [dataSource]);

  // ตั้งค่า Default Form
  useEffect(() => {
    if (session?.user) {
      form.setFieldsValue({
        dispenserName: session.user.fullName,
      });
    }
  }, [session, form]);

  const onFinish = async (values: any) => {
    if (dataSource.length === 0) {
      message.error("กรุณาเลือกรายการยาที่จะจ่ายอย่างน้อย 1 รายการ");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        dispenseDate: values.dispenseDate.toISOString(),
        dispenserName: session?.user?.fullName,
        receiverName: values.receiverName,
        note: values.note,
        totalPrice: summary.totalPrice,
        dispenseItems: {
          create: dataSource.map((item) => ({
            drugId: item.drugId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      };

      await dispenseService.createDispense(payload);

      message.success("บันทึกการจ่ายยาสำเร็จ");
      form.resetFields();
      form.setFieldsValue({
        dispenserName: session?.user?.fullName,
        dispenseDate: dayjs(),
      });

      setDataSource([]);
      refreshData();
      router.push("/page/ma-drug/maDrug?tab=3");
    } catch (error) {
      console.error(error);
      message.error("บันทึกข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // Filter ยาใน Modal
  const filteredDrugs = useMemo(() => {
    return drugs.filter(
      (d) =>
        d.name.toLowerCase().includes(searchText.toLowerCase()) ||
        d.workingCode.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [drugs, searchText]);

  // เมื่อกดตกลงเลือกยาจาก Modal
  const handleModalOk = () => {
    const newItems: DispenseItemRow[] = [];
    selectedRowKeys.forEach((key) => {
      // เช็คว่ายามีในตารางรึยัง
      const isExist = dataSource.find((item) => item.drugId === Number(key));

      if (!isExist) {
        const drug = drugs.find((d) => d.id === Number(key));
        if (drug) {
          newItems.push({
            key: `${drug.id}_${Date.now()}`,
            drugId: drug.id,
            workingCode: drug.workingCode,
            drugName: drug.name,
            packagingSize: drug.packagingSize,
            stockQty: drug.quantity,
            quantity: 1,
            price: drug.price,
          });
        }
      }
    });

    if (newItems.length > 0) {
      setDataSource([...dataSource, ...newItems]);
      message.success(`เพิ่มยา ${newItems.length} รายการ`);
    }
    setIsModalOpen(false);
    setSelectedRowKeys([]);
    setSearchText("");
  };

  const disabledDate = (current: any) => {
    return current && current < dayjs().startOf("day");
  };

  // --- Styles ---
  const inputStyle =
    "w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:shadow-md transition-all duration-300 text-sm";
  const tableInputStyle =
    "w-full h-8 sm:h-9 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:shadow-sm text-center";

  // --- Columns ตารางหลัก (รายการจ่าย) ---
  const mainColumns = [
    {
      title: "รายการยา",
      dataIndex: "drugName",
      key: "drugName",
      render: (text: string, record: DispenseItemRow) => (
        <div className="py-1">
          <div className="font-bold text-gray-700 text-sm">{text}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Code: {record.workingCode} | ขนาด: {record.packagingSize}
          </div>
        </div>
      ),
    },
    {
      title: "คงเหลือ",
      dataIndex: "stockQty",
      key: "stockQty",
      align: "center" as const,
      width: 90,
      render: (val: number) => (
        <span
          className={`font-semibold text-sm ${
            val === 0 ? "text-red-500" : "text-green-600"
          }`}
        >
          {val.toLocaleString()}
        </span>
      ),
    },
    {
      title: "ราคา/หน่วย",
      dataIndex: "price",
      key: "price",
      width: 90,
      align: "right" as const,
      render: (val: number) => (
        <span className="text-gray-500 text-sm">{val.toLocaleString()}</span>
      ),
    },
    {
      title: "จำนวนจ่าย",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      render: (value: number, record: DispenseItemRow) => (
        <Form.Item
          validateStatus={value > record.stockQty ? "error" : ""}
          help={
            value > record.stockQty ? (
              <span className="text-xs">เกินสต็อก</span>
            ) : null
          }
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            min={1}
            max={record.stockQty}
            value={value}
            className={tableInputStyle}
            onChange={(val) => {
              const newData = [...dataSource];
              const index = newData.findIndex(
                (item) => item.key === record.key,
              );
              newData[index].quantity = val || 1;
              setDataSource(newData);
            }}
          />
        </Form.Item>
      ),
    },
    {
      title: "รวม (บาท)",
      key: "subtotal",
      width: 100,
      align: "right" as const,
      render: (_: any, record: DispenseItemRow) => (
        <span className="font-semibold text-slate-700 text-sm">
          {(record.quantity * record.price).toLocaleString()}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      align: "center" as const,
      render: (_: any, record: DispenseItemRow) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined style={{ fontSize: "18px" }} />} // ปรับขนาดไอคอน 18px
          onClick={() => {
            setDataSource(dataSource.filter((item) => item.key !== record.key));
          }}
        />
      ),
    },
  ];

  // --- Columns Modal (เลือกยา) ---
  const modalColumns = [
    { title: "รหัส", dataIndex: "workingCode", width: 90 },
    {
      title: "ชื่อยา",
      dataIndex: "name",
      render: (text: string) => (
        <span className="font-medium text-sm">{text}</span>
      ),
    },
    {
      title: "ราคา",
      dataIndex: "price",
      width: 80,
      align: "right" as const,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: "คงเหลือ",
      dataIndex: "quantity",
      width: 80,
      align: "center" as const,
      render: (val: number) => (
        <span
          className={`font-bold text-sm ${
            val === 0 ? "text-red-500" : "text-green-600"
          }`}
        >
          {val}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0683e9] text-center mb-2 tracking-tight">
          แบบฟอร์มการจ่ายยา
        </h2>
        <hr className="border-slate-100/30 -mx-6 md:-mx-6" />
      </div>

      <Card bordered={false} className="shadow-sm">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Row 1: ผู้จ่าย & วันที่ */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="วันที่จ่าย"
                name="dispenseDate"
                validateTrigger={["onChange", "onBlur"]}
                rules={[{ required: true, message: "ระบุวันที่" }]}
              >
                <DatePicker
                  locale={buddhistLocale}
                  format="D MMMM BBBB"
                  className={`${inputStyle} pt-1 w-full`}
                  placeholder="เลือกวันที่"
                  disabledDate={(current) => {
                    if (!current) return false;
                    const isPast = current < dayjs().startOf("day");

                    const isDuplicate = data.some((item) => {
                      if (!item.dispenseDate) return false;
                      return dayjs(item.dispenseDate).isSame(current, "day");
                    });

                    return isPast || isDuplicate;
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="หมายเหตุ / เหตุผลการจ่าย" name="note">
                <Input className={inputStyle} placeholder="เช่น ตัดยาหมดอายุ" />
              </Form.Item>
            </Col>
          </Row>

          {/* Summary Box */}
          <div className="bg-blue-50/50 p-4 sm:p-6 rounded-2xl border border-blue-100 mb-6 shadow-inner">
            <Row gutter={[24, 16]} align="middle">
              <Col
                xs={24}
                sm={12}
                className="flex flex-col items-center border-r-0 sm:border-r border-blue-200 pb-3 sm:pb-0 border-b sm:border-b-0"
              >
                <span className="text-slate-500 text-sm mb-1">จำนวนรายการ</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600">
                  {summary.totalItems}
                </span>
              </Col>
              <Col
                xs={24}
                sm={12}
                className="flex flex-col items-center pt-3 sm:pt-0"
              >
                <span className="text-slate-500 text-sm mb-1">
                  มูลค่ารวม (บาท)
                </span>
                <span className="text-xl sm:text-2xl font-bold text-red-500">
                  {summary.totalPrice.toLocaleString()}
                </span>
              </Col>
            </Row>
          </div>

          {/* Table Area */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-200 mb-6">
            <div className="flex flex-wrap justify-between items-center mb-4 px-1 gap-2">
              <span className="font-bold text-base sm:text-lg text-gray-700">
                รายการยาที่จะตัดจ่าย
              </span>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                className="border-blue-400 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl w-full sm:w-auto"
              >
                เลือกยาจากคลัง
              </Button>
            </div>

            <CustomTable
              dataSource={dataSource}
              columns={mainColumns}
              pagination={false}
              rowKey="key"
              locale={{ emptyText: "ยังไม่มีรายการยาที่เลือก" }}
              scroll={{ x: "max-content" }} // เพิ่ม scroll แนวนอน
              size="small" // ใช้ size small บนมือถือ
            />
          </div>

          {/* Submit Button */}
          <Form.Item className="mt-6 mb-2">
            <div className="flex justify-center">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="h-10 sm:h-11 px-10 rounded-xl text-base shadow-md bg-[#0683e9] hover:scale-105 transition-transform w-full sm:w-auto"
              >
                ยืนยันการจ่ายยา
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      {/* Modal เลือกยา */}
      <Modal
        title={
          <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
            คลังยา (สำหรับเลือกจ่าย)
          </div>
        }
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        centered
        // Responsive Modal
        style={{ maxWidth: "100%", top: 20, paddingBottom: 0 }}
        styles={{
          content: { borderRadius: "16px", padding: "16px sm:24px" },
        }}
        okText="เพิ่มรายการ"
        cancelText="ปิด"
      >
        <Input
          placeholder="ค้นหาชื่อยา..."
          prefix={<SearchOutlined />}
          className="w-full h-10 sm:h-11 rounded-xl mb-4"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <CustomTable
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            getCheckboxProps: (record: DrugType) => ({
              disabled: record.quantity <= 0,
            }),
          }}
          columns={modalColumns}
          dataSource={filteredDrugs}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
          scroll={{ x: "max-content", y: 300 }}
        />
      </Modal>
    </>
  );
}
