"use client";

import React, { useCallback, useEffect, useState } from "react";
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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
import { DurableArticleType } from "../../common";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
};

export default function DurableArticleTable({ setLoading, loading }: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);

  const [data, setData] = useState<DurableArticleType[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<DurableArticleType | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      const result = await intraAuthService.getDurableArticleQuery();
      if (Array.isArray(result)) {
        setData(result);
      } else if (Array.isArray(result?.data)) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error("ไม่สามารถดึงข้อมูลครุภัณฑ์ได้");
    } finally {
      setLoading(false);
    }
  }, [intraAuthService, setLoading]);

  useEffect(() => {
    if (loading) {
      fetchData();
    }
  }, [loading, fetchData]);

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

  const columns: ColumnsType<DurableArticleType> = [
    {
      title: "รหัสครุภัณฑ์",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "วันที่ได้มา",
      dataIndex: "acquiredDate",
      key: "acquiredDate",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "รายละเอียด",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "ราคาต่อหน่วย",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (value) =>
        value.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    },
    {
      title: "วิธีที่ได้มา",
      dataIndex: "acquisitionType",
      key: "acquisitionType",
    },
    {
      title: "อายุการใช้งาน (ปี)",
      dataIndex: "usageLifespanYears",
      key: "usageLifespanYears",
    },
    {
      title: "ค่าเสื่อมราคาต่อเดือน",
      dataIndex: "monthlyDepreciation",
      key: "monthlyDepreciation",
      render: (value) =>
        value.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    },
    // {
    //   title: "ค่าเสื่อมราคาปีงบประมาณ",
    //   dataIndex: "yearlyDepreciation",
    //   key: "yearlyDepreciation",
    //   render: (value) =>
    //     value.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    // },
    // {
    //   title: "ค่าเสื่อมราคาสะสม",
    //   dataIndex: "accumulatedDepreciation",
    //   key: "accumulatedDepreciation",
    //   render: (value) =>
    //     value.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    // },
    // {
    //   title: "มูลค่าสุทธิ",
    //   dataIndex: "netValue",
    //   key: "netValue",
    //   render: (value) =>
    //     value.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    // },
    {
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Space>
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
          <Button size="small" onClick={() => handleEdit(record)}>
            แก้ไข
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
      />

      <Modal
        title="แก้ไขข้อมูลครุภัณฑ์"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleUpdate}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="รหัสครุภัณฑ์"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="acquiredDate"
            label="วันที่ได้มา"
            rules={[{ required: true }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="รายละเอียด"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="unitPrice"
            label="ราคาต่อหน่วย"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item
            name="acquisitionType"
            label="วิธีที่ได้มา"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="usageLifespanYears"
            label="อายุการใช้งาน (ปี)"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item
            name="monthlyDepreciation"
            label="ค่าเสื่อมราคาต่อเดือน"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          {/* <Form.Item
            name="yearlyDepreciation"
            label="ค่าเสื่อมราคาปีงบประมาณ"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item
            name="accumulatedDepreciation"
            label="ค่าเสื่อมราคาสะสม"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item
            name="netValue"
            label="มูลค่าสุทธิ"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item> */}
          <Form.Item name="note" label="หมายเหตุ">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
