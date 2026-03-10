// DataLeaveDetail.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Modal, Row, Col, Tag, Divider, Button } from "antd";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { FileSearchOutlined } from "@ant-design/icons";
import { DataLeaveService } from "../services/dataLeave.service";
import { useSession } from "next-auth/react"; // ✅ 1. Import useSession
import CustomTable from "../../common/CustomTable"; // ✅ Import CustomTable
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/th";
import Holidays from "date-holidays";

dayjs.locale("th");
dayjs.extend(isBetween);
const hd = new Holidays("TH");

interface DataLeaveDetailProps {
  open: boolean;
  onClose: () => void;
  record: any;
  user: UserType[]; // List of all users for mapping backupUserId
}

const DataLeaveDetail: React.FC<DataLeaveDetailProps> = ({
  open,
  onClose,
  record,
  user: userList,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);

  // ✅ 2. เช็คว่าเป็น Admin หรือไม่
  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "superadmin";

  // State สำหรับเก็บข้อมูลตารางสถิติ (โหลดเฉพาะตอน Admin เปิดดู)
  const [masterLeaves, setMasterLeaves] = useState<MasterLeaveType[]>([]);
  const [userLeaves, setUserLeaves] = useState<DataLeaveType[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);

  // --- 1. Helper Functions ---
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusTag = (status: string) => {
    const baseStyle =
      "px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border-0";
    switch (status) {
      case "pending":
        return (
          <Tag color="blue" className={baseStyle}>
            รออนุมัติ
          </Tag>
        );
      case "approve":
        return (
          <Tag color="green" className={baseStyle}>
            อนุมัติ
          </Tag>
        );
      case "cancel":
        return (
          <Tag color="red" className={baseStyle}>
            ไม่อนุมัติ
          </Tag>
        );
      case "edit":
        return (
          <Tag color="orange" className={baseStyle}>
            รอแก้ไข
          </Tag>
        );
      case "resubmitted":
        return (
          <Tag color="geekblue" className={baseStyle}>
            รออนุมัติ (แก้ไขแล้ว)
          </Tag>
        );
      case "success":
        return (
          <Tag color="default" className={baseStyle}>
            เสร็จสิ้น
          </Tag>
        );
      default:
        return <Tag className={baseStyle}>{status}</Tag>;
    }
  };

  const getBackupUserName = (backupId: string) => {
    const foundUser = userList.find((u) => u.userId === backupId);
    return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : "-";
  };

  // --- 2. Logic สรุปตารางการลา (เฉพาะ Admin) ---

  // โหลดข้อมูลเมื่อ Admin เปิด Modal
  useEffect(() => {
    if (open && isAdmin && record?.createdById) {
      const fetchUserLeaveHistory = async () => {
        setLoadingTable(true);
        try {
          // ดึง Master Leave และ ประวัติการลาของคนที่ยื่นใบลาใบนี้
          const [masters, leaves] = await Promise.all([
            intraAuthService.getMasterLeaveQuery(),
            intraAuthService.getDataLeaveByUserId(record.createdById),
          ]);
          setMasterLeaves(masters);
          setUserLeaves(leaves);
        } catch (error) {
          console.error("Failed to fetch leave summary", error);
        } finally {
          setLoadingTable(false);
        }
      };
      fetchUserLeaveHistory();
    }
  }, [open, isAdmin, record?.createdById]);

  // ฟังก์ชันคำนวณวันทำการ (ตัดเสาร์อาทิตย์และวันหยุด)
  const isHoliday = (date: dayjs.Dayjs) => {
    const holiday = hd.isHoliday(date.toDate());
    return holiday && holiday[0].type === "public";
  };

  const calculateDays = (start: string | Date, end: string | Date) => {
    if (!start || !end) return 0;
    const startDate = dayjs(start).startOf("day");
    const endDate = dayjs(end).endOf("day");
    if (endDate.isBefore(startDate)) return 0;

    let count = 0;
    let current = startDate;
    while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
      const dayOfWeek = current.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (!isWeekend && !isHoliday(current)) {
        count++;
      }
      current = current.add(1, "day");
    }
    return count;
  };

  const getCurrentFiscalYear = () => {
    const today = dayjs();
    const currentYear = today.year();
    const fiscalYearStart = dayjs(`${currentYear}-10-01`);
    if (today.isBefore(fiscalYearStart)) {
      return {
        start: dayjs(`${currentYear - 1}-10-01`).startOf("day"),
        end: dayjs(`${currentYear}-09-30`).endOf("day"),
      };
    }
    return {
      start: fiscalYearStart.startOf("day"),
      end: dayjs(`${currentYear + 1}-09-30`).endOf("day"),
    };
  };

  const tableData = useMemo(() => {
    if (!record || !masterLeaves.length) return [];
    const fiscalYear = getCurrentFiscalYear();
    const limits: Record<number, number> = { 1: 60, 2: 45, 3: 90 };

    return masterLeaves.map((leave) => {
      // วันที่ลาไปแล้ว (ไม่นับใบปัจจุบัน เพื่อหลีกเลี่ยงการนับซ้ำ)
      const usedDays = userLeaves
        .filter((item) => {
          if (
            item.typeId !== leave.id ||
            item.status !== "approve" ||
            item.id === record.id
          )
            return false;
          return dayjs(item.dateStart).isBetween(
            fiscalYear.start,
            fiscalYear.end,
            "day",
            "[]",
          );
        })
        .reduce(
          (sum, item) => sum + calculateDays(item.dateStart, item.dateEnd),
          0,
        );

      // วันที่ลาของใบปัจจุบัน
      const currentDays =
        record.typeId === leave.id
          ? calculateDays(record.dateStart, record.dateEnd)
          : 0;
      const totalDays = usedDays + currentDays;
      const limit = limits[leave.id] || 0;
      const remainingDays = limit - totalDays;

      return {
        key: leave.id,
        leaveType: leave.leaveType,
        usedDays,
        currentDays,
        totalDays,
        remainingDays,
        limit,
      };
    });
  }, [masterLeaves, userLeaves, record]);

  const columns = [
    { title: "ประเภทการลา", dataIndex: "leaveType", key: "leaveType" },
    {
      title: "คงเหลือ (วัน)",
      dataIndex: "remainingDays",
      key: "remainingDays",
      align: "center" as const,
      render: (val: number) => (
        <span
          className={
            val < 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"
          }
        >
          {val}
        </span>
      ),
    },
    {
      title: "ลามาแล้ว (วัน)",
      dataIndex: "usedDays",
      key: "usedDays",
      align: "center" as const,
    },
    {
      title: "ลาครั้งนี้ (วัน)",
      dataIndex: "currentDays",
      key: "currentDays",
      align: "center" as const,
    },
    {
      title: "รวมการลา (วัน)",
      dataIndex: "totalDays",
      key: "totalDays",
      align: "center" as const,
      render: (val: number, rec: any) => (
        <span className={val > rec.limit ? "text-red-500 font-bold" : ""}>
          {val}
        </span>
      ),
    },
  ];

  // --- 3. Styled Components (Reusable) ---
  const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-slate-500 text-xs sm:text-sm font-medium mb-1">
      {children}
    </div>
  );

  const Value: React.FC<{ children: React.ReactNode; isBold?: boolean }> = ({
    children,
    isBold,
  }) => (
    <div
      className={`text-slate-800 text-sm sm:text-base break-words ${isBold ? "font-semibold" : ""}`}
    >
      {children}
    </div>
  );

  const InfoBox: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return <Value>-</Value>;
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    );
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={isAdmin ? 900 : 800} // ขยาย Modal ให้กว้างขึ้นถ้าเป็น Admin เพื่อให้แสดงตารางได้สวย
      centered
      style={{ maxWidth: "100%", paddingBottom: 0, top: 20 }}
      modalRender={(modal) => (
        <div className="bg-slate-100/50 rounded-2xl overflow-hidden shadow-2xl font-sans">
          {modal}
        </div>
      )}
      styles={{
        body: { padding: 0, backgroundColor: "transparent" },
        header: { display: "none" },
      }}
    >
      {record && (
        <div className="flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh]">
          {/* 🔹 Header */}
          <div className="bg-white px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex justify-between items-start sm:items-center sticky top-0 z-10 shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 m-0">
                รายละเอียดการลา{" "}
              </h2>{" "}
              {/* <span className="text-blue-500 text-sm font-normal ml-2">
                ผู้ยื่นใบลา: {record.createdName}
              </span> */}
              {record.reasonReturn && (
                <div className="mt-1.5 text-orange-500 text-xs sm:text-sm">
                  <span className="font-bold">แก้ไข :</span>{" "}
                  {record.reasonReturn}
                </div>
              )}
            </div>
            <div className="text-right">{getStatusTag(record.status)}</div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* 🔹 Card 1: ประเภทและเหตุผล */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Label>ประเภทการลา :</Label>
                  <div className="text-blue-600 font-bold text-base sm:text-lg">
                    {record.masterLeave?.leaveType || "-"}
                  </div>
                </Col>
                <Divider className="my-0" dashed />
                <Col span={24}>
                  <Label>เหตุผลการลา :</Label>
                  <InfoBox text={record.reason} />
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 2: วันเวลา & ผู้ติดต่อ */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <h3 className="text-slate-800 font-semibold mb-3 sm:mb-4 text-sm sm:text-base pl-2">
                ช่วงเวลาลาและผู้รับผิดชอบงานแทน
              </h3>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Label>ตั้งแต่วันที่ :</Label>
                  <Value isBold>{formatDate(record.dateStart)}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>ถึงวันที่ :</Label>
                  <Value isBold>{formatDate(record.dateEnd)}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>เบอร์ติดต่อระหว่างลา :</Label>
                  <Value>{record.contactPhone || "-"}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>ผู้รับผิดชอบงานแทน :</Label>
                  <div className="flex items-center gap-2">
                    <Value isBold>
                      {getBackupUserName(record.backupUserId)}
                    </Value>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>ระหว่างลาติดต่อได้ที่ :</Label>
                  <Value>{record.contactAddress || "-"}</Value>
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 3: รายละเอียดเพิ่มเติม & ไฟล์แนบ */}
            {(record.details || record.fileName) && (
              <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
                <Row gutter={[16, 16]}>
                  {record.details && (
                    <Col span={24}>
                      <Label>หมายเหตุเพิ่มเติม :</Label>
                      <InfoBox text={record.details} />
                    </Col>
                  )}
                  {record.fileName && (
                    <Col span={24}>
                      <Label>ไฟล์ใบรับรองแพทย์ / เอกสารแนบ :</Label>
                      <div className="mt-2">
                        <Button
                          icon={<FileSearchOutlined />}
                          type="default"
                          className="flex items-center gap-1 border-blue-200 text-blue-600 hover:text-blue-500 hover:border-blue-400 bg-blue-50 w-full sm:w-auto justify-center"
                          onClick={() =>
                            window.open(
                              intraAuthService.getFileUrl(record.fileName),
                              "_blank",
                            )
                          }
                        >
                          เปิดดูเอกสารแนบ
                        </Button>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            )}

            {/* ✅ 🔹 Card 4: ตารางสรุปการลา (แสดงเฉพาะ Admin) */}
            {isAdmin && (
              <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-orange-200 mb-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
                <h3 className="text-slate-800 font-semibold mb-3 sm:mb-4 text-sm sm:text-base pl-2 flex items-center gap-2">
                  สรุปการลาของผู้ใช้(ครั้งนี้)
                </h3>
                <CustomTable
                  columns={columns}
                  dataSource={tableData}
                  loading={loadingTable}
                  pagination={false}
                  bordered
                  scroll={{ x: 500 }}
                  size="small"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
            <Button
              onClick={onClose}
              className="h-9 sm:h-10 px-4 sm:px-6 rounded-lg text-slate-600 hover:bg-slate-100 border-slate-300 w-full sm:w-auto"
            >
              ปิด
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DataLeaveDetail;
