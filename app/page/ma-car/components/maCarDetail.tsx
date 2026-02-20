import React from "react";
import { Modal, Row, Col, Tag, Divider, Button } from "antd";
import { MaCarType, UserType } from "../../common";
import { CarOutlined, DashboardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface MaCarDetailProps {
  open: boolean;
  onClose: () => void;
  record: any;
  dataUser?: UserType[];
}

const MaCarDetail: React.FC<MaCarDetailProps> = ({
  open,
  onClose,
  record,
  dataUser,
}) => {
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${datePart} เวลา ${timePart} น.`;
  };

  const formatDateOnly = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const d = dayjs(dateString).locale("th");
    return `${d.date()} ${d.format("MMMM")} ${d.year() + 543}`;
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
            ยกเลิก
          </Tag>
        );
      case "edit":
        return (
          <Tag color="orange" className={baseStyle}>
            รอแก้ไข
          </Tag>
        );
      case "success":
        return (
          <Tag color="default" className={baseStyle}>
            สำเร็จ
          </Tag>
        );
      case "return":
        return (
          <Tag color="purple" className={baseStyle}>
            คืนรถแล้ว
          </Tag>
        );
      default:
        return <Tag className={baseStyle}>{status}</Tag>;
    }
  };

  // --- Styled Components ---
  const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-slate-500 text-xs sm:text-sm font-medium mb-1">
      {children}
    </div>
  );

  const Value: React.FC<{
    children: React.ReactNode;
    isBold?: boolean;
    className?: string;
  }> = ({ children, isBold, className }) => (
    <div
      className={`text-slate-800 text-sm sm:text-base break-words ${
        isBold ? "font-semibold" : ""
      } ${className || ""}`}
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
      width={800}
      centered
      // ปรับให้เต็มจอในมือถือ
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
        <div className="flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh]">
          {/* 🔹 Header */}
          <div className="bg-white px-4 sm:px-6 py-4 border-b border-slate-200 flex justify-between items-start sm:items-center sticky top-0 z-10 shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 m-0">
                รายละเอียดการจองรถ
              </h2>
              <div className="text-slate-500 text-xs sm:text-sm mt-1">
                ตรวจสอบข้อมูลรายละเอียดคำขอใช้รถและการคืนรถ
              </div>
            </div>
            <div className="text-right">{getStatusTag(record.status)}</div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* 🔹 Card 1: ภารกิจ */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Label>เรียน :</Label>
                  <Value isBold>{record.recipient || "-"}</Value>
                </Col>
                <Divider className="my-0" dashed />
                <Col span={24}>
                  <Label>วัตถุประสงค์ :</Label>
                  <InfoBox text={record.purpose} />
                </Col>
                <Col span={24}>
                  <Label>สถานที่ :</Label>
                  <InfoBox text={record.destination} />
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 2: ข้อมูลการใช้รถ */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <h3 className="text-slate-800 font-semibold mb-4 text-sm sm:text-base pl-2">
                ข้อมูลการใช้รถและแผนงาน
              </h3>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Label>ตั้งแต่วันที่ :</Label>
                  <Value isBold>{formatDateTime(record.dateStart)}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>ถึงวันที่ :</Label>
                  <Value isBold>{formatDateTime(record.dateEnd)}</Value>
                </Col>

                <Col xs={24} sm={12}>
                  <Label>ขอคนขับรถ :</Label>
                  <Value>
                    {record?.driver === "yes" ? (
                      <span className="text-green-600 flex items-center gap-1 text-sm">
                        ✅ ขอพนักงานขับรถส่วนกลาง
                      </span>
                    ) : record?.driver === "no" ? (
                      <span className="text-slate-500 text-sm">
                        ไม่ขอพนักงานขับรถส่วนกลาง
                      </span>
                    ) : (
                      "-"
                    )}
                  </Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>รถที่ใช้ :</Label>
                  <Value>
                    {record.masterCar ? (
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 font-semibold text-slate-700 text-sm">
                          <span>
                            {record.masterCar.carName}
                            <span className="text-slate-500 font-normal text-xs ml-1">
                              ({record.masterCar.licensePlate})
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <DashboardOutlined />
                          <span>เลขไมล์ก่อนเดินทาง:</span>
                          <span className="font-mono font-medium text-slate-700">
                            {record.startMileage
                              ? record.startMileage.toLocaleString()
                              : "-"}
                          </span>
                          <span>กม.</span>
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>งบประมาณ :</Label>
                  <div className="text-blue-500 font-bold text-base sm:text-lg">
                    {record.budget || 0}
                  </div>
                </Col>

                <Divider className="my-0" dashed />

                <Col span={24}>
                  <Label>ประเภทการเดินทางและแผนงาน :</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {record.typeName &&
                    Array.isArray(record.typeName) &&
                    record.typeName.length > 0 ? (
                      record.typeName.map((name: string, index: number) => (
                        <Tag
                          key={index}
                          color="blue"
                          className="px-2 sm:px-3 py-1 rounded-full border-blue-100 text-blue-700 bg-blue-50 m-0 text-xs sm:text-sm"
                        >
                          {name}
                        </Tag>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-sm">
                        - ไม่ได้ระบุแผนงาน -
                      </span>
                    )}
                  </div>
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 3: ผู้โดยสาร */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="flex items-center gap-2 mb-2">
                    <Label>จำนวนผู้โดยสาร :</Label>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                      {record.passengers || 0} คน
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {record.passengerNames &&
                    record.passengerNames.length > 0 ? (
                      record.passengerNames.map((uid: string) => {
                        const user = dataUser?.find(
                          (u: any) => u.userId === uid,
                        );
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
                </Col>
              </Row>
            </div>

            {/* 🔹 Notes */}
            {record.note && (
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-4">
                <Label>เหตุผลเพิ่มเติม :</Label>
                <div className="text-amber-900 mt-1 text-sm whitespace-pre-wrap">
                  {record.note}
                </div>
              </div>
            )}

            {/* 🔹 Card 4: ข้อมูลการคืนรถ */}
            {(record.status === "return" || record.returnAt) && (
              <div className="bg-purple-50 p-4 sm:p-5 rounded-xl shadow-sm border border-purple-100 mb-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                <h3 className="text-purple-800 font-semibold mb-4 text-sm sm:text-base pl-2 flex items-center gap-2">
                  <span>ข้อมูลการคืนรถ</span>
                </h3>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Label>ชื่อผู้คืนรถ :</Label>
                    <Value isBold>{record.returnByName || "-"}</Value>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Label>วันที่และเวลาที่คืน :</Label>
                    <Value isBold className="text-purple-700">
                      {formatDateTime(record.returnAt)}
                    </Value>
                  </Col>
                  <Col span={24}>
                    <Label>หมายเหตุการคืน / สภาพรถ :</Label>
                    <div className="bg-white border border-purple-100 rounded-lg p-3 text-slate-700 text-sm italic">
                      {record.returnNote || "ไม่มีหมายเหตุเพิ่มเติม"}
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* 🔹 Footer: System Info */}
            <div className="bg-slate-200/50 p-4 rounded-xl text-sm border border-slate-200 mt-4">
              <Row gutter={[16, 12]}>
                {record.approvedByName && record.approvedAt ? (
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
                        {formatDateOnly(record.approvedAt)}
                      </span>
                    </Col>
                  </>
                ) : record.cancelName && record.cancelAt ? (
                  <>
                    <Col xs={24} sm={12}>
                      <span className="text-red-500 block text-xs">
                        ผู้ยกเลิก
                      </span>
                      <span className="text-red-700 font-medium">
                        {record.cancelName}
                      </span>
                    </Col>
                    <Col xs={24} sm={12}>
                      <span className="text-red-500 block text-xs">
                        วันที่ยกเลิก
                      </span>
                      <span className="text-red-700 font-medium">
                        {formatDateOnly(record.cancelAt)}
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
                <span>ยื่นคำขอ: {formatDate(record.createdAt)}</span>
                <span>อัปเดต: {formatDate(record.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Footer Button (Fixed) */}
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

export default MaCarDetail;
