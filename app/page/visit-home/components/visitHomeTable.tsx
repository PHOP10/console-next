"use client";

import React, { useState } from "react";
import {
  Button,
  message,
  Popconfirm,
  Space,
  Input,
  Select,
  Tag,
  Card,
  Row,
  Col,
  Tooltip,
  DatePicker,
  ConfigProvider,
} from "antd";
import dayjs from "dayjs";
import CryptoJS from "crypto-js";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { VisitHomeType, MasterPatientType } from "../../common";
import { visitHomeServices } from "../services/visitHome.service";
import VisitHomeEdit from "./visitHomeEdit";
import CustomTable from "../../common/CustomTable";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import thTH from "antd/es/locale/th_TH";

dayjs.extend(buddhistEra);
dayjs.locale("th");

const { Option } = Select;
const { RangePicker } = DatePicker;

const SECRET_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "MY_SUPER_SECRET_KEY_1234";

// สร้าง Config ภาษาไทยฉบับแก้ไขปี พ.ศ.
const thaiYearLocale: any = {
  ...thTH,
  DatePicker: {
    ...thTH.DatePicker,
    lang: {
      ...thTH.DatePicker?.lang,
      yearFormat: "BBBB",
      cellYearFormat: "BBBB",
    },
  },
};

interface VisitHomeTableProps {
  data: VisitHomeType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  masterPatients: MasterPatientType[];
  fetchData: () => Promise<void>;
}

export default function VisitHomeTable({
  data,
  loading,
  setLoading,
  masterPatients,
  fetchData,
}: VisitHomeTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = visitHomeServices(intraAuth);
  const [editingRecord, setEditingRecord] = useState<VisitHomeType | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterPatientType, setFilterPatientType] = useState<number | null>(
    null,
  );
  const [filterDate, setFilterDate] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  const decryptData = (ciphertext: string) => {
    if (!ciphertext) return "-";
    if (!ciphertext.toString().startsWith("U2F")) return ciphertext;
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText || ciphertext;
    } catch (e) {
      return ciphertext;
    }
  };

  // Filter Logic (Logic เดิม ไม่มีการแก้ไข)
  const filteredData = data.filter((item) => {
    const firstName = decryptData(item.firstName || "").toLowerCase();
    const lastName = decryptData(item.lastName || "").toLowerCase();
    const fullName = decryptData(item.fullName || "").toLowerCase();
    const address = decryptData(item.address || "").toLowerCase();
    const symptoms = decryptData(item.symptoms || "").toLowerCase();

    const search = searchText.toLowerCase();

    const matchesSearch =
      firstName.includes(search) ||
      lastName.includes(search) ||
      fullName.includes(search) ||
      address.includes(search) ||
      symptoms.includes(search) ||
      (item.age !== undefined && item.age.toString().includes(search));

    const matchesPatientType = filterPatientType
      ? item.patientType?.id === filterPatientType
      : true;

    let matchesDate = true;
    if (filterDate && filterDate[0] && filterDate[1] && item.visitDate) {
      const visitDateStr = dayjs(item.visitDate).format("YYYY-MM-DD");
      const startDateStr = filterDate[0].format("YYYY-MM-DD");
      const endDateStr = filterDate[1].format("YYYY-MM-DD");

      matchesDate = visitDateStr >= startDateStr && visitDateStr <= endDateStr;
    }

    return matchesSearch && matchesPatientType && matchesDate;
  });

  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteVisitHome(id);
      message.success("ลบข้อมูลสำเร็จ");
      fetchData();
    } catch (err) {
      message.error("ไม่สามารถลบข้อมูลได้");
    }
  };

  const openModal = (record: VisitHomeType, mode: "view" | "edit") => {
    setEditingRecord(record);
    setModalMode(mode);
    setModalVisible(true);
  };

  const columns: ColumnsType<VisitHomeType> = [
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
      render: (text: string) => (
        <div
          style={{ fontWeight: 500 }}
          className="truncate max-w-[150px] sm:max-w-none"
        >
          {decryptData(text)}
        </div>
      ),
    },
    {
      title: "ประเภท", // ย่อชื่อ Header
      dataIndex: "patientType",
      key: "patientType",
      width: 120,
      align: "center",
      responsive: ["md"], // ซ่อนบนมือถือ (แสดงตั้งแต่ md ขึ้นไป)
      render: (value: any) => <Tag color="cyan">{value?.typeName || "-"}</Tag>,
    },
    {
      title: "อายุ",
      dataIndex: "age",
      key: "age",
      width: 70,
      align: "center",
      responsive: ["sm"], // ซ่อนบนมือถือเล็กมาก
      render: (val) => `${val} ปี`,
    },
    {
      title: "วันที่เยี่ยม",
      dataIndex: "visitDate",
      key: "visitDate",
      width: 120,
      align: "center",
      render: (value: string) => {
        if (!value) return "-";
        const dateObj = dayjs(value);
        return (
          <>
            {/* แสดงบนมือถือ: แบบย่อ D/M/YY */}
            <span className="md:hidden font-normal">
              {dateObj.format("D/M/BB")}
            </span>
            {/* แสดงบนจอใหญ่: เต็มรูปแบบ */}
            <span className="hidden md:block font-normal">
              {dateObj.format("D MMM BBBB")}
            </span>
          </>
        );
      },
    },
    {
      title: "ที่อยู่",
      dataIndex: "address",
      key: "address",
      width: 200,
      ellipsis: { showTitle: false },
      responsive: ["lg"],
      render: (text) => decryptData(text),
    },
    {
      title: "อาการ",
      dataIndex: "symptoms",
      key: "symptoms",
      width: 150,
      ellipsis: true,
      responsive: ["md"], // ซ่อนบนมือถือ
      render: (text) => decryptData(text),
    },
    {
      title: "ยาที่ได้รับ",
      dataIndex: "medication",
      key: "medication",
      width: 150,
      ellipsis: true,
      responsive: ["xl"], // แสดงเฉพาะจอใหญ่มาก
      render: (text) => decryptData(text),
    },
    {
      title: "นัดถัดไป",
      dataIndex: "nextAppointment",
      key: "nextAppointment",
      width: 120,
      align: "center",
      responsive: ["sm"], // ซ่อนบนมือถือเล็ก
      render: (text: string) => {
        if (!text) return "-";
        const date = dayjs(text);
        // ใช้หลักการเดียวกับวันที่เยี่ยม
        return (
          <>
            <span className="md:hidden font-normal">
              {date.format("D/M/BB")}
            </span>
            <span className="hidden md:block font-normal">
              {date.format("D MMM BBBB")}
            </span>
          </>
        );
      },
    },
    {
      title: "จัดการ",
      key: "action",
      width: 120,
      align: "center",

      render: (_, record) => (
        <Space size="small">
          <Tooltip title="ดูรายละเอียด">
            <FileSearchOutlined
              style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }}
              onClick={() => openModal(record, "view")}
            />
          </Tooltip>

          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 18,
                color: "#faad14",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onClick={() => openModal(record, "edit")}
            />
          </Tooltip>

          <Popconfirm
            title="ยืนยันการลบ?"
            description="ยืนยันการลบข้อมูลรายการนี้หรือไม่?"
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
    <div style={{ padding: "10px", minHeight: "100vh", marginTop: "-10px" }}>
      {/* Header Section */}
      <Card bordered={false} style={{ marginBottom: 20, borderRadius: 8 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  backgroundColor: "#e6f7ff",
                  padding: 8,
                  borderRadius: "50%",
                  color: "#1890ff",
                }}
              >
                <UserOutlined style={{ fontSize: 20 }} />
              </div>
              <span
                style={{ fontSize: 20, fontWeight: "bold", color: "#0683e9" }}
              >
                ข้อมูลการเยี่ยมบ้าน
              </span>
            </div>
          </Col>

          {/* ปรับส่วน Filter ให้ Responsive */}
          <Col xs={24} md={16} style={{ textAlign: "right" }}>
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <ConfigProvider locale={thaiYearLocale}>
                <RangePicker
                  format="D/MMM/BBBB"
                  placeholder={["วันที่เริ่ม", "วันที่สิ้นสุด"]}
                  value={filterDate}
                  onChange={(dates) => setFilterDate(dates)}
                  style={{ width: "100%" }} // เต็มจอบนมือถือ
                  className="sm:w-[260px]" // จอใหญ่ Fix width
                />
              </ConfigProvider>

              <Select
                placeholder="กรองประเภทผู้ป่วย"
                style={{ width: "100%" }}
                className="sm:w-[180px]"
                allowClear
                onChange={(val) => setFilterPatientType(val)}
                value={filterPatientType}
              >
                {masterPatients.map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.typeName}
                  </Option>
                ))}
              </Select>

              <Input
                placeholder="ค้นหา..."
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "100%" }}
                className="sm:w-[200px]"
                allowClear
              />

              <Button
                type="primary"
                onClick={() => {
                  setSearchText("");
                  setFilterPatientType(null);
                  setFilterDate(null);
                  fetchData();
                }}
                className="w-full sm:w-auto"
              >
                ล้างตัวกรอง
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, overflow: "hidden" }}
        bodyStyle={{ padding: 0 }}
      >
        <CustomTable
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showTotal: (total) => `รวม ${total} รายการ`,
            position: ["bottomRight"],
            size: "small",
          }}
          scroll={{ x: "max-content" }}
          bordered
          size="middle"
        />
      </Card>

      <VisitHomeEdit
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRecord(null);
        }}
        onSuccess={() => {
          setModalVisible(false);
          setEditingRecord(null);
          setLoading(true);
          fetchData();
        }}
        record={editingRecord}
        masterPatients={masterPatients}
        initialMode={modalMode}
      />
    </div>
  );
}
