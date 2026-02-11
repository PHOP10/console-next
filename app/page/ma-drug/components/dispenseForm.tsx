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
  Divider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DispenseType, DrugType, MasterDrugType } from "../../common";
import { useSession } from "next-auth/react";
import CustomTable from "../../common/CustomTable";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { buddhistLocale } from "@/app/common";
import { useRouter } from "next/navigation";
import DrugSelectModal from "./drugSelectModal";

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
  const router = useRouter();
  const [masterDrugs, setMasterDrugs] = useState<MasterDrugType[]>([]);

  const existingDates = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const dates = data.map((item: any) =>
      dayjs(item.dispenseDate).format("YYYY-MM-DD"),
    );
    return Array.from(new Set(dates));
  }, [data]);

  const summary = useMemo(() => {
    const totalItems = dataSource.length;
    const totalPrice = dataSource.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);
    return { totalItems, totalPrice };
  }, [dataSource]);

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await dispenseService.getMasterDrugQuery();
        if (Array.isArray(res)) setMasterDrugs(res);
      } catch (error) {
        console.error("fetch master drug err", error);
      }
    };
    fetchMaster();
  }, []);

  // 🎯 ปรับ useEffect: เอาการเซ็ตค่าวันที่อัตโนมัติออก ให้ช่องว่างบังคับให้เลือกเอง
  useEffect(() => {
    if (session?.user) {
      form.setFieldsValue({
        dispenserName: session.user.fullName,
        // dispenseDate: dayjs(), <-- ลบออกแล้ว ช่องจะว่างเปล่า
      });
    }
  }, [session, form]);

  const disabledDate = (current: dayjs.Dayjs) => {
    if (!current) return false;
    const isPast = current.isBefore(dayjs().startOf("day"));
    const currentStr = current.format("YYYY-MM-DD");
    const isExisting = existingDates.includes(currentStr);
    return isPast || isExisting;
  };

  const onFinish = async (values: any) => {
    if (dataSource.length === 0) {
      message.error("กรุณาเลือกรายการยาที่จะจ่ายอย่างน้อย 1 รายการ");
      return;
    }

    // Validation: กันเหนียวอีกรอบก่อนส่ง
    const invalidItems = dataSource.filter(
      (item) => item.quantity > item.stockQty,
    );
    if (invalidItems.length > 0) {
      message.error(
        `มียา ${invalidItems.length} รายการ ที่ระบุจำนวนเกินสต็อกคงเหลือ`,
      );
      return;
    }

    try {
      setLoading(true);
      const payload = {
        dispenseDate: values.dispenseDate.toISOString(),
        dispenserName: session?.user?.fullName,
        note: values.note,
        totalPrice: summary.totalPrice,
        createdById: session?.user?.userId,
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
      });

      setDataSource([]);
      refreshData();
      router.push("/page/ma-drug/maDrug?tab=3");
    } catch (error: any) {
      console.error("Dispense Error:", error);
      const errorMsg = error?.response?.data?.message || "บันทึกข้อมูลล้มเหลว";
      message.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDrugsFromModal = (selectedDrugs: DrugType[]) => {
    const newItems: DispenseItemRow[] = selectedDrugs.map((drug) => ({
      key: `${drug.id}_${Date.now()}`,
      drugId: drug.id,
      workingCode: drug.workingCode,
      drugName: drug.name,
      packagingSize: drug.packagingSize,
      stockQty: drug.quantity,
      quantity: 1,
      price: drug.price,
    }));

    setDataSource([...dataSource, ...newItems]);
    setIsModalOpen(false);
  };

  const inputStyle =
    "w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:shadow-md transition-all duration-300 text-sm";
  const tableInputStyle =
    "w-full h-8 sm:h-9 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:shadow-sm text-center";

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
          {/* 🎯 ใส่ max={record.stockQty} เข้าไป พิมพ์เกินไม่ได้แน่นอน */}
          <InputNumber
            min={1}
            max={record.stockQty} // 👈 เพิ่มบรรทัดนี้ครับ
            value={value}
            className={tableInputStyle}
            onChange={(val) => {
              const newData = [...dataSource];
              const index = newData.findIndex(
                (item) => item.key === record.key,
              );
              // เผื่อ User ก๊อปปี้เลขมาวางแล้วมันเกิน ให้มันตัดเหลือเท่าที่มี
              const validValue = val || 1;
              newData[index].quantity =
                validValue > record.stockQty ? record.stockQty : validValue;
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
          icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
          onClick={() => {
            setDataSource(dataSource.filter((item) => item.key !== record.key));
          }}
        />
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

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="mb-6">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="วันที่จ่าย"
                  name="dispenseDate"
                  rules={[{ required: true, message: "ระบุวันที่" }]}
                >
                  <DatePicker
                    locale={buddhistLocale}
                    format="D MMMM BBBB"
                    className={`${inputStyle} w-full`}
                    placeholder="เลือกวันที่"
                    suffixIcon={<CalendarOutlined />}
                    disabledDate={disabledDate}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="หมายเหตุ / เหตุผลการจ่าย" name="note">
                  <Input
                    className={inputStyle}
                    placeholder="เช่น เบิกไปห้องฉุกเฉิน, ตัดยาหมดอายุ"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider dashed />

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
              scroll={{ x: "max-content" }}
              size="small"
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
                บันทึกการจ่ายยา
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      {/* Modal */}
      <DrugSelectModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddDrugsFromModal}
        drugs={drugs}
        masterDrugs={masterDrugs}
        existingDrugIds={dataSource.map((d) => d.drugId)}
        disableZeroStock={true}
      />
    </>
  );
}
