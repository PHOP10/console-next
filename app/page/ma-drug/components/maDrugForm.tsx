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
  ConfigProvider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table"; // Import Type เพื่อแก้ Error
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType, MaDrugType } from "../../common";
import { useSession } from "next-auth/react";
import CustomTable from "../../common/CustomTable";
import dayjs from "dayjs";
import { buddhistLocale } from "@/app/common";
import "dayjs/locale/th";

dayjs.locale("th");

interface DrugItemRow {
  key: string;
  drugId: number;
  drugName: string;
  packagingSize: string;
  quantity: number;
  stockQty: number;
  note: string;
  price: number;
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");

  const summary = useMemo(() => {
    const totalItems = dataSource.length;
    const totalPrice = dataSource.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);

    return { totalItems, totalPrice };
  }, [dataSource]);

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

    try {
      setLoading(true);
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

        maDrugItems: {
          create: dataSource.map((item) => ({
            drugId: item.drugId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      };

      await intraAuthService.createMaDrug(payload);
      message.success("บันทึกการเบิกยาสำเร็จ");

      form.resetFields();
      setDataSource([]);
      refreshData();
    } catch (error) {
      console.error(error);
      message.error("บันทึกข้อมูลล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const filteredDrugs = useMemo(() => {
    return drugs.filter(
      (d) =>
        d.name.toLowerCase().includes(searchText.toLowerCase()) ||
        d.workingCode.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [drugs, searchText]);

  const handleModalOk = () => {
    const newItems: DrugItemRow[] = [];
    selectedRowKeys.forEach((key) => {
      const isExist = dataSource.find((item) => item.drugId === Number(key));
      if (!isExist) {
        const drug = drugs.find((d) => d.id === Number(key));
        if (drug) {
          newItems.push({
            key: `${drug.id}_${Date.now()}`,
            drugId: drug.id,
            drugName: drug.name,
            packagingSize: drug.packagingSize,
            price: drug.price,
            stockQty: drug.quantity,
            quantity: 1,
            note: "",
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

  const inputStyle =
    "w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";

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
            val === 0 ? "text-red-500" : "text-slate-500"
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
      render: (value: number, record: DrugItemRow) => (
        <InputNumber
          min={1}
          max={record.stockQty}
          value={value}
          className={tableInputStyle}
          onChange={(val) => {
            const newData = [...dataSource];
            const index = newData.findIndex((item) => item.key === record.key);
            newData[index].quantity = val || 1;
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
          {(record.quantity * record.price).toLocaleString()}
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
          icon={<DeleteOutlined style={{ fontSize: "18px" }} />} // กฎข้อ 3: Icon size 18
          className="hover:bg-red-50 rounded-lg"
          onClick={() => {
            setDataSource(dataSource.filter((item) => item.key !== record.key));
          }}
        />
      ),
    },
  ];

  // Columns Modal เลือกยา (ระบุ Type เพื่อแก้ Error สีแดงในรูปภาพที่ 4)
  const modalColumns: ColumnsType<DrugType> = [
    {
      title: "รหัสยา",
      dataIndex: "workingCode",
      width: 90,
      responsive: ["sm"], // ซ่อนบนมือถือ
    },
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
      align: "right",
      responsive: ["sm"], // ซ่อนบนมือถือ
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: "คงเหลือ",
      dataIndex: "quantity",
      width: 80,
      align: "center",
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
                rules={[{ required: true, message: "กรุณากรอกหน่วยงาน" }]}
              >
                <Input
                  placeholder="กรอกหน่วยงานที่เบิก"
                  className={inputStyle}
                  maxLength={85}
                />
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
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={12}>
                <Form.Item
                  label="จำนวนรายการ (รายการ)"
                  name="quantityUsed"
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    className="w-full h-10 sm:h-11 rounded-xl border-blue-200 bg-white shadow-sm text-gray-700 font-bold pt-1 text-center"
                    readOnly
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12}>
                <Form.Item
                  label="รวมเป็นเงิน (บาท)"
                  name="totalPrice"
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    className="w-full h-10 sm:h-11 rounded-xl border-blue-200 bg-white shadow-sm text-red-600 font-bold text-base sm:text-lg pt-1 text-center"
                    formatter={(value) =>
                      `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/\฿\s?|(,*)/g, "")}
                    readOnly
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea
              maxLength={200}
              rows={2}
              placeholder="กรอกหมายเหตุ (ถ้ามี)"
              className="w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:shadow-md transition-all duration-300"
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
                บันทึกการเบิกจ่าย
              </Button>
            </div>
          </Form.Item>
        </Form>

        <Modal
          title={
            <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
              รายการยา
            </div>
          }
          open={isModalOpen}
          onOk={handleModalOk}
          onCancel={() => setIsModalOpen(false)}
          width={800}
          okText={`เพิ่ม (${selectedRowKeys.length})`}
          cancelText="ยกเลิก"
          centered
          style={{ maxWidth: "95%", top: 10 }}
          styles={{
            content: { borderRadius: "20px", padding: "16px sm:24px" },
            header: { marginBottom: "16px" },
          }}
        >
          <Input
            placeholder="ค้นหาชื่อยา หรือรหัสยา..."
            prefix={
              <SearchOutlined
                className="text-gray-400"
                style={{ fontSize: "18px" }}
              />
            }
            className="w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm mb-4 hover:border-blue-400 focus:border-blue-500 focus:shadow-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <CustomTable
            rowSelection={{
              type: "checkbox",
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
            columns={modalColumns}
            dataSource={filteredDrugs}
            rowKey="id"
            pagination={{ pageSize: 10, size: "small" }}
            size="small"
            scroll={{ y: 300, x: "max-content" }}
          />
        </Modal>
      </Card>
    </>
  );
}
