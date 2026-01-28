// DurableArticleDetail.tsx

import React from "react";
import { Modal, Row, Col, Divider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";

interface DurableArticleDetailProps {
  open: boolean;
  onClose: () => void;
  record: any;
}

const DurableArticleDetail: React.FC<DurableArticleDetailProps> = ({
  open,
  onClose,
  record,
}) => {
  // --- 1. Helper Functions ---
  const formatDate = (
    dateString: string | null | undefined,
    includeTime = false,
  ) => {
    if (!dateString) return "-";
    const format = includeTime ? "DD MMM YYYY HH:mm น." : "DD MMM YYYY";
    return dayjs(dateString).locale("th").format(format);
  };

  const formatCurrency = (amount: any) => {
    if (!amount && amount !== 0) return "-";
    return Number(amount).toLocaleString("th-TH", {
      style: "currency",
      currency: "THB",
    });
  };

  // --- 2. Styled Components (Reusable) ---
  const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-slate-500 text-xs sm:text-sm font-medium mb-1">
      {children}
    </div>
  );

  const Value: React.FC<{
    children: React.ReactNode;
    isBold?: boolean;
    highlight?: boolean;
  }> = ({ children, isBold, highlight }) => (
    <div
      className={`text-slate-800 text-sm sm:text-base break-words ${
        isBold ? "font-semibold" : ""
      } ${highlight ? "text-blue-600" : ""}`}
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
      width={900}
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
      {record ? (
        <div className="flex flex-col">
          {/* 🔹 Header */}
          <div className="bg-white px-6 py-5 border-b border-slate-200 flex justify-between items-start sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 m-0">
                รายละเอียดครุภัณฑ์
              </h2>
              <div className="text-slate-500 text-sm mt-1">
                รหัสครุภัณฑ์:{" "}
                <span className="text-blue-600 font-semibold text-base">
                  {record.code || "-"}
                </span>
              </div>
            </div>
            {/* แสดงทะเบียนถ้ามี */}
            {record.registrationNumber && (
              <div className="bg-slate-100 px-3 py-1 rounded text-sm text-slate-600 border border-slate-200">
                เลขทะเบียน: {record.registrationNumber}
              </div>
            )}
          </div>

          <div className="p-6 overflow-y-auto max-h-[75vh]">
            {/* 🔹 Card 1: ข้อมูลทั่วไป (General Info) */}
            <div className="bg-white  rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[24, 20]}>
                <Col xs={24} sm={12}>
                  <Label>ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ :</Label>
                  <InfoBox text={record.description} />
                </Col>
                <Col xs={24} sm={12}>
                  <Label>สถานที่ตั้ง/ที่อยู่ :</Label>
                  <InfoBox text={record.location} />
                </Col>

                <Divider className="my-0 col-span-2" dashed />

                <Col xs={24} sm={12}>
                  <Label>วัน เดือน ปี ที่ได้มา :</Label>
                  <Value isBold>{formatDate(record.acquiredDate)}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>ประเภท :</Label>
                  <Value>{record.category || "-"}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>วิธีการได้มา :</Label>
                  <Value>{record.acquisitionType || "-"}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>เลขที่เอกสาร :</Label>
                  <Value>{record.documentId || "-"}</Value>
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 2: ข้อมูลทางการเงิน & ค่าเสื่อม (Financial & Depreciation) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
              <h3 className="text-slate-800 font-semibold mb-4 text-base pl-2">
                ข้อมูลราคาและค่าเสื่อม
              </h3>

              <Row gutter={[24, 20]}>
                <Col xs={24} sm={8}>
                  <Label>ราคาต่อหน่วย :</Label>
                  <div className="text-slate-800 font-bold text-lg">
                    {formatCurrency(record.unitPrice)}
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <Label>อายุการใช้งาน (ปี) :</Label>
                  <Value>{record.usageLifespanYears ?? "-"} ปี</Value>
                </Col>
                <Col xs={24} sm={8}>
                  <Label>มูลค่าสุทธิ :</Label>
                  <div className="text-green-600 font-bold text-lg">
                    {formatCurrency(record.netValue)}
                  </div>
                </Col>

                <Divider className="my-0 col-span-3 bg-slate-100" />

                <Col xs={24} sm={8}>
                  <Label>ค่าเสื่อมราคาต่อเดือน :</Label>
                  <Value>{formatCurrency(record.monthlyDepreciation)}</Value>
                </Col>
                <Col xs={24} sm={8}>
                  <Label>ค่าเสื่อม/ปี :</Label>
                  <Value>{formatCurrency(record.yearlyDepreciation)}</Value>
                </Col>
                <Col xs={24} sm={8}>
                  <Label>ค่าเสื่อมสะสม :</Label>
                  <Value highlight>
                    {formatCurrency(record.accumulatedDepreciation)}
                  </Value>
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 3: ข้อมูลเพิ่มเติม (Additional Info) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[24, 20]}>
                <Col span={24}>
                  <Label>หน่วยงานรับผิดชอบ :</Label>
                  <Value isBold>{record.responsibleAgency || "-"}</Value>
                </Col>

                {record.note && (
                  <Col span={24}>
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg mt-2">
                      <Label>หมายเหตุ :</Label>
                      <div className="text-amber-900 mt-1 text-sm whitespace-pre-wrap">
                        {record.note}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </div>

            {/* 🔹 Footer: System Info */}
            <div className="bg-slate-200/50 p-4 rounded-xl text-sm border border-slate-200 flex justify-between items-center text-slate-500 text-xs">
              <div>วันที่บันทึก: {formatDate(record.createdAt, true)}</div>
              <div>แก้ไขล่าสุด: {formatDate(record.updatedAt, true)}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center text-slate-400">ไม่พบข้อมูล</div>
      )}
    </Modal>
  );
};

export default DurableArticleDetail;
