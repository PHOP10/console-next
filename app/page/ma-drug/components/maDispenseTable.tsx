"use client";

import React, { useState } from "react";
import { Table, Tag, Button, Tooltip, Popconfirm, message, Space } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DispenseType } from "../../common";
import CustomTable from "../../common/CustomTable";
import DispenseTableDetail from "./dispenseTableDetail";

interface MaDispenseTableProps {
  data: DispenseType[];
  fetchData: () => void;
}

export default function MaDispenseTable({
  data,
  fetchData,
}: MaDispenseTableProps) {
  const intraAuth = useAxiosAuth();
  const dispenseService = MaDrug(intraAuth);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DispenseType | null>(
    null,
  );

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await dispenseService.deleteDispense(id);
      message.success("ลบรายการเรียบร้อยแล้ว");
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("ไม่สามารถลบรายการได้");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record: DispenseType) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const columns: ColumnsType<DispenseType> = [
    {
      title: "วันที่จ่าย",
      dataIndex: "dispenseDate",
      key: "dispenseDate",
      align: "center",
      width: 130,
      render: (text: string) => {
        if (!text) return "-";
        return new Intl.DateTimeFormat("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(text));
      },
    },
    {
      title: "ผู้จ่ายยา",
      dataIndex: "dispenserName",
      key: "dispenserName",
      align: "left",
      width: 150,
      render: (text) => (
        <span className="font-medium text-slate-700">{text || "-"}</span>
      ),
    },
    {
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
      align: "left",
      width: 150,
      ellipsis: true,
      render: (text) => <span className="text-gray-500">{text || "-"}</span>,
    },
    {
      title: "มูลค่ารวม",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right",
      width: 120,
      render: (val) => (
        <span className="text-blue-600 font-semibold">
          {val
            ? val.toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "0.00"}
        </span>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
      render: (status) => {
        let color = "default";
        let text = status;
        let icon = null;

        switch (status) {
          case "pending":
            color = "blue";
            text = "รออนุมัติ";
            break;
          case "approved":
            color = "success";
            text = "อนุมัติแล้ว";
            break;
          case "completed":
            color = "success";
            text = "จ่ายสำเร็จ";
            break;
          case "canceled":
            color = "error";
            text = "ยกเลิก";
            break;
          default:
            text = status;
        }
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "จัดการ (Admin)",
      key: "action",
      align: "center",
      width: 150,
      render: (_, record) => {
        // ปุ่มจะขึ้นเฉพาะสถานะ Pending เท่านั้น
        const isPending = record.status === "pending";

        return (
          <Space>
            {isPending && (
              <>
                {/* <Tooltip title="อนุมัติการจ่าย">
                  <Popconfirm
                    title="ยืนยันการอนุมัติ?"
                    onConfirm={() => handleApprove(record.id)}
                    okText="อนุมัติ"
                    cancelText="ปิด"
                  >
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<CheckCircleOutlined />}
                      size="small"
                      style={{
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                      }}
                    />
                  </Popconfirm>
                </Tooltip>

                <Tooltip title="ไม่อนุมัติ/ยกเลิก">
                  <Popconfirm
                    title="ยืนยันการยกเลิก?"
                    description="รายการนี้จะถูกยกเลิกถาวร"
                    onConfirm={() => handleCancel(record.id)}
                    okText="ยกเลิกรายการ"
                    cancelText="ปิด"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="primary"
                      danger
                      shape="circle"
                      icon={<CloseCircleOutlined />}
                      size="small"
                    />
                  </Popconfirm>
                </Tooltip> */}

                <Tooltip title="ลบรายการ">
                  <Popconfirm
                    title="ยืนยันการลบ"
                    description="คุณต้องการลบรายการนี้ใช่หรือไม่?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="ลบ"
                    cancelText="ยกเลิก"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      shape="circle"
                      danger
                      icon={<DeleteOutlined style={{ fontSize: 20 }} />}
                    />
                  </Popconfirm>
                </Tooltip>
              </>
            )}

            <Tooltip title="ดูรายละเอียด">
              <Button
                type="text"
                shape="circle"
                icon={
                  <FileSearchOutlined
                    style={{ fontSize: 20, color: "#1677ff" }}
                  />
                }
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <CustomTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
      />
      <DispenseTableDetail
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        data={selectedRecord}
      />
    </>
  );
}
