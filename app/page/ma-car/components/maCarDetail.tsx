import React from "react";
import { Modal, Row, Col, Tag, Divider } from "antd";
import { MaCarType, UserType } from "../../common";
import { CarOutlined, DashboardOutlined } from "@ant-design/icons";

interface MaCarDetailProps {
  open: boolean;
  onClose: () => void;
  record: any;
  dataUser?: UserType[];
}

const MaCarDetail: React.FC<MaCarDetailProps> = ({ open, onClose, record }) => {
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

  const getStatusTag = (status: string) => {
    const baseStyle = "px-3 py-1 rounded-full text-sm font-medium border-0";
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
      className={`text-slate-800 text-sm sm:text-base break-words ${isBold ? "font-semibold" : ""} ${className || ""}`}
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
      style={{ maxWidth: "100%", paddingBottom: 0 }}
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
        <div className="flex flex-col">
          {/* 🔹 Header */}
          <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-start sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 m-0">
                รายละเอียดการจองรถ
              </h2>
              <div className="text-slate-500 text-sm mt-1">
                ตรวจสอบข้อมูลรายละเอียดคำขอใช้รถและการคืนรถ
              </div>
            </div>
            <div className="text-right">{getStatusTag(record.status)}</div>
          </div>

          <div className="p-2 overflow-y-auto max-h-[75vh]">
            {/* 🔹 Card 1: ภารกิจ */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[24, 20]}>
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

            {/* 🔹 Card 2: ข้อมูลการใช้รถ และ ประเภทการเดินทาง (เพิ่มส่วนนี้) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <h3 className="text-slate-800 font-semibold mb-4 text-base pl-2">
                ข้อมูลการใช้รถและแผนงาน
              </h3>

              <Row gutter={[24, 20]}>
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
                      <span className="text-green-600 flex items-center gap-1">
                        ✅ ขอพนักงานขับรถส่วนกลาง
                      </span>
                    ) : record?.driver === "no" ? (
                      <span className="text-slate-500">
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
                        {/* ส่วนชื่อรถและทะเบียน */}
                        <div className="flex items-center gap-2 font-semibold text-slate-700">
                          <span>
                            {record.masterCar.carName}
                            <span className="text-slate-500 font-normal text-sm ml-1">
                              ({record.masterCar.licensePlate})
                            </span>
                          </span>
                        </div>

                        {/* ส่วนเลขไมล์ (แยกบรรทัดลงมา) */}
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
                  <div className="text-blue-500 font-bold text-lg">
                    {record.budget || 0}
                  </div>
                </Col>

                <Divider className="my-0" dashed />

                {/* ✅ ส่วนที่เพิ่ม: ประเภทการเดินทางและแผนงาน */}
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
                          className="px-3 py-1 rounded-full border-blue-100 text-blue-700 bg-blue-50 m-0"
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
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[24, 20]}>
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
                      record.passengerNames.map(
                        (name: string, index: number) => (
                          <div
                            key={index}
                            className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-lg text-sm"
                          >
                            {name}
                          </div>
                        ),
                      )
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
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

            {/* 🔹 Card 4: ข้อมูลการคืนรถ (แสดงเฉพาะเมื่อมีการคืนรถแล้ว) */}
            {(record.status === "return" || record.returnAt) && (
              <div className="bg-purple-50 p-5 rounded-xl shadow-sm border border-purple-100 mb-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                <h3 className="text-purple-800 font-semibold mb-4 text-base pl-2 flex items-center gap-2">
                  <span>ข้อมูลการคืนรถ</span>
                </h3>
                <Row gutter={[24, 20]}>
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
            <div className="bg-slate-200/50 p-4 rounded-xl text-sm border border-slate-200">
              <Row gutter={[16, 12]}>
                {record.approvedByName && record.approvedAt ? (
                  <>
                    <Col xs={24} sm={12}>
                      <span className="text-slate-500 block text-xs">
                        ผู้ดำเนินการ
                      </span>
                      <span className="text-slate-700 font-medium">
                        {record.approvedByName}
                      </span>
                    </Col>
                    <Col xs={24} sm={12}>
                      <span className="text-slate-500 block text-xs">
                        วันที่ดำเนินการ
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
                  <Col span={24} className="text-center text-slate-400 italic">
                    - อยู่ระหว่างดำเนินการ -
                  </Col>
                )}
              </Row>
              <Divider className="my-3 bg-slate-300" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>ยื่นคำขอ: {formatDateOnly(record.createdAt)}</span>
                <span>อัปเดต: {formatDateOnly(record.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default MaCarDetail;
