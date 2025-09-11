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
  Select,
  DatePicker,
  Card,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
import { SupportingResourceType } from "../../common";
import { exportSupportingResources } from "./exportExcel";
import SupportingResourceDetail from "./supportingResourceDetail";
import TextArea from "antd/es/input/TextArea";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: SupportingResourceType[];
  fetchData: () => void;
};

export default function SupportingResourceTable({
  setLoading,
  loading,
  fetchData,
  data,
}: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<SupportingResourceType | null>(
    null
  );
  const [form] = Form.useForm();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchText, setSearchText] = useState("");

  const handleEdit = (record: SupportingResourceType) => {
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
      await intraAuthService.updateSupportingResource({
        id: editRecord?.id,
        ...values,
        acquiredDate: values.acquiredDate.toISOString(),
      });
      message.success("แก้ไขข้อมูลสำเร็จ");
      setEditModalOpen(false);
      setLoading(true);
      fetchData();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการแก้ไข:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  };

  const handleDetail = (record: any) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const filteredData = useMemo(() => {
    if (!searchText) return data;

    const searchLower = searchText.toLowerCase();

    return data.filter((item) =>
      [
        "name",
        "code",
        "status",
        "acquisitionType",
        "description",
        "createdBy",
        "id",
      ].some((key) => {
        const value = item[key as keyof SupportingResourceType];
        return value?.toString().toLowerCase().includes(searchLower);
      })
    );
  }, [data, searchText]);

  const columns: ColumnsType<SupportingResourceType> = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "วัน เดือน ปี",
      dataIndex: "acquiredDate",
      key: "acquiredDate",
      align: "center",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "เลขที่หรือรหัส",
      dataIndex: "code",
      key: "code",
      align: "center",
    },
    {
      title: "ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ",
      dataIndex: "name",
      key: "name",
      align: "center",
      // width: "100%",
      render: (text: string) => {
        const shortText =
          text && text.length > 20 ? text.substring(0, 40) + "..." : text;
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "วิธีการได้มา",
      dataIndex: "acquisitionType",
      key: "acquisitionType",
      align: "center",
      render: (text: string) => {
        const shortText =
          text && text.length > 20 ? text.substring(0, 40) + "..." : text;
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "หมายเหตุ",
      dataIndex: "description",
      key: "description",
      align: "center",
      render: (text: string) => {
        const shortText =
          text && text.length > 20 ? text.substring(0, 25) + "..." : text;
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleEdit(record)}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
            onConfirm={async () => {
              try {
                await intraAuthService.deleteSupportingResource(record.id);
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
            type="primary"
            size="small"
            onClick={() => handleDetail(record)}
          >
            รายละเอียด
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div
          style={{
            width: "100%",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 20,
            color: "#0683e9",
          }}
        >
          ข้อมูลวัสดุสนับสนุน
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

          <Button
            type="primary"
            onClick={() => exportSupportingResources(data)}
          >
            Export Excel
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          bordered
          scroll={{ x: 800 }}
        />

        <Modal
          title="แก้ไขข้อมูลวัสดุสนับสนุน"
          open={editModalOpen}
          onCancel={() => setEditModalOpen(false)}
          onOk={handleUpdate}
          okText="บันทึก"
          cancelText="ยกเลิก"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="รหัสวัสดุ"
              name="code"
              rules={[{ required: true, message: "กรุณากรอกรหัสวัสดุ" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
              name="name"
              rules={[{ required: true, message: "กรุณากรอกชื่อวัสดุ" }]}
            >
              <TextArea
                rows={3}
                placeholder="กรอกชื่อวัสดุ เช่น Toyota REVO 2024 รุ่น X"
              />
            </Form.Item>
            <Form.Item
              label="วัน เดือน ปี "
              name="acquiredDate"
              rules={[{ required: true, message: "กรุณาเลือกวันที่ได้รับ" }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="วิธีการได้มา"
              name="acquisitionType"
              rules={[{ required: true, message: "กรุณาเลือกวิธีที่ได้มา" }]}
            >
              <Select>
                <Select.Option value="บริจาค">บริจาค</Select.Option>
                <Select.Option value="โครงการสนับสนุน">
                  โครงการสนับสนุน
                </Select.Option>
                <Select.Option value="จัดสรรจากส่วนกลาง">
                  จัดสรรจากส่วนกลาง
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="หมายเหตุ" name="description">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
      <SupportingResourceDetail
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        record={selectedRecord}
      />
    </>
  );
}
