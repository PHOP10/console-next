// DataLeaveDetail.tsx

import React from "react";
import { Modal, Row, Col, Tag, Divider, Button } from "antd";
import { UserType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { FileSearchOutlined } from "@ant-design/icons";
import { DataLeaveService } from "../services/dataLeave.service";

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
  user: userList, // Rename prop to userList for clarity
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);

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
      default:
        return <Tag className={baseStyle}>{status}</Tag>;
    }
  };

  const getBackupUserName = (backupId: string) => {
    const foundUser = userList.find((u) => u.userId === backupId);
    return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : "-";
  };

  // --- 2. Styled Components (Reusable) ---

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
          <div className="bg-white px-6 py-5 border-b border-slate-200 flex justify-between items-start sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 m-0">
                รายละเอียดการลา
              </h2>
              <div className="text-slate-500 text-sm mt-1">
                ข้อมูลการยื่นขออนุญาตลาหยุดงาน
              </div>
            </div>
            <div className="text-right">{getStatusTag(record.status)}</div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[75vh]">
            {/* 🔹 Card 1: ประเภทและเหตุผล */}
            <div className="bg-white  rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[24, 20]}>
                <Col span={24}>
                  <Label>ประเภทการลา :</Label>
                  <div className="text-blue-600 font-bold text-lg">
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
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <h3 className="text-slate-800 font-semibold mb-4 text-base pl-2">
                ช่วงเวลาและผู้รับผิดชอบ
              </h3>

              <Row gutter={[24, 20]}>
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
              </Row>
            </div>

            {/* 🔹 Card 3: รายละเอียดเพิ่มเติม & ไฟล์แนบ */}
            {(record.details || record.fileName) && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
                <Row gutter={[24, 20]}>
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
                          className="flex items-center gap-1 border-blue-200 text-blue-600 hover:text-blue-500 hover:border-blue-400 bg-blue-50"
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
                        {formatDate(record.approvedDate)}
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
                        {formatDate(record.cancelAt)}
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
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DataLeaveDetail;
