"use client";

import React, { useState } from "react";
import {
  Button,
  message,
  Popconfirm,
  Space,
  Table,
  Input,
  Select,
  Tag,
  Card,
  Row,
  Col,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import CryptoJS from "crypto-js";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  EyeOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { VisitHomeType, MasterPatientType } from "../../common";
import { visitHomeServices } from "../services/visitHome.service";

// Import Component แก้ไขที่แยกออกไป
import VisitHomeEdit from "./visitHomeEdit";

const { Option } = Select;

const SECRET_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "MY_SUPER_SECRET_KEY_1234";

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

  // State สำหรับ Modal แก้ไข
  const [editingRecord, setEditingRecord] = useState<VisitHomeType | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

  // Search State
  const [searchText, setSearchText] = useState("");
  const [filterPatientType, setFilterPatientType] = useState<number | null>(
    null
  );
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  // ฟังก์ชันถอดรหัส (สำหรับแสดงในตาราง)
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

  // Filter Logic
  const filteredData = data.filter((item) => {
    const firstName = decryptData(item.firstName || "").toLowerCase();
    const lastName = decryptData(item.lastName || "").toLowerCase();
    // ถ้ามี field fullName ให้ใช้ decryptData(item.fullName) แทน
    const fullName = decryptData(item.fullName || "").toLowerCase();

    const address = decryptData(item.address || "").toLowerCase();
    const search = searchText.toLowerCase();

    const matchesSearch =
      firstName.includes(search) ||
      lastName.includes(search) ||
      fullName.includes(search) ||
      address.includes(search) ||
      item.symptoms?.toLowerCase().includes(search) ||
      (item.age !== undefined && item.age.toString().includes(search));

    const matchesPatientType = filterPatientType
      ? item.patientType?.id === filterPatientType
      : true;

    return matchesSearch && matchesPatientType;
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

  const getPatientTypeColor = (typeName: string) => {
    if (typeName.includes("ติดเตียง")) return "red";
    if (typeName.includes("ติดบ้าน")) return "orange";
    if (typeName.includes("NCD")) return "blue";
    if (typeName.includes("Palliative")) return "purple";
    return "default";
  };

  const openModal = (record: VisitHomeType, mode: "view" | "edit") => {
    setEditingRecord(record);
    setModalMode(mode); // set mode
    setModalVisible(true);
  };

  const columns: ColumnsType<VisitHomeType> = [
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
      // fixed: "left",
      render: (text: string) => (
        <div style={{ fontWeight: 500 }}>{decryptData(text)}</div>
      ),
    },
    {
      title: "ประเภทผู้ป่วย",
      dataIndex: "patientType",
      key: "patientType",
      width: 150,
      align: "center",
      render: (value: any) => (
        <Tag color={getPatientTypeColor(value?.typeName || "")}>
          {value?.typeName || "-"}
        </Tag>
      ),
    },
    {
      title: "อายุ",
      dataIndex: "age",
      key: "age",
      width: 80,
      align: "center",
      render: (val) => `${val} ปี`,
    },
    {
      title: "วันที่เยี่ยม",
      dataIndex: "visitDate",
      key: "visitDate",
      width: 120,
      align: "center",
      sorter: (a, b) => dayjs(a.visitDate).unix() - dayjs(b.visitDate).unix(),
      render: (value: string) =>
        value ? dayjs(value).format("DD-MM-YYYY") : "-",
    },
    {
      title: "ที่อยู่",
      dataIndex: "address",
      key: "address",
      width: 200,
      ellipsis: { showTitle: false },
      render: (address) => (
        <Tooltip placement="topLeft" title={decryptData(address)}>
          {decryptData(address)}
        </Tooltip>
      ),
    },
    {
      title: "อาการ",
      dataIndex: "symptoms",
      key: "symptoms",
      width: 200,
      ellipsis: true,
    },
    {
      title: "ยาที่ได้รับ",
      dataIndex: "medication",
      key: "medication",
      width: 150,
      ellipsis: true,
    },
    {
      title: "นัดถัดไป",
      dataIndex: "nextAppointment",
      key: "nextAppointment",
      width: 120,
      align: "center",
      render: (value: string) =>
        value ? (
          <Tag color="blue">{dayjs(value).format("DD-MM-YYYY")}</Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "จัดการ",
      key: "action",
      width: 150, // ขยายความกว้างนิดหน่อยเผื่อปุ่มที่ 3
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          {/* ปุ่มดูรายละเอียด (สีฟ้า/เขียว) */}
          <Tooltip title="ดูรายละเอียด">
            <FileSearchOutlined
              type="default"
              // icon={<EyeOutlined />}
              // size="small"
              style={{ color: "#1890ff", borderColor: "#1890ff" }}
              onClick={() => openModal(record, "view")} // เปิดแบบ view
            />
          </Tooltip>

          {/* ปุ่มแก้ไข (สีส้ม) */}
          <Tooltip title="แก้ไข">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              ghost
              style={{ color: "#faad14", borderColor: "#faad14" }}
              onClick={() => openModal(record, "edit")} // เปิดแบบ edit
            />
          </Tooltip>

          {/* ปุ่มลบ (สีแดง) */}
          <Popconfirm
            title="ยืนยันการลบ?"
            description="ข้อมูลนี้จะหายไปจากระบบ"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="primary"
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header Section */}
      <Card bordered={false} style={{ marginBottom: 20, borderRadius: 8 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
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
              <span style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
                ข้อมูลการเยี่ยมบ้าน
              </span>
            </div>
          </Col>

          {/* Filter Controls */}
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space wrap>
              <Select
                placeholder="กรองประเภทผู้ป่วย"
                style={{ width: 180 }}
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
                placeholder="ค้นหาชื่อ, ที่อยู่..."
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />

              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearchText("");
                  setFilterPatientType(null);
                  fetchData();
                }}
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, overflow: "hidden" }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
            position: ["bottomRight"],
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

      {/* เรียกใช้ Component แก้ไขที่นี่ */}
      {/* <VisitHomeEdit
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
      /> */}

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
        initialMode={modalMode} // ส่ง mode ไป
      />
    </div>
  );
}
