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
  Table,
  Row,
  Col,
  Modal,
  Select, // ✅ Import Select
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType, MaDrugType, MasterDrugType } from "../../common";
import DrugSelectModal from "./drugSelectModal";
import { useSession } from "next-auth/react";
import CustomTable from "../../common/CustomTable";
import dayjs from "dayjs";
import { buddhistLocale } from "@/app/common";
import "dayjs/locale/th";
import { useRouter } from "next/navigation";

dayjs.locale("th");

interface DrugItemRow {
  key: string;
  drugId: number;
  drugName: string;
  packagingSize: string;
  quantity: number | null; // ✅ อนุญาตให้เป็น null ชั่วคราวเวลาลบเลขเพื่อพิมพ์ใหม่
  stockQty: number;
  note: string;
  price: number;
  expiryDate?: dayjs.Dayjs | null;
}

interface MaDrugFormProps {
  drugs: DrugType[];
  refreshData: () => void;
  data: MaDrugType[];
}

export default function MaDrugForm({
  drugs,
  refreshData,
  data,
}: MaDrugFormProps) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DrugItemRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [masterDrugs, setMasterDrugs] = useState<MasterDrugType[]>([]);
  const [customUnits, setCustomUnits] = useState<string[]>([]);
  const [unitInputValue, setUnitInputValue] = useState("");

  // ✅ State สำหรับเก็บค่าว่าเลือก "หน่วยงานที่เบิก" แบบไหน
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const summary = useMemo(() => {
    const totalItems = dataSource.length;
    const totalPrice = dataSource.reduce((sum, item) => {
      // ✅ ถ้าจำนวนเป็น null ให้คิดเป็น 0 ไปก่อน
      return sum + (item.quantity || 0) * item.price;
    }, 0);

    return { totalItems, totalPrice };
  }, [dataSource]);

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await intraAuthService.getMasterDrugQuery();
        if (Array.isArray(res)) setMasterDrugs(res);
      } catch (error) {
        console.error("fetch master drug err", error);
      }
    };
    fetchMaster();
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      quantityUsed: summary.totalItems,
      totalPrice: summary.totalPrice,
    });
  }, [summary, form]);

  const onFinish = async (values: any) => {
    if (dataSource.length === 0) {
      message.warning("กรุณาเลือกรายการยาก่อน");
      return;
    }

    // ดักเช็คว่ามีบรรทัดไหนที่ลืมใส่จำนวนเบิก หรือใส่เป็น 0 ไหม
    const hasInvalidQuantity = dataSource.some(
      (item) => !item.quantity || item.quantity <= 0,
    );
    if (hasInvalidQuantity) {
      message.error("กรุณาระบุจำนวนเบิกให้ครบถ้วนทุกรายการ (ต้องมากกว่า 0)");
      return;
    }

    try {
      setLoading(true);

      // ✅ เช็คว่าถ้าเลือก "OTHER" (อื่นๆ) ให้เอาค่าจากช่อง Input ที่พิมพ์เองมาใช้แทน
      const finalRequestUnit =
        values.requestUnitSelect === "OTHER"
          ? values.requestUnitOther
          : values.requestUnitSelect;

      const payload = {
        requestNumber: values.requestNumber,
        requestUnit: values.requestUnit,
        roundNumber: values.roundNumber,
        requesterName: session?.user?.fullName || values.requesterName,
        requestDate: values.requestDate.toISOString(),
        note: values.note,
        status: "pending",
        totalPrice: summary.totalPrice || 0,
        quantityUsed: summary.totalItems,
        createdById: session?.user?.userId,

        maDrugItems: {
          create: dataSource.map((item) => ({
            drugId: item.drugId,
            quantity: item.quantity || 1,
            price: item.price,
            expiryDate: item.expiryDate ? item.expiryDate.toISOString() : null,
          })),
        },
      };

      await intraAuthService.createMaDrug(payload);
      message.success("บันทึกการเบิกยาสำเร็จ");

      form.resetFields();
      setDataSource([]);
      refreshData();
      router.push("/page/ma-drug/maDrug?tab=1");
    } catch (error) {
      console.error(error);
      message.error("บันทึกข้อมูลล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDrugsFromModal = (selectedDrugs: DrugType[]) => {
    const newItems: DrugItemRow[] = selectedDrugs.map((drug) => ({
      key: `${drug.id}_${Date.now()}`,
      drugId: drug.id,
      drugName: drug.name,
      packagingSize: drug.packagingSize,
      price: drug.price,
      stockQty: drug.quantity,
      quantity: 1, // ค่าตั้งต้นตอนกดเลือกมา
      note: "",
    }));

    setDataSource([...dataSource, ...newItems]);
    setIsModalOpen(false);
  };

  // ✅ เพิ่มตัวแปร Style ให้ครบถ้วน แก้บั๊กสีแดง Cannot find name
  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:shadow-md transition-all duration-300";
  const inputStyle =
    "w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";
  const selectStyle =
    "w-full h-10 sm:h-11 [&>.ant-select-selector]:!rounded-xl shadow-sm";
  const tableInputStyle =
    "w-full h-8 sm:h-9 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:shadow-sm text-center";

  // Columns ตารางหลัก
  const mainColumns: ColumnsType<DrugItemRow> = [
    {
      title: "รายการยา",
      dataIndex: "drugName",
      key: "drugName",
      render: (text: string, record: DrugItemRow) => (
        <div className="py-1">
          <div className="font-bold text-gray-700 text-sm">{text}</div>
          <div className="text-xs text-gray-500 mt-1">
            ขนาด: {record.packagingSize} | ราคา: {record.price.toLocaleString()}{" "}
            บ.
          </div>
        </div>
      ),
    },
    {
      title: "คงเหลือ",
      dataIndex: "stockQty",
      key: "stockQty",
      width: 80,
      align: "center",
      render: (val: number) => (
        <span
          className={`font-semibold text-xs sm:text-sm ${
            val <= 0 ? "text-red-500" : "text-slate-500"
          }`}
        >
          {val?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      title: "จำนวนเบิก",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (value: number | null, record: DrugItemRow) => (
        <InputNumber
          min={1}
          value={value}
          className={tableInputStyle}
          onChange={(val) => {
            const newData = [...dataSource];
            const index = newData.findIndex((item) => item.key === record.key);
            // ✅ เปลี่ยนเป็น val เฉยๆ เพื่อรับค่า null เวลาคนลบเลขออก
            newData[index].quantity = val;
            setDataSource(newData);
          }}
        />
      ),
    },
    {
      title: "รวม (บาท)",
      key: "subtotal",
      width: 100,
      align: "right",
      responsive: ["sm"],
      render: (_: any, record: DrugItemRow) => (
        <span className="font-semibold text-blue-600 text-xs sm:text-sm">
          {((record.quantity || 0) * record.price).toLocaleString()}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      align: "center",
      render: (_: any, record: DrugItemRow) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
          className="hover:bg-red-50 rounded-lg"
          onClick={() => {
            setDataSource(dataSource.filter((item) => item.key !== record.key));
          }}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 sm:mb-6 -mt-4 sm:-mt-7">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0683e9] text-center mb-2 tracking-tight">
          แบบฟอร์มขอเบิกยา
        </h2>
        <hr className="border-slate-100/30 -mx-4 sm:-mx-6" />
      </div>

      <Card bodyStyle={{ padding: "16px sm:24px" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ requestDate: null }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="เลขที่เบิก"
                name="requestNumber"
                rules={[{ required: true, message: "กรุณากรอกเลขที่เบิก" }]}
              >
                <Input
                  placeholder="กรอกเลขที่เบิก"
                  className={inputStyle}
                  maxLength={10}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="วันที่ขอเบิก"
                name="requestDate"
                validateTrigger={["onChange", "onBlur"]}
                rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
              >
                <DatePicker
                  locale={buddhistLocale}
                  format="D MMMM BBBB"
                  placeholder="เลือกวันที่"
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1`}
                  disabledDate={(current) => {
                    if (!current) return false;
                    const isPast = current < dayjs().startOf("day");
                    const isDuplicate = data.some((item) => {
                      if (!item.requestDate) return false;
                      return dayjs(item.requestDate).isSame(current, "day");
                    });

                    return isPast || isDuplicate;
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="หน่วยงานที่เบิก"
                name="requestUnit"
                rules={[{ required: true, message: "กรุณาระบุหน่วยงาน" }]}
              >
                <Select
                  placeholder="-- เลือกหรือพิมพ์หน่วยงานที่เบิก --"
                  className={selectStyle}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="กรอกอื่น ๆ ..."
                          className="rounded-lg h-9 border-gray-300 focus:border-blue-500"
                          onPressEnter={(e) => {
                            form.setFieldValue(
                              "requestUnit",
                              e.currentTarget.value,
                            );
                            // ✅ เพิ่มคำสั่งบังคับพับ Dropdown ทันทีเมื่อกด Enter
                            const activeElement =
                              document.activeElement as HTMLElement;
                            if (activeElement) activeElement.blur();
                          }}
                          onBlur={(e) => {
                            if (e.currentTarget.value) {
                              form.setFieldValue(
                                "requestUnit",
                                e.currentTarget.value,
                              );
                            }
                          }}
                        />
                      </div>
                    </>
                  )}
                >
                  <Select.Option value="โรงพยาบาลวังเจ้า">
                    โรงพยาบาลวังเจ้า
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="เบิกครั้งที่"
                name="roundNumber"
                rules={[{ required: true, message: "กรุณาระบุครั้งที่เบิก" }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1`}
                  placeholder="กรอกเบิกครั้งที่"
                  maxLength={2}
                />
              </Form.Item>
            </Col>
          </Row>

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

          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea
              maxLength={200}
              rows={2}
              placeholder="กรอกหมายเหตุ (ถ้ามี)"
              className={textAreaStyle}
            />
          </Form.Item>

          <div className="bg-gray-50 p-2 sm:p-4 rounded-2xl border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-2 gap-2">
              <span className="font-bold text-base sm:text-lg text-gray-700 flex items-center gap-2">
                รายการยาที่เบิก
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {summary.totalItems}
                </span>
              </span>
              <Button
                type="dashed"
                icon={<PlusOutlined style={{ fontSize: "18px" }} />}
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto border-blue-400 text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-500 rounded-xl h-10 px-4 shadow-sm"
              >
                เลือกรายการยาจากคลัง
              </Button>
            </div>

            <CustomTable
              dataSource={dataSource}
              columns={mainColumns}
              pagination={false}
              rowKey="key"
              locale={{
                emptyText:
                  "ยังไม่มีรายการยา กดปุ่ม '+ เลือกรายการยา' เพื่อเพิ่ม",
              }}
              scroll={{ x: "max-content" }}
              size="small"
              summary={() => {
                if (dataSource.length > 0) {
                  return (
                    <Table.Summary.Row className="bg-blue-50/50 font-bold">
                      <Table.Summary.Cell index={0} colSpan={2} align="right">
                        รวมทั้งสิ้น
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        {/* Hidden on mobile if needed */}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <span className="text-red-600 text-sm sm:text-base">
                          {summary.totalPrice.toLocaleString()}
                        </span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} />
                    </Table.Summary.Row>
                  );
                }
                return undefined;
              }}
            />
          </div>

          <Form.Item className="mt-8 mb-2">
            <div className="flex justify-center items-center gap-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="h-11 px-8 rounded-xl text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-[#0683e9] flex items-center w-full sm:w-auto justify-center"
              >
                บันทึกการเบิกยา
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      {/* เรียกใช้งาน Modal ใหม่ที่เราเพิ่งแยกไป */}
      <DrugSelectModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddDrugsFromModal}
        drugs={drugs}
        masterDrugs={masterDrugs}
        existingDrugIds={dataSource.map((d) => d.drugId)}
        disableZeroStock={false}
      />
    </>
  );
}
