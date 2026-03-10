"use client";

import React from "react";
import { Modal, Row, Col, Tag, Divider, Button } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";

interface OfficialTravelRequestDetailProps {
  open: boolean;
  onClose: () => void;
  record: any;
  dataUser?: any[];
}

const OfficialTravelRequestDetail: React.FC<
  OfficialTravelRequestDetailProps
> = ({ open, onClose, record, dataUser }) => {
  // --- 1. Helper Function จัดการวันที่ ---
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const d = dayjs(dateString).locale("th");
    // dayjs ปีไทยต้องบวก 543 เอง หรือใช้ plugin (แต่เขียนสดแบบนี้ชัวร์สุดครับ)
    return `${d.date()} ${d.format("MMMM")} ${d.year() + 543} เวลา ${d.format(
      "HH:mm",
    )} น.`;
  };

  const formatDates = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const d = dayjs(dateString).locale("th");
    // dayjs ปีไทยต้องบวก 543 เอง หรือใช้ plugin (แต่เขียนสดแบบนี้ชัวร์สุดครับ)
    return `${d.date()} ${d.format("MMMM")} ${d.year() + 543} 
    `;
  };

  // --- 2. Helper Function จัดการ Status Tag ---
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

  // --- 3. Helper Function จัดการแสดงผลประเภทการเดินทาง ---
  const getTravelTypeDisplay = () => {
    const type = record.travelType?.[0];
    const otherDetail = record.otherTravelType;
    const privateCar = record.privateCarId;
    const officialCar = record.MasterCar;

    const typeMap: Record<string, string> = {
      official: "โดยรถยนต์ราชการ",
      bus: "รถยนต์โดยสารประจำทาง",
      plane: "เครื่องบินโดยสาร",
      private: "รถยนต์ส่วนบุคคล",
      other: "อื่น ๆ",
    };

    const label = typeMap[type] || "-";

    if (type === "official" && officialCar) {
      return `${label} (  ${officialCar.licensePlate} )`;
    }
    if (type === "private" && privateCar) {
      return `${label} (  ${privateCar} )`;
    }
    if (type === "other" && otherDetail) {
      return `${label} ( ระบุ : ${otherDetail} )`;
    }
    return label;
  };

  // --- 4. Styled Components ---

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
      className={`text-slate-800 text-sm sm:text-base break-words ${
        isBold ? "font-semibold" : ""
      }`}
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

  // --- Main Render ---
  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={750}
      centered
      // ปรับให้เต็มจอในมือถือ
      style={{ maxWidth: "100%", paddingBottom: 0, top: 20 }}
      modalRender={(modal) => (
        <div className="bg-slate-100/50 rounded-2xl overflow-hidden shadow-2xl">
          {modal}
        </div>
      )}
      styles={{
        body: { padding: 0, backgroundColor: "transparent" },
        header: { display: "none" },
      }}
    >
      {record && (
        <div className="flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh]">
          {/* Header */}
          <div className="bg-white px-4 sm:px-6 py-4 border-b border-slate-200 flex justify-between items-start sticky top-0 z-10 shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 m-0">
                รายละเอียดคำขอไปราชการ
              </h2>
              <div className="text-slate-500 text-xs sm:text-sm mt-1">
                เอกสารเลขที่:{" "}
                <span className="text-blue-600 font-semibold">
                  {record.documentNo}
                </span>
              </div>
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
            {/* 🔹 Card 1: ผู้รับ & ภารกิจ */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Label>เรียน :</Label>
                  <Value isBold>{record.recipient || "-"}</Value>
                </Col>

                <Divider className="my-0" dashed />

                <Col span={24}>
                  <Label>วัตถุประสงค์ :</Label>
                  <InfoBox text={record.missionDetail} />
                </Col>
                <Col span={24}>
                  <Label>สถานที่ :</Label>
                  <InfoBox text={record.location} />
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 2: วันที่ & งบประมาณ & การเดินทาง */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>

              <h3 className="text-slate-800 font-semibold mb-4 text-sm sm:text-base">
                ข้อมูลการเดินทาง
              </h3>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Label>ตั้งแต่วันที่ :</Label>
                  <Value>{formatDate(record.startDate)}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>ถึงวันที่ :</Label>
                  <Value>{formatDate(record.endDate)}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>ประเภทการเดินทาง :</Label>
                  <Value>{getTravelTypeDisplay()}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>งบประมาณ :</Label>
                  <div className="text-blue-500 font-bold text-base sm:text-lg">
                    {record.budget || 0}
                  </div>
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 3: ผู้โดยสาร */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-slate-800 font-semibold text-sm sm:text-base">
                  ผู้โดยสาร
                </span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                  {record.passengers || 0} คน
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {record.passengerNames && record.passengerNames.length > 0 ? (
                  record.passengerNames.map((uid: string) => {
                    const user = dataUser?.find((u) => u.userId === uid);
                    return (
                      <div
                        key={uid}
                        className="flex items-center gap-2 bg-blue-50/50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg text-xs sm:text-sm"
                      >
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400"></div>
                        {user ? `${user.firstName} ${user.lastName}` : uid}
                      </div>
                    );
                  })
                ) : (
                  <span className="text-slate-400 text-sm">
                    - ไม่มีข้อมูลผู้โดยสาร -
                  </span>
                )}
              </div>
            </div>

            {/* 🔹 Note Section */}
            {record.note && (
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-4">
                <Label>หมายเหตุเพิ่มเติม :</Label>
                <div className="text-amber-900 mt-1 text-sm">{record.note}</div>
              </div>
            )}

            {/* 🔹 Footer: System Info */}
            <div className="bg-slate-200/50 p-4 rounded-xl text-sm border border-slate-200">
              <Row gutter={[16, 12]}>
                {record.approvedByName && record.approvedDate ? (
                  <>
                    <Col xs={24} sm={12}>
                      <span className="text-slate-500 block text-xs">
                        ผู้อนุมัติ
                      </span>
                      <span className="text-slate-700 font-medium">
                        {record.approvedByName}
                      </span>
                    </Col>
                    <Col xs={24} sm={12}>
                      <span className="text-slate-500 block text-xs">
                        วันที่อนุมัติ
                      </span>
                      <span className="text-slate-700 font-medium">
                        {formatDates(record.approvedDate)}
                      </span>
                    </Col>
                  </>
                ) : record.cancelName && record.cancelAt ? (
                  <>
                    <Col xs={24} sm={12}>
                      <span className="text-red-500 block text-xs">
                        ผู้ไม่อนุมัติ
                      </span>
                      <span className="text-red-700 font-medium">
                        {record.cancelName}
                      </span>
                    </Col>
                    <Col xs={24} sm={12}>
                      <span className="text-red-500 block text-xs">
                        วันที่ไม่อนุมัติ
                      </span>
                      <span className="text-red-700 font-medium">
                        {formatDates(record.cancelAt)}
                      </span>
                    </Col>
                    {record.cancelReason && (
                      <Col span={24} className="mt-1">
                        <div className="bg-white p-2 rounded border border-red-100 text-red-600 text-xs">
                          เหตุผล: {record.cancelReason}
                        </div>
                      </Col>
                    )}
                  </>
                ) : (
                  <Col
                    span={24}
                    className="text-center text-slate-400 italic text-xs"
                  >
                    - อยู่ระหว่างดำเนินการ -
                  </Col>
                )}
              </Row>

              <Divider className="my-3 bg-slate-300" />

              <div className="flex justify-between text-xs text-slate-400">
                <span>ยื่นคำขอ: {formatDates(record.createdAt)}</span>
                <span>อัปเดต: {formatDates(record.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Footer (Fixed for Mobile) */}
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

export default OfficialTravelRequestDetail;
