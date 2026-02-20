"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Space,
  Popconfirm,
  message,
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  AutoComplete,
  Row,
  Col,
  Tooltip,
  Popover, // ✅ 1. Import Popover
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  AlertOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType, MasterDrugType } from "../../common";
import CustomTable from "../../common/CustomTable";
import { packingOptions } from "../../../common/index";
import dayjs from "dayjs";
import "dayjs/locale/th";

interface DrugTableProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: DrugType[];
  setData: React.Dispatch<React.SetStateAction<DrugType[]>>;
  masterDrugs: MasterDrugType[];
}

export default function DrugTable({
  setLoading,
  loading,
  data,
  setData,
  masterDrugs,
}: DrugTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DrugType | null>(null);
  const [form] = Form.useForm();
  // const [masterDrugs, setMasterDrugs] = useState<MasterDrugType[]>([]);
  const [searchText, setSearchText] = useState("");
  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  // useEffect(() => {
  //   const fetchMasterDrugs = async () => {
  //     try {
  //       const res: MasterDrugType[] =
  //         await intraAuthService.getMasterDrugQuery();
  //       if (Array.isArray(res)) {
  //         setMasterDrugs(res);
  //       }
  //     } catch (error) {
  //       console.error("Failed to load master drugs", error);
  //     }
  //   };
  //   fetchMasterDrugs();
  // }, []);

  const filteredData = data.filter((item) => {
    const searchLower = searchText.toLowerCase();
    return (
      item.workingCode?.toLowerCase().includes(searchLower) ||
      item.name?.toLowerCase().includes(searchLower)
    );
  });

  // ✅ 2. Logic คำนวณยาใกล้หมดอายุ เพื่อแสดงในกล่องแจ้งเตือนด้านบน
  const today = dayjs();
  const redDrugs: any[] = [];
  const orangeDrugs: any[] = [];

  data.forEach((drug) => {
    if (drug.expiryDate) {
      const expiry = dayjs(drug.expiryDate);
      const diffMonths = expiry.diff(today, "month", true);
      if (diffMonths <= 3) {
        redDrugs.push({ ...drug, diffMonths });
      } else if (diffMonths <= 6) {
        orangeDrugs.push({ ...drug, diffMonths });
      }
    }
  });

  const totalExpiring = redDrugs.length + orangeDrugs.length;

  // ✅ 3. สร้าง UI กล่องข้อความที่จะเด้งขึ้นมาตอนเอาเมาส์ชี้
  const expiringPopoverContent = (
    <div className="max-h-[300px] overflow-y-auto pr-2 w-[280px]">
      {redDrugs.length > 0 && (
        <div className="mb-3">
          <div className="text-red-500 font-bold border-b border-red-100 pb-1 mb-2 flex items-center">
            <AlertOutlined className="mr-1" /> หมดอายุ หรือ &lt; 3 เดือน
          </div>
          {redDrugs.map((d) => (
            <div key={d.id} className="text-sm flex justify-between mb-1">
              <span className="truncate pr-2 font-medium text-slate-700">
                {d.name}
              </span>
              <span className="text-red-500 text-xs shrink-0">
                {dayjs(d.expiryDate).locale("th").format("DD MMM BB")}
              </span>
            </div>
          ))}
        </div>
      )}
      {orangeDrugs.length > 0 && (
        <div>
          <div className="text-orange-500 font-bold border-b border-orange-100 pb-1 mb-2 flex items-center">
            <AlertOutlined className="mr-1" /> &lt; 6 เดือน
          </div>
          {orangeDrugs.map((d) => (
            <div key={d.id} className="text-sm flex justify-between mb-1">
              <span className="truncate pr-2 font-medium text-slate-700">
                {d.name}
              </span>
              <span className="text-orange-500 text-xs shrink-0">
                {dayjs(d.expiryDate).locale("th").format("DD MMM BB")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await intraAuthService.deleteDrugItem(id);
      message.success("ลบข้อมูลสำเร็จ");
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Delete Error:", error);
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || "";
      if (
        status === 400 ||
        status === 409 ||
        errorMessage.includes("foreign key") ||
        errorMessage.includes("constraint")
      ) {
        Modal.warning({
          title: "ไม่สามารถลบข้อมูลได้",
          content: (
            <div>
              <p>
                รายการยานี้มีการใช้งานอยู่ในระบบ (เช่น มีประวัติการเบิก/จ่าย
                หรือรับเข้า)
              </p>
              <p className="text-gray-500 text-xs mt-2">
                เพื่อความถูกต้องของข้อมูลสต็อก ไม่สามารถลบได้
              </p>
            </div>
          ),
          okText: "เข้าใจแล้ว",
        });
      } else {
        message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record: DrugType) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!editingRecord) return;
    try {
      setLoading(true);
      const payload = {
        ...editingRecord,
        ...values,
        id: editingRecord.id,
        // ✅ บังคับแปลง price ให้เป็นตัวเลข (Number) เสมอก่อนส่งไป Backend
        price: Number(values.price),
        // แปลงรหัสประเภทยาให้เป็นตัวเลขด้วย กันเหนียว
        drugTypeId: Number(values.drugTypeId),
      };

      const updatedData = await intraAuthService.updateDrug(payload);
      message.success("แก้ไขข้อมูลยาสำเร็จ");

      setData((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? updatedData : item)),
      );

      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (error: any) {
      console.error("Update error:", error);
      // ✅ เพิ่มการแสดง Error Message จาก Backend (ถ้ามี) จะได้รู้ว่าพังเพราะอะไร
      const backendMessage = error?.response?.data?.message;
      const msgToShow = Array.isArray(backendMessage)
        ? backendMessage.join(", ")
        : backendMessage || "แก้ไขข้อมูลไม่สำเร็จ";
      message.error(msgToShow);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<DrugType> = [
    {
      title: "รหัสยา",
      dataIndex: "workingCode",
      key: "workingCode",
      align: "center",
      width: 100,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "ชื่อยา",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: 200,
    },
    {
      title: "ประเภทยา",
      dataIndex: "drugTypeId",
      key: "drugTypeId",
      align: "center",
      width: 150,
      responsive: ["md"],
      render: (id) => {
        const match = masterDrugs.find(
          (m) => m.drugTypeId === id || m.id === id,
        );
        return match ? (
          <Tag color="blue">{match.drugType}</Tag>
        ) : (
          <span style={{ color: "gray" }}>{id}</span>
        );
      },
    },
    {
      title: "ขนาดบรรจุ",
      dataIndex: "packagingSize",
      key: "packagingSize",
      align: "center",
      width: 100,
      responsive: ["sm"],
    },
    {
      title: "ราคา/หน่วย",
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 100,
      responsive: ["sm"],
      render: (value) =>
        Number(value).toLocaleString("th-TH", {
          style: "currency",
          currency: "THB",
        }),
    },
    {
      title: "คงเหลือ",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 80,
      render: (value) => (
        <span
          style={{
            color: value <= 10 ? "red" : "inherit",
            fontWeight: value <= 10 ? "bold" : "normal",
          }}
        >
          {Number(value).toLocaleString()}
        </span>
      ),
    },
    {
      title: "วันหมดอายุ (ใกล้สุด)",
      dataIndex: "expiryDate",
      key: "expiryDate",
      align: "center",
      width: 140,
      render: (date) => {
        if (!date) return <span className="text-gray-400">-</span>;

        const expiry = dayjs(date);
        const today = dayjs();
        const diffMonths = expiry.diff(today, "month", true);

        if (diffMonths <= 0) {
          return <Tag color="error">หมดอายุแล้ว</Tag>;
        } else if (diffMonths <= 3) {
          return (
            <div className="flex flex-col items-center">
              <span className="text-red-500 font-bold">
                {expiry.locale("th").format("DD MMM BB")}
              </span>
              <Tag
                color="red"
                bordered={false}
                className="mt-1 text-[10px] leading-tight"
              >
                <AlertOutlined /> &lt; 3 เดือน
              </Tag>
            </div>
          );
        } else if (diffMonths <= 6) {
          return (
            <div className="flex flex-col items-center">
              <span className="text-orange-500 font-semibold">
                {expiry.locale("th").format("DD MMM BB")}
              </span>
              <Tag
                color="warning"
                bordered={false}
                className="mt-1 text-[10px] leading-tight"
              >
                <AlertOutlined /> &lt; 6 เดือน
              </Tag>
            </div>
          );
        } else {
          return (
            <span className="text-green-600">
              {expiry.locale("th").format("DD MMM BB")}
            </span>
          );
        }
      },
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 18,
                color: "#faad14",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onClick={() => handleEditClick(record)}
            />
          </Tooltip>

          <Popconfirm
            title="ยืนยันการลบข้อมูลยา"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="ลบ">
              <DeleteOutlined
                style={{
                  fontSize: 18,
                  color: "#ff4d4f",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-[#0683e9] text-center mb-2 tracking-tight">
          รายการยาในคลัง
        </h2>
        <hr className="border-slate-100/30 -mx-6 md:-mx-6" />
      </div>

      <Card bordered={false} className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          {/* ซ้าย: กล่องแจ้งเตือนยาหมดอายุ */}
          <div>
            {totalExpiring > 0 ? (
              <Popover
                content={expiringPopoverContent}
                title={
                  <div className="font-bold text-slate-700 border-b pb-2 mb-2">
                    สรุปยาใกล้หมดอายุ
                  </div>
                }
                placement="bottomLeft"
                trigger="hover"
              >
                <Button
                  danger
                  type="dashed"
                  className="h-10 rounded-xl bg-red-50 hover:bg-red-100 border-red-200 shadow-sm"
                >
                  <AlertOutlined className="text-red-500 animate-pulse" />
                  <span className="text-red-600 font-bold">
                    พบยาใกล้หมดอายุ ({totalExpiring} รายการ)
                  </span>
                </Button>
              </Popover>
            ) : (
              <div className="text-green-600 font-medium flex items-center h-10 px-3 bg-green-50 rounded-xl border border-green-100">
                <AlertOutlined className="mr-2" /> สต็อกปกติ
                (ไม่มียาใกล้หมดอายุ)
              </div>
            )}
          </div>

          {/* ขวา: ช่องค้นหา */}
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="ค้นหาชื่อยา หรือ รหัสยา..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full sm:w-72 h-10 rounded-xl shadow-sm hover:border-blue-400 focus:border-blue-500"
            allowClear
          />
        </div>

        <CustomTable
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          bordered
          size="small"
          scroll={{ x: "max-content", y: 600 }}
          pagination={{
            pageSizeOptions: ["10", "20", "50", "100"],
            showSizeChanger: true,
            defaultPageSize: 20,

            showTotal: (total, range) => (
              <span className="text-gray-500 text-xs sm:text-sm font-light">
                แสดง {range[0]}-{range[1]} จากทั้งหมด{" "}
                <span className="font-bold text-blue-600">{total}</span> รายการ
              </span>
            ),

            locale: { items_per_page: "/ หน้า" },
            position: ["bottomRight"],
          }}
        />
      </Card>

      <Modal
        title={
          <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
            แก้ไขข้อมูลยา
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnClose
        centered
        width={700}
        style={{ maxWidth: "95%", top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Working Code (รหัสยา)"
                name="workingCode"
                rules={[{ required: true, message: "กรุณาระบุรหัสยา" }]}
              >
                <Input placeholder="เช่น W-001" maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="ประเภทยา"
                name="drugTypeId"
                rules={[{ required: true, message: "กรุณาเลือกประเภทยา" }]}
              >
                <Select
                  placeholder="เลือกประเภทยา"
                  options={masterDrugs.map((d) => ({
                    label: d.drugType,
                    value: d.drugTypeId,
                  }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="ชื่อยา"
            name="name"
            rules={[{ required: true, message: "กรุณาระบุชื่อยา" }]}
          >
            <Input placeholder="ระบุชื่อยา" />
          </Form.Item>

          <Row gutter={[12, 12]}>
            <Col span={8}>
              <Form.Item
                label="ขนาดบรรจุ"
                name="packagingSize"
                rules={[{ required: true, message: "ระบุขนาด" }]}
              >
                <AutoComplete
                  options={packingOptions}
                  placeholder="หน่วย"
                  filterOption={(inputValue, option) =>
                    option!.value
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="ราคา/หน่วย"
                name="price"
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="จำนวนยาคงเหลือ" name="quantity">
                <InputNumber
                  placeholder="0"
                  style={{ width: "100%" }}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea
              rows={2}
              placeholder="ระบุข้อมูลเพิ่มเติม (ถ้ามี)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
