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

export default function DurableArticleTable({
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
    setSelectedRecord(record);
    form.setFieldsValue({
      ...record,
      acquiredDate: dayjs(record.acquiredDate),
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    try {
      // const record = await form.validateFields();

      const payload = {
        ...values,
        id: selectedRecord?.id,
        acquiredDate: values.acquiredDate.toISOString(),
      };
      console.log("payload", payload);
      await intraAuthService.updateDurableArticle(payload);
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
      <Card bodyStyle={{ padding: 0 }}>
        <div
          style={{
            fontSize: "20px",
            textAlign: "center",
            fontWeight: "bold",
            color: "#0683e9",

            marginBottom: "20px",
            borderBottom: "1px solid #e8e8e8",
            paddingTop: "14px",
            height: "59px" 
          }}
        >
          ข้อมูลครุภัณฑ์
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",

            marginBottom: 16,
            paddingLeft: 24,
            paddingRight: 24,
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
          style={{
            width: "96%",
            padding: 0,
            margin: "0 auto",
            marginBottom: 24,
          }}
        />

        <Modal
          title="แก้ไขข้อมูลครุภัณฑ์"
          open={editModalOpen}
          onCancel={() => setEditModalOpen(false)}
          // onOk={handleUpdate}
          // okText="บันทึก"
          // cancelText="ยกเลิก"
          footer={null}
          width={900}
        >
          <Card>
            <Form form={form} layout="vertical" onFinish={handleUpdate}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="รหัส"
                    name="code"
                    rules={[
                      { required: true, message: "กรุณากรอกรหัสครุภัณฑ์" },
                      {
                        pattern: /^[0-9/-]{13,17}$/,
                        message: "กรุณากรอกเฉพาะ 0-9, /, -",
                      },
                    ]}
                  >
                    <Input
                      placeholder="เช่น xxxx-xxx-xxxx"
                      maxLength={17}
                      onKeyPress={(e) => {
                        const allowed = /[0-9/-]/;
                        if (!allowed.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="วันที่ได้มา"
                    name="acquiredDate"
                    rules={[
                      { required: true, message: "กรุณาเลือกวันที่ได้มา" },
                    ]}
                  >
                    <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="เลขที่เอกสาร"
                    name="documentId"
                    rules={[
                      {
                        required: true,
                        message: "กรุณากรอกเลขที่เอกสาร",
                      },
                      {
                        pattern: /^[ก-ฮA-Za-z0-9./\s]+$/,
                        message: "กรอกได้เฉพาะตัวอักษร ตัวเลข จุด และ /",
                      },
                    ]}
                  >
                    <Input placeholder="กรอกเลขที่เอกสาร" maxLength={14} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="ชื่อ ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
                    name="description"
                    rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
                  >
                    <Input.TextArea rows={2} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="หมายเลขและทะเบียน"
                    name="registrationNumber"
                    rules={[
                      { required: true, message: "กรุณาหมายเลขและทะเบียน" },
                    ]}
                  >
                    <Input placeholder="กรอกหมายเลขและทะเบียน" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="ประเภท"
                    name="category"
                    rules={[{ required: true, message: "กรุณาเลือกประเภท" }]}
                  >
                    <Select
                      placeholder="เลือกประเภท"
                      onChange={(value) => {
                        form.setFieldValue(
                          "category",
                          value === "other" ? "" : value
                        );
                      }}
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <div style={{ display: "flex", padding: 8 }}>
                            <Input
                              placeholder="กรอกประเภทอื่นๆ"
                              onPressEnter={(e) => {
                                form.setFieldValue(
                                  "category",
                                  e.currentTarget.value
                                );
                              }}
                              onBlur={(e) => {
                                form.setFieldValue(
                                  "category",
                                  e.currentTarget.value
                                );
                              }}
                            />
                          </div>
                        </>
                      )}
                    >
                      <Select.Option value="ครุภัณฑ์งานบ้านงานครัว">
                        ครุภัณฑ์งานบ้านงานครัว
                      </Select.Option>
                      <Select.Option value="ครุภัณฑ์วิทยาศาสตร์การแพทย์">
                        ครุภัณฑ์วิทยาศาสตร์การแพทย์
                      </Select.Option>
                      <Select.Option value="ครุภัณฑ์สำนักงาน">
                        ครุภัณฑ์สำนักงาน
                      </Select.Option>
                      <Select.Option value="ครุภัณฑ์ยานพาหนะและขนส่ง">
                        ครุภัณฑ์ยานพาหนะและขนส่ง
                      </Select.Option>
                      <Select.Option value="ครุภัณฑ์ไฟฟ้าและวิทยุ">
                        ครุภัณฑ์ไฟฟ้าและวิทยุ
                      </Select.Option>
                      <Select.Option value="ครุภัณฑ์โฆษณาและเผยแพร่">
                        ครุภัณฑ์โฆษณาและเผยแพร่
                      </Select.Option>
                      <Select.Option value="ครุภัณฑ์คอมพิวเตอร์">
                        ครุภัณฑ์คอมพิวเตอร์
                      </Select.Option>
                      <Select.Option value="ครุภัณฑ์การแพทย์">
                        ครุภัณฑ์การแพทย์
                      </Select.Option>
                      <Select.Option value="ครุภัณฑ์ก่อสร้าง">
                        ครุภัณฑ์ก่อสร้าง
                      </Select.Option>
                      <Select.Option value="other">
                        ครุภัณฑ์อื่น...
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="ลักษณะ/คุณสมบัติ"
                    name="attributes"
                    rules={[{ required: true, message: "กรุณากรอกคุณสมบัติ" }]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="กรอกลักษณะ/คุณสมบัติ "
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="ชื่อผู้ขาย/ผู้รับจ้าง/ผู้บริจาค"
                    name="responsibleAgency"
                    rules={[
                      {
                        required: true,
                        message: "กรุณากรอก ชื่อผู้ขาย/ผู้รับจ้าง/ผู้บริจาค",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="กรอกชื่อผู้ขาย/ผู้รับจ้าง/ผู้บริจาค"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="ราคาต่อหน่วย"
                    name="unitPrice"
                    rules={[
                      { required: true, message: "กรุณากรอกราคาต่อหน่วย" },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="acquisitionType"
                    label="วิธีการได้มา"
                    rules={[
                      { required: true, message: "กรุณาเลือกวิธีการได้มา" },
                    ]}
                  >
                    <Select
                      placeholder="เลือกงบประมาณ"
                      onChange={(value) => {
                        form.setFieldValue(
                          "acquisitionType",
                          value === "other" ? "" : value
                        );
                      }}
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <div style={{ display: "flex", padding: 8 }}>
                            <Input
                              placeholder="กรอกงบประมาณอื่นๆ"
                              onPressEnter={(e) => {
                                form.setFieldValue(
                                  "budget",
                                  e.currentTarget.value
                                );
                              }}
                              onBlur={(e) => {
                                form.setFieldValue(
                                  "budget",
                                  e.currentTarget.value
                                );
                              }}
                            />
                          </div>
                        </>
                      )}
                    >
                      <Select.Option value="งบประมาณ">งบประมาณ</Select.Option>
                      <Select.Option value="เงินบำรุง">เงินบำรุง</Select.Option>
                      <Select.Option value="เงินงบประมาณ ตกลงราคา">
                        เงินงบประมาณ ตกลงราคา
                      </Select.Option>
                      <Select.Option value="other">อื่นๆ...</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="อายุการใช้งาน (ปี)"
                    name="usageLifespanYears"
                    rules={[
                      { required: true, message: "กรุณากรอกอายุการใช้งาน" },
                    ]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="ค่าเสื่อมราคาต่อเดือน"
                    name="monthlyDepreciation"
                    rules={[
                      {
                        required: true,
                        message: "กรุณากรอกค่าเสื่อมราคาต่อเดือน",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="หมายเหตุ" name="note">
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item style={{ textAlign: "center" }}>
                <Button type="primary" htmlType="submit">
                  บันทึก
                </Button>
                <Button
                  onClick={() => setEditModalOpen(false)}
                  style={{ marginLeft: 8 }}
                >
                  ยกเลิก
                </Button>
              </Form.Item>
            </Form>
          </Card>
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
