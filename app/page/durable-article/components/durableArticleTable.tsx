"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Popconfirm,
  Space,
  message,
  Input,
  Card,
  Tooltip,
  Select,
  DatePicker,
  Row,
  Col,
  Tag,
  ConfigProvider,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
// หากไฟล์ common ยังไม่ได้อัปเดต Type ให้แก้ที่ไฟล์นั้น หรือถ้าจะแก้ด่วนให้ใช้ type ด้านล่างนี้แทนการ import
import { DurableArticleType } from "../../common";
import DurableArticleDetail from "./durableArticleDetail";
import { exportDurableArticles } from "./exportDurableArticles";
import DurableArticleExportWord from "./durableArticleExportWordId";
import { useSession } from "next-auth/react";
import {
  DeleteOutlined,
  EditOutlined,
  FileSearchOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";
import DurableArticleEditModal from "./durableArticleEditModal";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import thTH from "antd/es/locale/th_TH";
dayjs.extend(buddhistEra);
dayjs.locale("th");

const { RangePicker } = DatePicker;
const { Option } = Select;

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: DurableArticleType[];
  fetchData: () => Promise<void>;
};

export default function DurableArticleTable({
  setLoading,
  loading,
  data,
  fetchData,
}: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);
  const { data: session } = useSession();

  // --- State สำหรับ Filter ---
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterAgency, setFilterAgency] = useState<string | null>(null);
  const [filterDateRange, setFilterDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  // --- State สำหรับ Modal/Selection ---
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<DurableArticleType | null>(null);

  // --- Handlers ---
  const handleEdit = (record: DurableArticleType) => {
    setEditRecord(record);
    setEditModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    setEditRecord(null);
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

  const handleClearFilters = () => {
    setSearchText("");
    setFilterCategory(null);
    setFilterAgency(null);
    setFilterDateRange(null);
  };

  const categoryOptions = useMemo(() => {
    // Cast item เป็น any เพื่อข้ามการเช็ค Type ชั่วคราว
    const categories = data
      .map((item: any) => item.category)
      .filter((item): item is string => !!item);
    // เปลี่ยนจาก [...new Set()] เป็น Array.from(new Set())
    return Array.from(new Set(categories));
  }, [data]);

  // const agencyOptions = useMemo(() => {
  //   const agencies = data
  //     .map((item: any) => item.responsibleAgency)
  //     .filter((item): item is string => !!item);
  //   return Array.from(new Set(agencies));
  // }, [data]);

  // --- Filter Logic ---
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Cast item เป็น any เพื่อให้เข้าถึง property ที่อาจจะยังไม่อยู่ใน Type หลักได้
      const itemAny = item as any;

      // 1. Text Search
      const searchLower = searchText.toLowerCase();
      const matchText =
        !searchText ||
        [
          "code",
          "description",
          "category",
          "documentId",
          "responsibleAgency",
          "acquisitionType",
        ].some((key) => {
          // ใช้ itemAny เพื่อความชัวร์ว่าเข้าถึง key ได้
          const value = itemAny[key];
          return value?.toString().toLowerCase().includes(searchLower);
        });

      // 2. Category Filter
      const matchCategory =
        !filterCategory || itemAny.category === filterCategory;

      // 3. Agency Filter
      const matchAgency =
        !filterAgency || itemAny.responsibleAgency === filterAgency;

      // 4. Date Range Filter
      let matchDate = true;
      if (filterDateRange && filterDateRange[0] && filterDateRange[1]) {
        const itemDate = dayjs(item.acquiredDate);
        const start = filterDateRange[0].startOf("day");
        const end = filterDateRange[1].endOf("day");
        matchDate =
          itemDate.isValid() &&
          (itemDate.isSame(start) || itemDate.isAfter(start)) &&
          (itemDate.isSame(end) || itemDate.isBefore(end));
      }

      return matchText && matchCategory && matchAgency && matchDate;
    });
  }, [data, searchText, filterCategory, filterAgency, filterDateRange]);

  // --- Columns Definition ---
  const columns: ColumnsType<DurableArticleType> = [
    {
      title: "เลขที่หรือรหัส",
      dataIndex: "code",
      key: "code",
      align: "center",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "วันที่ได้รับ",
      dataIndex: "acquiredDate",
      key: "acquiredDate",
      align: "center",
      render: (text: string) => {
        const date = new Date(text);
        return new Intl.DateTimeFormat("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date);
      },
    },
    {
      title: "รายการ",
      dataIndex: "description",
      key: "description",
      // width: 200,
      render: (text: string) => {
        if (!text) return "-";
        return (
          <Tooltip placement="topLeft" title={text}>
            <div className="truncate w-full max-w-[300px]">{text}</div>
          </Tooltip>
        );
      },
    },
    {
      title: "หมวดหมู่",
      dataIndex: "category",
      key: "category",
      align: "center",
      responsive: ["md"],
      render: (text) => (text ? <Tag color="cyan">{text}</Tag> : "-"),
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
      title: "มูลค่าสุทธิ ",
      dataIndex: "netValue",
      key: "netValue",
      align: "center",

      render: (value) =>
        value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ||
        "0.00",
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space size="small">
          {(session?.user?.role === "asset" ||
            session?.user?.role === "admin") && (
            <Tooltip title="แก้ไข">
              <Button
                type="text"
                icon={
                  <EditOutlined style={{ color: "#faad14", fontSize: 22 }} />
                }
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}

          <Tooltip title="รายละเอียด">
            <Button
              type="text"
              icon={
                <FileSearchOutlined
                  style={{ color: "#1677ff", fontSize: 22 }}
                />
              }
              onClick={() => handleShowDetail(record)}
            />
          </Tooltip>

          <div style={{ display: "inline-block" }}>
            <DurableArticleExportWord record={record} />
          </div>

          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่?"
            onConfirm={async () => {
              try {
                await intraAuthService.deleteDurableArticle(record.id);
                message.success("ลบสำเร็จ");
                setLoading(true);
              } catch (error) {
                console.error(error);
                message.error("ลบไม่สำเร็จ");
              }
            }}
            okText="ลบ"
            okButtonProps={{ danger: true }}
            cancelText="ยกเลิก"
          >
            <Tooltip title="ลบ">
              <Button
                type="text"
                danger
                icon={
                  <DeleteOutlined style={{ color: "#ff4d4f", fontSize: 22 }} />
                }
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        bodyStyle={{ padding: 0 }}
        className="shadow-md rounded-2xl overflow-hidden border-gray-100"
      >
        <div
          style={{
            fontSize: "24px",
            textAlign: "center",
            fontWeight: "bold",
            color: "#0683e9",
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          ข้อมูลครุภัณฑ์
        </div>

        <div className="p-6">
          {/* --- Section: Advanced Search Filter --- */}
          <Card className="mb-6 bg-blue-50 border-blue-100" size="small">
            <div className="flex flex-col gap-4">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">
                      ค้นหาทั่วไป
                    </span>
                    <Input
                      prefix={<SearchOutlined className="text-gray-400" />}
                      placeholder="พิมพ์รหัส, ชื่อ หรือรายละเอียด..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                    />
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">
                      ช่วงวันที่ได้รับ
                    </span>
                    <ConfigProvider locale={thTH}>
                      <RangePicker
                        style={{ width: "100%" }}
                        value={filterDateRange}
                        onChange={(dates) => setFilterDateRange(dates as any)}
                        format="DD/MMM/YYYY"
                        placeholder={["วันที่เริ่มต้น", "วันที่สิ้นสุด"]}
                      />
                    </ConfigProvider>
                  </div>
                </Col>
                <Col xs={24} md={8} className="flex items-end justify-end">
                  <Space>
                    <Button
                      type="primary" // <--- เพิ่มบรรทัดนี้ เพื่อให้เป็นสีฟ้า
                      onClick={handleClearFilters}
                      disabled={
                        !searchText &&
                        !filterCategory &&
                        !filterAgency &&
                        !filterDateRange
                      }
                    >
                      ล้างตัวกรอง
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => exportDurableArticles(filteredData)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ดาวน์โหลด Excel ({filteredData.length})
                    </Button>
                  </Space>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">
                      หมวดหมู่
                    </span>
                    <Select
                      placeholder="ทั้งหมด"
                      style={{ width: "100%" }}
                      allowClear
                      showSearch
                      value={filterCategory}
                      onChange={setFilterCategory}
                      optionFilterProp="children"
                    >
                      {categoryOptions.map((cat) => (
                        <Option key={cat} value={cat}>
                          {cat}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>

          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">
              พบข้อมูลทั้งหมด {filteredData.length} รายการ
            </span>
          </div>

          <CustomTable
            rowKey="id"
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            bordered
            scroll={{ x: 1200 }}
            size="middle"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `ทั้งหมด ${total} รายการ`,
            }}
          />
        </div>
      </Card>

      <DurableArticleEditModal
        key={editRecord?.id || "new"}
        open={editModalOpen}
        onClose={handleUpdateSuccess}
        record={editRecord}
        fetchData={fetchData}
      />

      <DurableArticleDetail
        open={detailModalOpen}
        onClose={handleCloseDetail}
        record={selectedRecord}
      />
    </>
  );
}
