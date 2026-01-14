"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Popconfirm,
  Space,
  Table,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Card,
  Row,
  Col,
  Select,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
import { DurableArticleType } from "../../common";
import DurableArticleDetail from "./durableArticleDetail";
import DurableArticleExport from "./durableArticleExportId";
import DurableArticleExportWord from "./durableArticleExportWordId";
import { exportDurableArticles } from "./exportDurableArticles";
import { useSession } from "next-auth/react";
// import DurableArticleExportPdf from "./durableArticleExportPdfID";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: DurableArticleType[];
};

export default function SupportingResourceTable({
  setLoading,
  loading,
  data,
}: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<DurableArticleType | null>(null);
  const [form] = Form.useForm();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const { data: session } = useSession();

  const handleEdit = (record: DurableArticleType) => {
    setEditRecord(record);
    form.setFieldsValue({
      ...record,
      acquiredDate: dayjs(record.acquiredDate),
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await intraAuthService.updateDurableArticle({
        id: editRecord?.id,
        ...values,
        acquiredDate: values.acquiredDate.toISOString(),
      });
      message.success("แก้ไขข้อมูลสำเร็จ");
      setEditModalOpen(false);
      setLoading(true);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการแก้ไข:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  };

  const handleShowDetail = (record: any) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
  };

  const filteredData = useMemo(() => {
    if (!searchText) return data;

    const searchLower = searchText.toLowerCase();

    return data.filter((item) =>
      [
        "acquiredDate",
        "code",
        "status",
        "acquisitionType",
        "description",
        "createdBy",
        "note",
        "id",
        "type",
        "attributes",
        "category",
        "documentId",
        "responsibleAgency",
      ].some((key) => {
        const value = item[key as keyof DurableArticleType];
        return value?.toString().toLowerCase().includes(searchLower);
      })
    );
  }, [data, searchText]);

  const columns: ColumnsType<DurableArticleType> = [
    {
      title: "เลขที่หรือรหัส",
      dataIndex: "code",
      key: "code",
      align: "center",
    },
    {
      title: "วัน เดือน ปี",
      dataIndex: "acquiredDate",
      key: "acquiredDate",
      align: "center",
      render: (text: string) => {
        const date = new Date(text);
        return new Intl.DateTimeFormat("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date);
      },
    },

    {
      title: "เลขที่เอกสาร",
      dataIndex: "documentId",
      key: "documentId",
      align: "center",
    },
    {
      title: "ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ",
      dataIndex: "description",
      key: "description",
      render: (text: string) => {
        const maxLength = 25;
        if (!text) return "-";
        return text.length > maxLength ? (
          <Tooltip placement="topLeft" title={text}>
            {text.slice(0, maxLength) + "..."}
          </Tooltip>
        ) : (
          text
        );
      },
    },
    {
      title: "วิธีการได้มา",
      dataIndex: "acquisitionType",
      key: "acquisitionType",
      render: (text: string) => {
        const maxLength = 25;
        if (!text) return "-";
        return text.length > maxLength ? (
          <Tooltip placement="topLeft" title={text}>
            {text.slice(0, maxLength) + "..."}
          </Tooltip>
        ) : (
          text
        );
      },
    },
    {
      title: "ราคาต่อหน่วย",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "center",
      render: (value) =>
        value.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    },
    {
      title: "มูลค่าสุทธิ",
      dataIndex: "netValue",
      key: "netValue",
      align: "center",
      render: (value) =>
        value.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    },
    {
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (text: string) => {
        const maxLength = 25;
        if (!text) return "-";
        return text.length > maxLength ? (
          <Tooltip placement="topLeft" title={text}>
            {text.slice(0, maxLength) + "..."}
          </Tooltip>
        ) : (
          text
        );
      },
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          {(session?.user?.role === "asset" ||
            session?.user?.role === "admin") && (
            <>
              <Popconfirm
                title="ยืนยันการลบ"
                description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
                onConfirm={async () => {
                  try {
                    await intraAuthService.deleteDurableArticle(record.id);
                    message.success("ลบข้อมูลสำเร็จ");
                    setLoading(true);
                  } catch (error) {
                    console.error("เกิดข้อผิดพลาดในการลบ:", error);
                    message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
                  }
                }}
                okText="ใช่"
                cancelText="ยกเลิก"
              >
                <Button danger size="small">
                  ลบ
                </Button>
              </Popconfirm>

              <Button
                size="small"
                type="primary"
                onClick={() => handleEdit(record)}
                style={{ backgroundColor: "#faad14", marginLeft: 8 }}
              >
                แก้ไข
              </Button>
            </>
          )}
          <Button
            size="small"
            type="primary"
            onClick={() => handleShowDetail(record)}
          >
            รายละเอียด
          </Button>
          {/* <DurableArticleExport record={record} /> */}
          <DurableArticleExportWord record={record} /> {/* Word */}
          {/* <DurableArticleExportPdf record={record} /> PDF */}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div
          style={{
            fontSize: "20px",
            textAlign: "center",
            fontWeight: "bold",
            color: "#0683e9",
          }}
        >
          ข้อมูลครุภัณฑ์
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Input.Search
            placeholder="ค้นหาวัสดุ..."
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />

          <Button type="primary" onClick={() => exportDurableArticles(data)}>
            Export Excel
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          bordered
          scroll={{ x: "max-content" }}
        />

        <Modal
          title="แก้ไขข้อมูลครุภัณฑ์"
          open={editModalOpen}
          onCancel={() => setEditModalOpen(false)}
          onOk={handleUpdate}
          okText="บันทึก"
          cancelText="ยกเลิก"
          width={900} // ✅ ทำให้ modal กว้างขึ้น
        >
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="code"
                  label="เลขที่หรือรหัส"
                  rules={[
                    { required: true, message: "กรุณากรอกเลขที่หรือรหัส" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="registrationNumber" label="หมายเลขหรือทะเบียน">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="acquiredDate"
                  label="วันที่ได้มา"
                  rules={[{ required: true, message: "กรุณาเลือกวันที่ได้มา" }]}
                >
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="unitPrice"
                  label="ราคาต่อหน่วย"
                  rules={[{ required: true, message: "กรุณากรอกราคาต่อหน่วย" }]}
                >
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอยี่ห้อ ชนิด แบบ ขนาดและลักษณะ",
                },
              ]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="acquisitionType"
                  label="วิธีการได้มา"
                  rules={[{ required: true, message: "กรุณากรอกวิธีที่ได้มา" }]}
                >
                  <Select placeholder="เลือกวิธีการได้มา">
                    <Select.Option value="งบประมาณ">งบประมาณ</Select.Option>
                    <Select.Option value="เงินบำรุง">เงินบำรุง</Select.Option>
                    <Select.Option value="เงินงบประมาณ ตกลงราคา">
                      เงินงบประมาณ ตกลงราคา
                    </Select.Option>
                    <Select.Option value="บริจาค">บริจาค</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="category"
                  label="ประเภท"
                  rules={[{ required: true, message: "กรุณาเลือกประเภท" }]}
                >
                  <Select
                    placeholder="เลือกประเภท"
                    options={[
                      {
                        label: "ครุภัณฑ์งานบ้านงานครัว",
                        value: "ครุภัณฑ์งานบ้านงานครัว",
                      },
                      {
                        label: "ครุภัณฑ์วิทยาศาสตร์การแพทย์",
                        value: "ครุภัณฑ์วิทยาศาสตร์การแพทย์",
                      },
                      { label: "ครุภัณฑ์สำนักงาน", value: "ครุภัณฑ์สำนักงาน" },
                      {
                        label: "ครุภัณฑ์ยานพาหนะและขนส่ง",
                        value: "ครุภัณฑ์ยานพาหนะและขนส่ง",
                      },
                      {
                        label: "ครุภัณฑ์ไฟฟ้าและวิทยุ",
                        value: "ครุภัณฑ์ไฟฟ้าและวิทยุ",
                      },
                      {
                        label: "ครุภัณฑ์โฆษณาและเผยแพร่",
                        value: "ครุภัณฑ์โฆษณาและเผยแพร่",
                      },
                      {
                        label: "ครุภัณฑ์คอมพิวเตอร์",
                        value: "ครุภัณฑ์คอมพิวเตอร์",
                      },
                      { label: "ครุภัณฑ์การแพทย์", value: "ครุภัณฑ์การแพทย์" },
                      { label: "ครุภัณฑ์ก่อสร้าง", value: "ครุภัณฑ์ก่อสร้าง" },
                      { label: "ครุภัณฑ์อื่น", value: "ครุภัณฑ์อื่น" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="usageLifespanYears"
                  label="อายุการใช้งาน (ปี)"
                  rules={[
                    { required: true, message: "กรุณากรอกอายุการใช้งาน" },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="monthlyDepreciation"
                  label="ค่าเสื่อมราคาต่อเดือน"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกค่าเสื่อมราคาต่อเดือน",
                    },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="attributes" label="ลักษณะ/คุณสมบัติ">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="documentId" label="ที่เอกสาร">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="responsibleAgency" label="หน่วยงานรับผิดชอบ">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="note" label="หมายเหตุ">
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <DurableArticleDetail
          open={detailModalOpen}
          onClose={handleCloseDetail}
          record={selectedRecord}
        />
      </Card>
    </>
  );
}
