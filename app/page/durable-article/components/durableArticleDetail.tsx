// DurableArticleDetail.tsx

import React from "react";
import { Modal, Row, Col, Divider, Grid } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";

// เพิ่ม Hook useBreakpoint
const { useBreakpoint } = Grid;

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
  // เช็คขนาดหน้าจอ
  const screens = useBreakpoint();

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
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 sm:p-3 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
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
      // ปรับให้เต็มจอในมือถือ และมี padding เล็กน้อย
      style={{ maxWidth: "100%", paddingBottom: 0 }}
      modalRender={(modal) => (
        <div className="bg-slate-100/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl font-sans">
          {modal}
        </div>
      )}
      styles={{
        body: { padding: 0, backgroundColor: "transparent" },
        header: { display: "none" },
      }}
    >
      {record ? (
        <div className="flex flex-col h-full sm:h-auto">
          {/* 🔹 Header: ปรับให้ Compact ขึ้นบนมือถือ */}
          <div className="bg-white px-4 sm:px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 z-10 shadow-sm">
            <div className="mb-2 sm:mb-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 m-0">
                รายละเอียดครุภัณฑ์
              </h2>
              <div className="text-slate-500 text-xs sm:text-sm mt-1">
                รหัสครุภัณฑ์:{" "}
                <span className="text-blue-600 font-semibold text-sm sm:text-base">
                  {record.code || "-"}
                </span>
              </div>
            </div>
            {/* แสดงทะเบียนถ้ามี */}
            {record.registrationNumber && (
              <div className="bg-slate-100 px-3 py-1 rounded text-xs sm:text-sm text-slate-600 border border-slate-200 w-full sm:w-auto text-center sm:text-left">
                ทะเบียน: {record.registrationNumber}
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] sm:max-h-[80vh]">
            {/* 🔹 Card 1: ข้อมูลทั่วไป */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[16, 16]}>
                {" "}
                {/* ลด gutter บนมือถือ */}
                <Col span={24}>
                  <Label>ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ :</Label>
                  <InfoBox text={record.description} />
                </Col>
                <Col span={24}>
                  <Label>สถานที่ตั้ง/ที่อยู่ :</Label>
                  <InfoBox text={record.location} />
                </Col>
                <Divider className="my-0 col-span-2" dashed />
                <Col xs={12} sm={12}>
                  <Label>วัน เดือน ปี ที่ได้มา :</Label>
                  <Value isBold>{formatDate(record.acquiredDate)}</Value>
                </Col>
                <Col xs={12} sm={12}>
                  <Label>เลขที่เอกสาร :</Label>
                  <Value>{record.documentId || "-"}</Value>
                </Col>
                <Col xs={12} sm={12}>
                  <Label>ประเภท :</Label>
                  <Value>{record.category || "-"}</Value>
                </Col>
                <Col xs={12} sm={12}>
                  <Label>วิธีการได้มา :</Label>
                  <Value>{record.acquisitionType || "-"}</Value>
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 2: ข้อมูลทางการเงิน */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
              <h3 className="text-slate-800 font-semibold mb-4 text-sm sm:text-base pl-2">
                ข้อมูลราคาและค่าเสื่อม
              </h3>

              <Row gutter={[16, 16]}>
                <Col xs={12} sm={8}>
                  <Label>ราคาต่อหน่วย :</Label>
                  <div className="text-slate-800 font-bold text-base sm:text-lg">
                    {formatCurrency(record.unitPrice)}
                  </div>
                </Col>
                <Col xs={12} sm={8}>
                  <Label>อายุการใช้งาน :</Label>
                  <Value>{record.usageLifespanYears ?? "-"} ปี</Value>
                </Col>
                <Col xs={24} sm={8}>
                  <Label>มูลค่าสุทธิ :</Label>
                  <div className="text-green-600 font-bold text-base sm:text-lg bg-green-50 sm:bg-transparent px-2 sm:px-0 py-1 sm:py-0 rounded sm:rounded-none inline-block sm:block w-full sm:w-auto">
                    {formatCurrency(record.netValue)}
                  </div>
                </Col>

                <Divider className="my-0 col-span-3 bg-slate-100" />

                <Col xs={12} sm={8}>
                  <Label>ค่าเสื่อม/เดือน :</Label>
                  <Value>{formatCurrency(record.monthlyDepreciation)}</Value>
                </Col>
                <Col xs={12} sm={8}>
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

            {/* 🔹 Card 3: ข้อมูลเพิ่มเติม */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Label>หน่วยงานรับผิดชอบ (ผู้ขาย/บริจาค) :</Label>
                  <div className="text-sm sm:text-base text-slate-800 bg-slate-50 p-2 rounded-md">
                    {record.responsibleAgency || "-"}
                  </div>
                </Col>

                {record.note && (
                  <Col span={24}>
                    <div className="bg-amber-50 border border-amber-100 p-3 sm:p-4 rounded-lg mt-2">
                      <Label>หมายเหตุ :</Label>
                      <div className="text-amber-900 mt-1 text-sm whitespace-pre-wrap leading-relaxed">
                        {record.note}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </div>

            {/* 🔹 Footer: System Info (เรียงแนวตั้งบนมือถือ) */}
            <div className="bg-slate-200/50 p-3 sm:p-4 rounded-xl text-xs sm:text-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center text-slate-500 gap-1 sm:gap-0">
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
