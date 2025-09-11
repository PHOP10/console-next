// MaCarDetail.tsx

import { Modal, Form, Row, Col, Input } from "antd";

interface MaCarDetailProps {
  open: boolean;
  onClose: () => void;
  record: any;
}

const MaCarDetail: React.FC<MaCarDetailProps> = ({ open, onClose, record }) => {
  const { TextArea } = Input;

  return (
    <Modal
      title="รายละเอียดการจองรถ"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {record && (
        <Form layout="vertical">
          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="ผู้ขอรถ :">
                <span>{record.requesterName || "-"}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="วัตถุประสงค์ :">
                <TextArea
                  value={record.purpose}
                  rows={2}
                  readOnly
                  bordered={false}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="วันที่เริ่มใช้รถ :">
                <span>
                  {record.dateStart
                    ? new Date(record.dateStart).toLocaleDateString("th-TH")
                    : "-"}
                </span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="วันที่สิ้นสุด :">
                <span>
                  {record.dateEnd
                    ? new Date(record.dateEnd).toLocaleDateString("th-TH")
                    : "-"}
                </span>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="จุดหมาย :">
                <span>{record.destination || "-"}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="จำนวนผู้โดยสาร :">
                <span>{record.passengers || 0}</span>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={24}>
              <Form.Item label="รายชื่อผู้โดยสาร :">
                <TextArea
                  value={
                    record.dataUser
                      ? record.dataUser
                          .filter((u: any) =>
                            record.passengerNames?.includes(u.userId)
                          )
                          .map((u: any) => `${u.firstName} ${u.lastName}`)
                          .join("\n") // 👈 ขึ้นบรรทัดใหม่
                      : record.passengerNames?.join("\n")
                  }
                  rows={3}
                  readOnly
                  bordered={false}
                  style={{ resize: "none", whiteSpace: "pre-line" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="งบประมาณ :">
                <span>{record.budget ? `${record.budget} บาท` : "-"}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="สถานะ :">
                <span>
                  {record?.status === "available"
                    ? "รอดำเนินการ"
                    : record?.status === "approve"
                    ? "อนุมัติ"
                    : record?.status === "cancel"
                    ? "ยกเลิก"
                    : record?.status}
                </span>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="รถที่ใช้ :">
                <span>
                  {record.masterCar
                    ? `${record.masterCar.carName} (${record.masterCar.licensePlate})`
                    : "-"}
                </span>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            {record.approvedByName && record.approvedAt ? (
              <>
                <Col span={12}>
                  <Form.Item label="ผู้อนุมัติ :">
                    <span>{record.approvedByName}</span>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="วันที่อนุมัติ :">
                    <span>
                      {new Date(record.approvedAt).toLocaleDateString("th-TH")}
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
                      {new Date(record.cancelAt).toLocaleDateString("th-TH")}
                    </span>
                  </Form.Item>
                </Col>
              </>
            ) : null}
          </Row>

          {record.cancelReason && record.cancelAt ? (
            <Row gutter={18}>
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
            </Row>
          ) : null}
        </Form>
      )}
    </Modal>
  );
};

export default MaCarDetail;
