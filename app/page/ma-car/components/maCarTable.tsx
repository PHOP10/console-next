"use client";

import React from "react";
import { Table, Space, Popconfirm, Button, message, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { maCarService } from "../services/maCar.service";
import { MaCarType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";

interface MaCarTableProps {
  data: MaCarType[];
  loading: boolean;
  fetchData: () => void;
}

const MaCarTable: React.FC<MaCarTableProps> = ({
  data,
  loading,
  fetchData,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);

  const columns: ColumnsType<MaCarType> = [
    { title: "ผู้ขอใช้รถ", dataIndex: "requesterName", key: "requesterName" },
    { title: "วัตถุประสงค์", dataIndex: "purpose", key: "purpose" },
    {
      title: "วันเริ่มเดินทาง",
      dataIndex: "departureDate",
      key: "departureDate",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    {
      title: "วันกลับ",
      dataIndex: "returnDate",
      key: "returnDate",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    { title: "ปลายทาง", dataIndex: "destination", key: "destination" },
    { title: "จำนวนผู้โดยสาร", dataIndex: "passengers", key: "passengers" },
    {
      title: "งบประมาณ",
      dataIndex: "budget",
      key: "budget",
      render: (value) => (value ? value.toLocaleString() : "-"),
    },
    { title: "รหัสรถ", dataIndex: "masterCarId", key: "masterCarId" },
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
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        // <Space>
        //   <Popconfirm
        //     title="ยืนยันการลบ"
        //     description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
        //     onConfirm={async () => {
        //       try {
        //         await intraAuthService.deleteMaCar(record.id);
        //         message.success("ลบข้อมูลสำเร็จ");
        //         fetchData();
        //       } catch (error) {
        //         console.error("เกิดข้อผิดพลาดในการลบ:", error);
        //         message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
        //       }
        //     }}
        //     okText="ใช่"
        //     cancelText="ยกเลิก"
        //   >
        //     <Button danger size="small">
        //       ลบ
        //     </Button>
        //   </Popconfirm>
        // </Space>
        <></>
      ),
    },
  ];

  return (
    <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
  );
};

export default MaCarTable;
