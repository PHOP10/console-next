"use client";

import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Popconfirm,
  Space,
  message,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Popover,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DataLeaveType, MasterLeaveType } from "../../common";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveService } from "../services/dataLeave.service";
import DataLeaveDetail from "./dataLeaveDetail";
import { useSession } from "next-auth/react";
import isBetween from "dayjs/plugin/isBetween";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface Props {
  dataLeave: DataLeaveType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setDataLeave: React.Dispatch<React.SetStateAction<DataLeaveType[]>>;
  masterLeave: MasterLeaveType[];
  fetchData: () => Promise<void>;
  leaveByUserId?: DataLeaveType[];
}

export default function ManagementDataLeaveTable({
  dataLeave,
  loading,
  setLoading,
  setDataLeave,
  masterLeave,
  fetchData,
  leaveByUserId,
}: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);
  const [currentRecord, setCurrentRecord] = useState<DataLeaveType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const { data: session } = useSession();
  const { RangePicker } = DatePicker;
  const { TextArea } = Input;
  const [open, setOpen] = useState(false);
  const [modalCancelOpen, setModalCancelOpen] = useState(false);
  const [selectedCancelRecord, setSelectedCancelRecord] =
    useState<DataLeaveType | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

  const openEditModal = (record: DataLeaveType) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      typeId: record.typeId,
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

  const handleDelete = async (record: DataLeaveType) => {
    try {
      await intraAuthService.deleteDataLeave(record.id);
      setDataLeave((prev) => prev.filter((item) => item.id !== record.id));
      message.success("ลบข้อมูลสำเร็จ");
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const handleApprove = async (record: any) => {
    try {
      await intraAuthService.updateDataLeave({
        id: record.id,
        status: "approve",
        approvedById: session?.user?.userId,
        approvedByName: session?.user?.fullName,
        approvedDate: new Date().toISOString(),
      });
      message.success("อนุมัติรายการนี้แล้ว");
      setLoading(true);
      setOpenPopoverId(null);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอนุมัติ:", error);
      message.error("ไม่สามารถอนุมัติได้");
    }
  };

  const handleConfirmCancel = async (values: { cancelReason: string }) => {
    if (!selectedCancelRecord) return;
    const reason = values.cancelReason?.trim();
    if (!reason) {
      message.error("กรุณากรอกเหตุผลการยกเลิก");
      return;
    }

    try {
      const updated = await intraAuthService.updateDataLeave({
        id: selectedCancelRecord.id,
        cancelName: session?.user?.fullName,
        cancelAt: new Date().toISOString(),
        status: "cancel",
        cancelReason: values.cancelReason,
      });

      setDataLeave((prev) =>
        prev.map((item) =>
          item.id === selectedCancelRecord.id ? updated : item
        )
      );

      message.success("ยกเลิกเรียบร้อย");
      setModalCancelOpen(false);
      form.resetFields(); // รีเซ็ต Form
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาด");
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

  const columns: ColumnsType<DataLeaveType> = [
    { title: "Id", dataIndex: "id", key: "id" },

    { title: "เหตุผล", dataIndex: "reason", key: "reason" },
    {
      title: "วันที่เริ่มลา",
      dataIndex: "leaveDateStart",
      key: "dateStart",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "วันที่สิ้นสุด",
      dataIndex: "leaveDateEnd",
      key: "leaveDateEnd",
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
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => openEditModal(record)}
            disabled={record.status !== "pending"}
          >
            แก้ไข
          </Button>

          <Popconfirm
            title="ยืนยันการลบ"
            okText="ใช่"
            cancelText="ยกเลิก"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger size="small">
              ลบ
            </Button>
          </Popconfirm>

          <Popover
            trigger="click"
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                <Typography.Text strong>ยืนยันการอนุมัติ ?</Typography.Text>
              </Space>
            }
            content={
              <Space style={{ display: "flex", marginTop: 13 }}>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleApprove(record)}
                >
                  อนุมัติ
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setSelectedCancelRecord(record);
                    setModalCancelOpen(true);
                    // setPopoverOpen(false);
                    setOpenPopoverId(null);
                  }}
                >
                  ยกเลิก
                </Button>
              </Space>
            }
            open={openPopoverId === record.id}
            onOpenChange={(open) => setOpenPopoverId(open ? record.id : null)}
          >
            <Button
              type="primary"
              size="small"
              disabled={record.status !== "pending"}
              onClick={() => setOpenPopoverId(record.id)}
            >
              อนุมัติ
            </Button>
          </Popover>

          <Button
            size="small"
            type="primary"
            onClick={() => handleShowDetail(record)}
          >
            รายละเอียด
          </Button>
        </Space>
      ),
    },
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
        dataSource={dataLeave}
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
              {masterLeave.map((item) => (
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

      <Modal
        title="ยกเลิกการลา"
        open={modalCancelOpen}
        onOk={() => form.submit()}
        onCancel={() => setModalCancelOpen(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => handleConfirmCancel(values)}
        >
          <Form.Item
            label="เหตุผลการยกเลิก"
            name="cancelReason"
            rules={[{ required: true, message: "กรุณากรอกเหตุผลการยกเลิก" }]}
          >
            <Input.TextArea placeholder="กรุณากรอกเหตุผลการยกเลิก" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
