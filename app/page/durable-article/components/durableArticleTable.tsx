"use client";

import React, { useMemo, useState } from "react";
import { Button, Popconfirm, Space, message, Input, Card, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
import { DurableArticleType } from "../../common";
import DurableArticleDetail from "./durableArticleDetail";
import { exportDurableArticles } from "./exportDurableArticles";
import DurableArticleExportWord from "./durableArticleExportWordId"; // ถ้ามี
import { useSession } from "next-auth/react";
import {
  DeleteOutlined,
  EditOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";
import DurableArticleEditModal from "./durableArticleEditModal";

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
  const { data: session } = useSession();

  // State
  const [searchText, setSearchText] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Modals State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<DurableArticleType | null>(null);

  // Handlers
  const handleEdit = (record: DurableArticleType) => {
    setEditRecord(record);
    setEditModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    setLoading(true); // Trigger re-fetch from parent
    setEditModalOpen(false);
  };

  const handleShowDetail = (record: any) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    if (!searchText) return data;
    const searchLower = searchText.toLowerCase();
    return data.filter((item) =>
      [
        "acquiredDate",
        "code",
        "description",
        "category",
        "documentId",
        "responsibleAgency",
      ].some((key) => {
        const value = item[key as keyof DurableArticleType];
        return value?.toString().toLowerCase().includes(searchLower);
      }),
    );
  }, [data, searchText]);

  // Columns Definition
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
        if (!text) return "-";
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
        value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ||
        "0.00",
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          {/* Admin & Asset Actions */}
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
                <Tooltip title="ลบ">
                  <DeleteOutlined
                    style={{
                      fontSize: 22,
                      color: "#ff4d4f",
                      cursor: "pointer",
                    }}
                  />
                </Tooltip>
              </Popconfirm>

              <Tooltip title="แก้ไข">
                <EditOutlined
                  onClick={() => handleEdit(record)}
                  style={{ fontSize: 22, color: "#faad14", cursor: "pointer" }}
                />
              </Tooltip>
            </>
          )}

          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              onClick={() => handleShowDetail(record)}
              style={{ fontSize: 22, color: "#1677ff", cursor: "pointer" }}
            />
          </Tooltip>

          {/* Export Word Button */}
          <DurableArticleExportWord record={record} />
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
            height: "59px",
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
            className="rounded-lg"
          />

          <Button type="primary" onClick={() => exportDurableArticles(data)}>
            Export Excel
          </Button>
        </div>

        <CustomTable
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          bordered
          scroll={{ x: "max-content" }}
          style={{ width: "100%" }}
        />
      </Card>

      {/* --- เรียกใช้ Modal ที่แยกไฟล์ออกมา --- */}
      <DurableArticleEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleUpdateSuccess}
        record={editRecord}
      />

      {/* Detail Modal (ถ้ามีแยกไฟล์ก็ import มาใช้แบบเดียวกัน) */}
      <DurableArticleDetail
        open={detailModalOpen}
        onClose={handleCloseDetail}
        record={selectedRecord}
      />
    </>
  );
}
