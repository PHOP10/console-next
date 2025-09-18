"use client";

import React, { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DataLeaveType, MaDrugItemType, MasterLeaveType } from "../../common";
import dayjs from "dayjs";
import DataLeaveDetail from "./dataLeaveDetail";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveService } from "../services/dataLeave.service";
import DataLeaveWord from "./dataLeaveWord";

interface DataLeaveTableProps {
  data: DataLeaveType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  masterLeaves: MasterLeaveType[];
  fetchData: () => Promise<void>;
  leaveByUserId: DataLeaveType[];
}

export default function DataLeaveTable({
  data,
  loading,
  masterLeaves,
  fetchData,
  leaveByUserId,
}: DataLeaveTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [currentRecord, setCurrentRecord] = useState<DataLeaveType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { RangePicker } = DatePicker;
  const [form] = Form.useForm();

  const handleShowDetail = (record: any) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
  };

  const openEditModal = (record: DataLeaveType) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      typeId: record.typeId, // ✅ เพิ่มตรงนี้
      leaveDates: [dayjs(record.dateStart), dayjs(record.dateEnd)],
      reason: record.reason,
      details: record.details,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      if (!currentRecord) return;

      const { leaveDates, ...rest } = values;

      const payload = {
        id: currentRecord.id,
        ...rest,
        dateStart: leaveDates[0].startOf("day").toISOString(),
        dateEnd: leaveDates[1].endOf("day").toISOString(),
      };

      await intraAuthService.updateDataLeave(payload);
      fetchData();
      message.success("แก้ไขข้อมูลเรียบร้อย");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถแก้ไขข้อมูลได้");
    }
  };

  const columns: ColumnsType<DataLeaveType> = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "เหตุผล",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "วันที่เริ่มลา",
      dataIndex: "dateStart",
      key: "dateStart",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "วันที่สิ้นสุด",
      dataIndex: "dateEnd",
      key: "dateEnd",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = "";

        switch (status) {
          case "pending":
            color = "blue";
            text = "รอดำเนินการ";
            break;
          case "approve":
            color = "green";
            text = "อนุมัติ";
            break;
          case "cancel":
            color = "red";
            text = "ยกเลิก";
            break;
          default:
            text = status;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    // {
    //   title: "ผู้อนุมัติ",
    //   dataIndex: "approvedByName",
    //   key: "approvedByName",
    //   render: (value) => value || "-",
    // },
    {
      title: "รายละเอียด",
      dataIndex: "details",
      key: "details",
      render: (value) => value || "-",
    },

    {
      title: "จัดการ",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => openEditModal(record)}
            disabled={record.status !== "pending"}
          >
            แก้ไข
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => handleShowDetail(record)}
          >
            รายละเอียด
          </Button>
          <DataLeaveWord
            record={record}
            masterLeaves={masterLeaves}
            backupUserName={
              record.backupUser?.firstName + " " + record.backupUser?.lastName
            }
          />
        </Space>
      ),
    },
    // {
    //   title: "อัปเดตล่าสุด",
    //   dataIndex: "updatedAt",
    //   key: "updatedAt",
    //   render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    // },
  ];

  return (
    <>
      <DataLeaveDetail
        open={detailModalOpen}
        onClose={handleCloseDetail}
        record={selectedRecord}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={leaveByUserId}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />
      <Modal
        title="แก้ไขข้อมูลการลา"
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="ประเภทการลา"
            name="typeId"
            rules={[{ required: true, message: "กรุณาเลือกประเภทลา" }]}
          >
            <Select placeholder="เลือกประเภทลา">
              {masterLeaves.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.leaveType}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="ช่วงวันที่ลา"
            name="leaveDates"
            rules={[{ required: true, message: "กรุณาเลือกช่วงวันที่ลา" }]}
          >
            <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="เหตุผล"
            name="reason"
            rules={[{ required: true, message: "กรุณากรอกเหตุผล" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="รายละเอียด" name="details">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
