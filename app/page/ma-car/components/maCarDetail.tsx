// MaCarDetail.tsx

import { Modal, Form, Row, Col, Input, Space, Tag } from "antd";
import { MaCarType, UserType } from "../../common";

interface MaCarDetailProps {
  open: boolean;
  onClose: () => void;
  record: any;
  dataUser?: UserType[];
}

const MaCarDetail: React.FC<MaCarDetailProps> = ({ open, onClose, record }) => {
  const { TextArea } = Input;

  const getStatusTag = (status: string) => {
    switch (status) {
      case "pending":
        return <Tag color="orange">รอดำเนินการ</Tag>;
      case "approve":
        return <Tag color="green">อนุมัติ</Tag>;
      case "cancel":
        return <Tag color="red">ยกเลิก</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

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
              <Form.Item label="เรียน :">
                <span>{record.recipient || "-"}</span>
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
              <Form.Item label="ตั้งแต่วันที่ :">
                <span>
                  {record.dateStart
                    ? new Date(record.dateStart).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="ตั้งแต่วันที่ :">
                <span>
                  {record.dateEnd
                    ? new Date(record.dateEnd).toLocaleDateString("th-TH", {
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
              <Form.Item label="สถานที่ :">
                <TextArea
                  value={record.destination}
                  rows={2}
                  readOnly
                  bordered={false}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="งบประมาณ :">
                <span>{record.budget}</span>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="จำนวนผู้โดยสาร :">
                <span>{record.passengers || 0}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="รายชื่อผู้โดยสาร :">
                <Space wrap>
                  {record.dataUser
                    ? record.dataUser
                        .filter((u: any) =>
                          record.passengerNames?.includes(u.userId)
                        )
                        .map((u: any) => (
                          <Tag key={u.userId} color="blue">
                            {u.firstName} {u.lastName}
                          </Tag>
                        ))
                    : record.passengerNames?.map(
                        (name: string, index: number) => (
                          <Tag key={index} color="blue">
                            {name}
                          </Tag>
                        )
                      )}
                </Space>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="ขอคนขับรถ :">
                <span>
                  {record?.driver === "yes"
                    ? "ขอพนักงานขับรถส่วนกลาง"
                    : record?.driver === "no"
                    ? "ไม่ขอพนักงานขับรถส่วนกลาง"
                    : "-"}
                </span>
              </Form.Item>
            </Col>
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
            <Col span={12}>
              <Form.Item label="สถานะ :">
                {getStatusTag(record.status)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="เหตุผลเพิ่มเติม">
                <TextArea
                  value={record.note}
                  rows={2}
                  readOnly
                  bordered={false}
                  style={{ resize: "none" }}
                />
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
                      {record.approvedAt
                        ? new Date(record.approvedAt).toLocaleDateString(
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
    </Modal>
  );
};

export default MaCarDetail;
