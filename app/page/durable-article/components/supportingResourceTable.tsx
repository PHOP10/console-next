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
  Select,
  DatePicker,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
import { SupportingResourceType } from "../../common";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
};

export default function SupportingResourceTable({
  setLoading,
  loading,
}: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);

  const [data, setData] = useState<SupportingResourceType[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<SupportingResourceType | null>(
    null
  );
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      const result = await intraAuthService.getSupportingResourceQuery();
      if (Array.isArray(result)) {
        setData(result);
      } else if (Array.isArray(result?.data)) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch supporting resources:", error);
      message.error("ไม่สามารถดึงข้อมูลวัสดุสนับสนุนได้");
    } finally {
      setLoading(false);
    }
  }, [intraAuthService, setLoading]);

  useEffect(() => {
    if (loading) {
      fetchData();
    }
  }, [loading, fetchData]);

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
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการแก้ไข:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  };

  const columns: ColumnsType<SupportingResourceType> = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "วัน เดือน ปี",
      dataIndex: "acquiredDate",
      key: "acquiredDate",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "เลขที่หรือรหัส",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ",
      dataIndex: "name",
      key: "name",
      // width: 250,
    },
    // {
    //   title: "สถานะ",
    //   dataIndex: "status",
    //   key: "status",
    // },
    {
      title: "วิธีที่ได้มา",
      dataIndex: "acquisitionType",
      key: "acquisitionType",
    },
    {
      title: "หมายเหตุ",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
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
            label="ชื่อวัสดุ"
            name="name"
            rules={[{ required: true, message: "กรุณากรอกชื่อวัสดุ" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="สถานะ"
            name="status"
            rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
          >
            <Select>
              <Select.Option value="พร้อมใช้งาน">พร้อมใช้งาน</Select.Option>
              <Select.Option value="ชำรุด">ชำรุด</Select.Option>
              <Select.Option value="ใช้แล้วหมด">ใช้แล้วหมด</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="วันที่ได้รับ"
            name="acquiredDate"
            rules={[{ required: true, message: "กรุณาเลือกวันที่ได้รับ" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="วิธีที่ได้มา"
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
          <Form.Item label="รายละเอียดเพิ่มเติม" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
