// OfficialTravelRequestDetail.tsx

"use client";

import { Modal, Form, Row, Col, Input, Tag, Card } from "antd";

interface OfficialTravelRequestDetailProps {
  open: boolean;
  onClose: () => void;
  record: any;
  dataUser?: any[];
}

const OfficialTravelRequestDetail: React.FC<
  OfficialTravelRequestDetailProps
> = ({ open, onClose, record, dataUser }) => {
  const { TextArea } = Input;

  const getStatusTag = (status: string) => {
    switch (status) {
      case "pending":
        return <Tag color="blue">รอดำเนินการ</Tag>;
      case "approve":
        return <Tag color="green">อนุมัติ</Tag>;
      case "cancel":
        return <Tag color="red">ยกเลิก</Tag>;
      case "edit":
        return <Tag color="orange">รอแก้ไข</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: "center", width: "100%" }}>
          รายละเอียดคำขอเดินทางไปราชการ
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Card>
        {record && (
          <Form layout="vertical">
            {/* 🔹 ผู้ขอ & เรื่อง */}
            <Row gutter={18}>
              <Col span={12}>
                <Form.Item label="เลขที่เอกสาร :">
                  <span>{record.documentNo}</span>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="เรียน :">
                  <span>{record.recipient || "-"}</span>
                </Form.Item>
              </Col>
            </Row>

            {/* 🔹 รายละเอียดภารกิจ */}
            <Row gutter={18}>
              <Col span={12}>
                <Form.Item label="วัตถุประสงค์ :">
                  <TextArea
                    value={record.missionDetail}
                    rows={2}
                    readOnly
                    bordered={false}
                    style={{ resize: "none" }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="สถานที่ :">
                  {/* <span>{record.location || "-"}</span> */}
                  <TextArea
                    value={record.location}
                    rows={2}
                    readOnly
                    bordered={false}
                    style={{ resize: "none" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* 🔹 วันที่ */}
            <Row gutter={18}>
              <Col span={12}>
                <Form.Item label="ตั้งแต่วันที่ :">
                  <span>
                    {record.startDate
                      ? new Date(record.startDate).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="ถึงวันที่ :">
                  <span>
                    {record.endDate
                      ? new Date(record.endDate).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={18}>
              <Col span={12}>
                <Form.Item label="งบประมาณ :">
                  <span>{record.budget || 0}</span>
                </Form.Item>
              </Col>
              {/* <Col span={12}>
                <Form.Item label="รถที่ใช้ :">
                  <span>
                    {record.MasterCar
                      ? `${record.MasterCar.licensePlate} (${record.MasterCar.brand} ${record.MasterCar.model})`
                      : "-"}
                  </span>
                </Form.Item>
              </Col> */}

              <Col span={12}>
                <Form.Item label="ประเภทการเดินทาง :">
                  <span>
                    {(() => {
                      // 1. ดึงค่าจาก record
                      const type = record.travelType?.[0];
                      const otherDetail = record.otherTravelType;
                      const privateCar = record.privateCarId;
                      const officialCar = record.MasterCar;

                      // 2. กำหนดชื่อภาษาไทยสำหรับแต่ละประเภท
                      const typeMap: Record<string, string> = {
                        official: "โดยรถยนต์ราชการ",
                        bus: "รถยนต์โดยสารประจำทาง",
                        plane: "เครื่องบินโดยสาร",
                        private: "รถยนต์ส่วนบุคคล",
                        other: "อื่น ๆ",
                      };

                      const label = typeMap[type] || "-";

                      // 3. จัดรูปแบบการแสดงผล () ต่อท้ายตามเงื่อนไข
                      if (type === "official" && officialCar) {
                        return `${label} ( ทะเบียน : ${officialCar.licensePlate} )`;
                      }

                      if (type === "private" && privateCar) {
                        return `${label} ( ทะเบียน : ${privateCar} )`;
                      }

                      if (type === "other" && otherDetail) {
                        return `${label} ( ระบุ : ${otherDetail} )`;
                      }

                      return label;
                    })()}
                  </span>
                </Form.Item>
              </Col>
            </Row>
            {/* 🔹 สถานที่ & ผู้โดยสาร */}
            <Row gutter={18}>
              <Col span={12}>
                <Form.Item label="จำนวนผู้โดยสาร :">
                  <span>{record.passengers || 0}</span>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="รายชื่อผู้โดยสาร :">
                  {record.passengerNames && record.passengerNames.length > 0 ? (
                    record.passengerNames.map((uid: string) => {
                      const user = dataUser?.find((u) => u.userId === uid);
                      return (
                        <Tag key={uid} color="blue">
                          {user ? `${user.firstName} ${user.lastName}` : uid}
                        </Tag>
                      );
                    })
                  ) : (
                    <span>-</span>
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={18}>
              <Col span={12}>
                <Form.Item label="สถานะ :">
                  {getStatusTag(record.status)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="หมายเหตุ :">
                  {/* <span>{record.title}</span> */}
                  <TextArea
                    value={record.title}
                    rows={2}
                    readOnly
                    bordered={false}
                    style={{ resize: "none" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* 🔹 การอนุมัติ/ยกเลิก */}
            <Row gutter={18}>
              {record.approvedByName && record.approvedDate ? (
                <>
                  <Col span={12}>
                    <Form.Item label="ผู้อนุมัติ :">
                      <span>{record.approvedByName}</span>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="วันที่อนุมัติ :">
                      <span>
                        {record.approvedDate
                          ? new Date(record.approvedDate).toLocaleDateString(
                              "th-TH",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </span>
                    </Form.Item>
                  </Col>
                </>
              ) : record.cancelName && record.cancelAt ? (
                <>
                  <Col span={12}>
                    <Form.Item label="ผู้ยกเลิก :">
                      <span>{record.cancelName}</span>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="วันที่ยกเลิก :">
                      <span>
                        {record.cancelAt
                          ? new Date(record.cancelAt).toLocaleDateString(
                              "th-TH",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </span>
                    </Form.Item>
                  </Col>
                </>
              ) : null}
            </Row>

            <Row gutter={18}>
              {record.cancelReason && record.cancelReason ? (
                <>
                  <Col span={24}>
                    <Form.Item label="เหตุผลการยกเลิก :">
                      <TextArea
                        value={record.cancelReason}
                        rows={2}
                        readOnly
                        bordered={false}
                        style={{ resize: "none" }}
                      />
                    </Form.Item>
                  </Col>
                </>
              ) : null}
            </Row>

            {/* 🔹 ข้อมูลระบบ */}
            <Row gutter={18}>
              <Col span={12}>
                <Form.Item label="ยื่นคำขอเมื่อวันที่ :">
                  <span>
                    {record.createdAt
                      ? new Date(record.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="อัปเดตล่าสุดวันที่ :">
                  <span>
                    {record.updatedAt
                      ? new Date(record.updatedAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Card>
    </Modal>
  );
};

export default OfficialTravelRequestDetail;
