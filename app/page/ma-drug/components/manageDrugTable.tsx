"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { MaDrugType } from "../../common";

export default function ManageDrugTable() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  const [data, setData] = useState<MaDrugType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await intraAuthService.getMaDrugQuery();
      setData(Array.isArray(result) ? result : result?.data || []);
    } catch (error) {
      console.error("โหลดข้อมูลเบิกจ่ายยาไม่สำเร็จ:", error);
      message.error("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteMaDrug(id);
      message.success("ลบข้อมูลสำเร็จ");
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("ลบข้อมูลไม่สำเร็จ");
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await intraAuthService.updateMaDrug(id);
      message.success("อนุมัติเรียบร้อย");
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("อนุมัติไม่สำเร็จ");
    }
  };

  const handleEdit = (record: MaDrugType) => {
    // TODO: เปิด Modal หรือ Redirect ไปหน้าแก้ไข
    message.info(`แก้ไขข้อมูล ID: ${record.id}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnsType<MaDrugType> = [
    {
      title: "เลขที่เบิก",
      dataIndex: "requestNumber",
      key: "requestNumber",
    },
    {
      title: "หน่วยงานที่เบิก",
      dataIndex: "requestUnit",
      key: "requestUnit",
    },
    {
      title: "ผู้ขอเบิก",
      dataIndex: "requesterName",
      key: "requesterName",
    },
    {
      title: "ผู้จัดยา",
      dataIndex: "dispenserName",
      key: "dispenserName",
    },
    {
      title: "วันที่ขอเบิก",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (value) => new Date(value).toLocaleDateString("th-TH"),
    },
    {
      title: "จำนวนที่เบิก",
      dataIndex: "quantityUsed",
      key: "quantityUsed",
    },
    {
      title: "สถานะ",
      key: "status",
      render: (_, record) =>
        record?.status ? (
          <Tag color="green">อนุมัติแล้ว</Tag>
        ) : (
          <Tag color="orange">รออนุมัติ</Tag>
        ),
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            แก้ไข
          </Button>
          <Popconfirm
            title="คุณต้องการลบข้อมูลนี้หรือไม่?"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
          >
            <Button type="link" danger>
              ลบ
            </Button>
          </Popconfirm>
          {!record?.status && (
            <Popconfirm
              title="คุณต้องการอนุมัติข้อมูลนี้หรือไม่?"
              onConfirm={() => handleApprove(record.id)}
              okText="อนุมัติ"
              cancelText="ยกเลิก"
            >
              <Button type="link" style={{ color: "green" }}>
                อนุมัติ
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      bordered
      pagination={{ pageSize: 10 }}
    />
  );
}
