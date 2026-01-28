"use client";

import React, { useState } from "react";
import { Table, Tag, Tooltip, Button, Popconfirm, message } from "antd";
import { FileSearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import CustomTable from "../../common/CustomTable";
import { DispenseType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import DispenseTableDetail from "./dispenseTableDetail";

interface DispenseTableProps {
  data: DispenseType[];
  refreshData: () => void;
}

export default function DispenseTable({
  data,
  refreshData,
}: DispenseTableProps) {
  const [loading, setLoading] = useState(false);
  const intraAuth = useAxiosAuth();
  const dispenseService = MaDrug(intraAuth);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DispenseType | null>(
    null,
  );

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
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 120,
      fixed: "right",
      render: (_, record) => {
        return (
          <div className="flex justify-center items-center gap-2">
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
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-[#0683e9] text-center mb-2 tracking-tight">
          รายการข้อมูลจ่ายยา
        </h2>
        <hr className="border-slate-100/30 -mx-6 md:-mx-6" />
      </div>

      <CustomTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }} // ✅ กำหนดความกว้างขั้นต่ำเพื่อให้ Scroll แนวนอนทำงานบนมือถือ
      />
      <DispenseTableDetail
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        data={selectedRecord}
      />
    </>
  );
}
