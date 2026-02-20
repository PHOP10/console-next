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
  Grid,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
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
} from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";
import DurableArticleEditModal from "./durableArticleEditModal";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import thTH from "antd/es/locale/th_TH";
import { buddhistLocale } from "@/app/common";

dayjs.extend(buddhistEra);
dayjs.locale("th");

const { RangePicker } = DatePicker;
const { Option } = Select;
const { useBreakpoint } = Grid;

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
  // 1. เพิ่ม State สำหรับวิธีการได้มา
  const [filterAcquisitionType, setFilterAcquisitionType] = useState<
    string | null
  >(null);
  const [filterAgency, setFilterAgency] = useState<string | null>(null);
  const [filterDateRange, setFilterDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  // --- State อื่นๆ ---
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<DurableArticleType | null>(null);

  const screens = useBreakpoint();

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
    setFilterAcquisitionType(null); // เคลียร์ค่าวิธีการได้มา
    setFilterAgency(null);
    setFilterDateRange(null);
  };

  // --- Prepare Options ---
  const categoryOptions = useMemo(() => {
    const categories = data
      .map((item: any) => item.category)
      .filter((item): item is string => !!item);
    return Array.from(new Set(categories));
  }, [data]);

  // 2. ดึงข้อมูลวิธีการได้มา ที่มีอยู่จริงในตาราง เพื่อมาทำ Dropdown
  const acquisitionOptions = useMemo(() => {
    const types = data
      .map((item: any) => item.acquisitionType)
      .filter((item): item is string => !!item);
    return Array.from(new Set(types));
  }, [data]);

  const agencyOptions = useMemo(() => {
    const agencies = data
      .map((item: any) => item.responsibleAgency)
      .filter((item): item is string => !!item);
    return Array.from(new Set(agencies));
  }, [data]);

  // --- Filter Logic ---
  const filteredData = useMemo(() => {
    return data.filter((item) => {
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
          const value = itemAny[key];
          return value?.toString().toLowerCase().includes(searchLower);
        });

      // 2. Category Filter
      const matchCategory =
        !filterCategory || itemAny.category === filterCategory;

      // 3. Acquisition Type Filter (เพิ่มใหม่)
      const matchAcquisition =
        !filterAcquisitionType ||
        itemAny.acquisitionType === filterAcquisitionType;

      // 4. Agency Filter
      const matchAgency =
        !filterAgency || itemAny.responsibleAgency === filterAgency;

      // 5. Date Range Filter
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

      return (
        matchText &&
        matchCategory &&
        matchAcquisition &&
        matchAgency &&
        matchDate
      );
    });
  }, [
    data,
    searchText,
    filterCategory,
    filterAcquisitionType, // dependency ใหม่
    filterAgency,
    filterDateRange,
  ]);

  // --- Columns Definition ---
  const columns: ColumnsType<DurableArticleType> = [
    {
      title: "รหัส",
      dataIndex: "code",
      key: "code",
      align: "center",
      width: 100,
      render: (text) => (
        <span className="font-normal text-xs sm:text-sm">{text}</span>
      ),
    },
    {
      title: "วันที่",
      dataIndex: "acquiredDate",
      key: "acquiredDate",
      align: "center",
      width: 120,
      render: (text: string) => {
        if (!text) return "-";
        const dateObj = dayjs(text);
        return (
          <>
            <span className="md:hidden text-xs font-normal">
              {dateObj.format("D/M/BB")}
            </span>
            <span className="hidden md:block font-normal">
              {dateObj.format("D MMMM BBBB")}
            </span>
          </>
        );
      },
    },
    {
      title: "รายการ",
      dataIndex: "description",
      key: "description",
      width: 250,
      render: (text: string) => {
        if (!text) return "-";
        const limit = screens.md ? 44 : 22;
        const displayText =
          text.length > limit ? `${text.substring(0, limit)}...` : text;

        return (
          <Tooltip placement="topLeft" title={text}>
            <span className="font-normal cursor-pointer hover:text-blue-500 transition-colors">
              {displayText}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "หมวดหมู่",
      dataIndex: "category",
      key: "category",
      align: "center",
      width: 100,
      responsive: ["md"],
      render: (text) => (text ? <Tag color="cyan">{text}</Tag> : "-"),
    },
    {
      title: "ราคา",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "center",
      width: 100,
      responsive: ["lg"],
      render: (value) =>
        value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ||
        "0.00",
    },
    {
      title: "อายุการใช้งาน (ปี)",
      dataIndex: "usageLifespanYears", // ใช้ตัวแปรนี้ครับ
      key: "usageLifespanYears",
      align: "center",
      width: 100,
      responsive: ["lg"], // แสดงเฉพาะจอใหญ่
      render: (text) => (text ? `${text} ปี` : "-"),
    },
    {
      title: "มูลค่าสุทธิ",
      dataIndex: "netValue",
      key: "netValue",
      align: "center",
      width: 100,
      responsive: ["lg"],
      render: (value) =>
        value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ||
        "0.00",
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              style={{ color: "#1677ff", fontSize: 18, cursor: "pointer" }}
              onClick={() => handleShowDetail(record)}
            />
          </Tooltip>
          <div style={{ display: "inline-block", transform: "scale(0.9)" }}>
            <DurableArticleExportWord record={record} />
          </div>
          {(session?.user?.role === "asset" ||
            session?.user?.role === "admin") && (
            <Tooltip title="แก้ไข">
              <EditOutlined
                onClick={() => handleEdit(record)}
                style={{ color: "#faad14", fontSize: 18, cursor: "pointer" }}
              />
            </Tooltip>
          )}
          {(session?.user?.role === "asset" ||
            session?.user?.role === "admin") && (
            <Popconfirm
              title="ลบข้อมูล?"
              description="ยืนยันการลบข้อมูลรายการนี้หรือไม่?"
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
              cancelText="ยกเลิก"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="ลบ">
                <DeleteOutlined
                  style={{ color: "#ff4d4f", fontSize: 18, cursor: "pointer" }}
                />
              </Tooltip>
            </Popconfirm>
          )}
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
            textAlign: "center",
            fontWeight: "bold",
            color: "#0683e9",
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
            fontSize: "clamp(18px, 4vw, 24px)",
          }}
        >
          ข้อมูลครุภัณฑ์
        </div>

        <div className="p-2 sm:p-6">
          <Card
            className="mb-4 sm:mb-6 bg-blue-50 border-blue-100"
            size="small"
          >
            <div className="flex flex-col gap-4">
              {/* Row 1: Search, Date, Buttons */}
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">
                      ค้นหาทั่วไป
                    </span>
                    <Input
                      prefix={<SearchOutlined className="text-gray-400" />}
                      placeholder="พิมพ์รหัส, ชื่อ..."
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
                    <ConfigProvider locale={buddhistLocale}>
                      <RangePicker
                        locale={buddhistLocale}
                        style={{ width: "100%" }}
                        value={filterDateRange}
                        onChange={(dates) => setFilterDateRange(dates as any)}
                        format="DD MMM YYYY"
                        placeholder={["เริ่มต้น", "สิ้นสุด"]}
                      />
                    </ConfigProvider>
                  </div>
                </Col>
                <Col xs={24} md={8} className="flex flex-col justify-end">
                  <div className="flex flex-col sm:flex-row gap-2 w-full justify-end">
                    <Button
                      type="primary"
                      onClick={handleClearFilters}
                      disabled={
                        !searchText &&
                        !filterCategory &&
                        !filterAcquisitionType &&
                        !filterAgency &&
                        !filterDateRange
                      }
                      className="w-full sm:w-auto"
                    >
                      ล้างตัวกรอง
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => exportDurableArticles(filteredData)}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      ดาวน์โหลดครุภัณฑ์ ({filteredData.length})
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* Row 2: Category, Acquisition Type (New) */}
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

                {/* 3. เพิ่ม UI สำหรับเลือก วิธีการได้มา */}
                <Col xs={24} sm={12} md={6}>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">
                      วิธีการได้มา
                    </span>
                    <Select
                      placeholder="ทั้งหมด"
                      style={{ width: "100%" }}
                      allowClear
                      showSearch
                      value={filterAcquisitionType}
                      onChange={setFilterAcquisitionType}
                      optionFilterProp="children"
                    >
                      {acquisitionOptions.map((type) => (
                        <Option key={type} value={type}>
                          {type}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>

          <div className="flex justify-between mb-2 px-1">
            <span className="text-gray-500 text-xs sm:text-sm">
              มีครุภัณฑ์ทั้งหมด {filteredData.length} รายการ
            </span>
          </div>

          <CustomTable
            rowKey="id"
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            bordered
            scroll={{ x: "max-content" }}
            size="small"
            pagination={{
              pageSizeOptions: ["10", "20", "50", "100"],
              showSizeChanger: true,
              defaultPageSize: 10,

              showTotal: (total, range) => (
                <span className="text-gray-500 text-xs sm:text-sm font-light">
                  แสดง {range[0]}-{range[1]} จากทั้งหมด{" "}
                  <span className="font-bold text-blue-600">{total}</span>{" "}
                  รายการ
                </span>
              ),

              locale: { items_per_page: "/ หน้า" },
              position: ["bottomRight"],
              size: "default",
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
