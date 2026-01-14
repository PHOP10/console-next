"use client";

import React, { useState, useMemo } from "react";
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
  Tag,
  Space,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType } from "../../common";

interface MaDrugFormProps {
  drugs: DrugType[];
  refreshData: () => void;
}

interface DrugItemRow {
  key: string;
  drugId: number;
  drugName: string; // เก็บชื่อไว้โชว์
  packagingSize: string;
  quantity: number;
  note: string;
  price: number;
}

export default function MaDrugForm({ drugs, refreshData }: MaDrugFormProps) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DrugItemRow[]>([]);

  // --- States สำหรับ Modal เลือกยา ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); // เก็บ ID ที่ติ๊กใน Modal
  const [searchText, setSearchText] = useState(""); // คำค้นหาใน Modal

  // --- Logic การจัดการ Form ---
  const onFinish = async (values: any) => {
    if (dataSource.length === 0) {
      message.error("กรุณาเลือกรายการยาอย่างน้อย 1 รายการ");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        requestNumber: values.requestNumber,
        requestUnit: values.requestUnit,
        roundNumber: values.roundNumber,
        requesterName: values.requesterName,
        dispenserName: values.dispenserName,
        requestDate: values.requestDate.toISOString(),
        note: values.note,
        status: "pending",
        // ✅ แก้ไขตรงนี้: เพิ่ม { create: ... } ครอบ Array ไว้
        maDrugItems: {
          create: dataSource.map((item) => ({
            drugId: item.drugId, // ตรวจสอบให้แน่ใจว่า drugId เป็น Int (ไม่ใช่ null)
            quantity: item.quantity,
            // note: item.note,
          })),
        },
      };

      await intraAuthService.createMaDrug(payload);
      message.success("บันทึกการเบิกยาสำเร็จ");

      // Reset Form
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

  // --- Logic สำหรับ Modal (เลือกยาแบบ Hybrid) ---

  // กรองรายการยาตามคำค้นหา
  const filteredDrugs = useMemo(() => {
    return drugs.filter(
      (d) =>
        d.name.toLowerCase().includes(searchText.toLowerCase()) ||
        d.workingCode.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [drugs, searchText]);

  // เมื่อกดตกลงใน Modal
  const handleModalOk = () => {
    const newItems: DrugItemRow[] = [];

    selectedRowKeys.forEach((key) => {
      // เช็คก่อนว่ายานี้มีในตารางหลักหรือยัง? ถ้ามีแล้วจะไม่เพิ่มซ้ำ
      const isExist = dataSource.find((item) => item.drugId === Number(key));
      if (!isExist) {
        const drug = drugs.find((d) => d.id === Number(key));
        if (drug) {
          newItems.push({
            key: `${drug.id}_${Date.now()}`, // Unique Key
            drugId: drug.id,
            drugName: drug.name,
            packagingSize: drug.packagingSize,
            price: drug.price,
            quantity: 1, // ค่าเริ่มต้น
            note: "",
          });
        }
      }
    });

    if (newItems.length > 0) {
      setDataSource([...dataSource, ...newItems]);
      message.success(`เพิ่มยา ${newItems.length} รายการลงในแบบฟอร์มแล้ว`);
    } else if (selectedRowKeys.length > 0) {
      message.info("รายการที่เลือกมีอยู่ในแบบฟอร์มแล้ว");
    }

    setIsModalOpen(false);
    setSelectedRowKeys([]); // เคลียร์การเลือก
    setSearchText(""); // เคลียร์คำค้น
  };

  // Columns ของตารางหลัก (The Basket)
  const mainColumns = [
    {
      title: "รายการยา",
      dataIndex: "drugName",
      key: "drugName",
      render: (text: string, record: DrugItemRow) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ fontSize: "0.8em", color: "gray" }}>
            ขนาด: {record.packagingSize}
          </div>
        </div>
      ),
    },
    {
      title: "จำนวนเบิก",
      dataIndex: "quantity",
      key: "quantity",
      width: 150,
      render: (value: number, record: DrugItemRow) => (
        <InputNumber
          min={1}
          value={value}
          style={{ width: "100%" }}
          onChange={(val) => {
            const newData = [...dataSource];
            const index = newData.findIndex((item) => item.key === record.key);
            newData[index].quantity = val || 1;
            setDataSource(newData);
          }}
        />
      ),
    },
    // {
    //   title: "หมายเหตุ",
    //   dataIndex: "note",
    //   key: "note",
    //   render: (value: string, record: DrugItemRow) => (
    //     <Input
    //       value={value}
    //       placeholder="ระบุเหตุผล (ถ้ามี)"
    //       onChange={(e) => {
    //         const newData = [...dataSource];
    //         const index = newData.findIndex((item) => item.key === record.key);
    //         newData[index].note = e.target.value;
    //         setDataSource(newData);
    //       }}
    //     />
    //   ),
    // },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_: any, record: DrugItemRow) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            setDataSource(dataSource.filter((item) => item.key !== record.key));
          }}
        />
      ),
    },
  ];

  // Columns ของตารางใน Modal (Master List)
  const modalColumns = [
    { title: "รหัสยา", dataIndex: "workingCode", width: 100 },
    {
      title: "ชื่อยา",
      dataIndex: "name",
      render: (text: string, record: DrugType) => (
        <span>
          {text} <Tag color="blue">{record.packagingSize}</Tag>
        </span>
      ),
    },
    {
      title: "คงเหลือ",
      dataIndex: "quantity",
      width: 100,
      render: (val: number) => (
        <span style={{ color: val === 0 ? "red" : "green" }}>{val}</span>
      ),
    },
  ];

  return (
    <Card
      title={
        <div
          style={{
            fontSize: "20px",
            textAlign: "center",
            fontWeight: "bold",
            color: "#0683e9",
          }}
        >
          📝 ใบเบิกจ่ายเวชภัณฑ์ (Hybrid Form)
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ roundNumber: 1, requestDate: null }}
      >
        {/* ส่วน Header จัดเป็น 2 คอลัมน์ให้สวยงาม */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="เลขที่เบิก"
              name="requestNumber"
              rules={[{ required: true }]}
            >
              <Input placeholder="เช่น REQ-2023-001" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="วันที่ขอเบิก"
              name="requestDate"
              rules={[{ required: true }]}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="หน่วยงานที่เบิก"
              name="requestUnit"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="เบิกครั้งที่"
              name="roundNumber"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ผู้ขอเบิก"
              name="requesterName"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="ผู้จัดยา"
              name="dispenserName"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="หมายเหตุรวม" name="note">
          <Input.TextArea rows={2} />
        </Form.Item>

        {/* --- ส่วนตารางรายการยา (The Basket) --- */}
        <div
          style={{
            background: "#f5f5f5",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>
              รายการยาที่ต้องการเบิก ({dataSource.length})
            </span>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{ borderColor: "#1890ff", color: "#1890ff" }}
            >
              + เลือกรายการยาจากคลัง
            </Button>
          </div>

          <Table
            dataSource={dataSource}
            columns={mainColumns}
            pagination={{
              pageSize: 10, // แสดงหน้าละ 10 รายการ
              showSizeChanger: true, // ให้ user เลือกเปลี่ยนจำนวนต่อหน้าได้เอง
              pageSizeOptions: ["10", "20", "50"], // ตัวเลือกจำนวนต่อหน้า
            }}
            rowKey="key"
            locale={{
              emptyText: "ยังไม่มีรายการยา กดปุ่ม '+ เลือกรายการยา' เพื่อเพิ่ม",
            }}
            summary={(pageData) => {
              if (pageData.length > 0) {
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                      <span style={{ color: "gray" }}>
                        รวมทั้งสิ้น {pageData.length} รายการ
                      </span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }
              return undefined;
            }}
          />
        </div>

        <Form.Item style={{ textAlign: "center", marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{ width: "200px" }}
          >
            บันทึกการเบิกจ่าย
          </Button>
        </Form.Item>
      </Form>

      {/* --- Modal เลือกยา (The Master List) --- */}
      <Modal
        title="คลังรายการยา (Master List)"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        okText={`เพิ่มรายการที่เลือก (${selectedRowKeys.length})`}
        cancelText="ยกเลิก"
      >
        <Input
          placeholder="ค้นหาชื่อยา หรือ รหัสยา..."
          prefix={<SearchOutlined />}
          style={{ marginBottom: 16 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <Table
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          columns={modalColumns}
          dataSource={filteredDrugs}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          size="small"
          scroll={{ y: 300 }} // Fix ความสูงตาราง ถ้ามี 100 รายการจะได้เลื่อนดูได้
        />
      </Modal>
    </Card>
  );
}
