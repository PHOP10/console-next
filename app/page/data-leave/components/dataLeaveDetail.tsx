// DataLeaveDetail.tsx

import { Modal, Form, Row, Col, Input } from "antd";

interface DataLeaveDetailProps {
  open: boolean;
  onClose: () => void;
  record: any;
}

const DataLeaveDetail: React.FC<DataLeaveDetailProps> = ({
  open,
  onClose,
  record,
}) => {
  const { TextArea } = Input;

  return (
    <Modal
      title="รายละเอียดการลา"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {record && (
        <Form layout="vertical">
          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="เหตุผลการลา :">
                <TextArea
                  value={record.reason}
                  rows={2}
                  readOnly
                  bordered={false}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="ประเภทการลา :">
                <span>{record.masterLeave?.leaveType || "-"}</span>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="วันที่เริ่มลา :">
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
              <Form.Item label="สถานะ :">
                <span>
                  {record?.status === "pending"
                    ? "รอดำเนินการ"
                    : record?.status === "approve"
                    ? "อนุมัติ"
                    : record?.status === "cancel"
                    ? "ยกเลิก"
                    : ""}
                </span>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="รายละเอียดเพิ่มเติม :">
                <TextArea
                  value={record.details}
                  rows={3}
                  readOnly
                  bordered={false}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            {record.approvedByName && record.approvedDate ? (
              <>
                <Col span={12}>
                  <Form.Item label="ผู้อนุมัติ :">
                    <span>{`${record.approvedByName} `}</span>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="วันที่อนุมัติ :">
                    <span>
                      {new Date(record.approvedDate).toLocaleDateString(
                        "th-TH"
                      )}
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

          <Row gutter={18}>
            {record.cancelReason && record.cancelAt ? (
              <Col span={12}>
                <Form.Item label="เหตุผลการยกเลิก :">
                  <span>{record.cancelReason}</span>
                </Form.Item>
              </Col>
            ) : null}
          </Row>
        </Form>
      )}
    </Modal>
  );
};

export default DataLeaveDetail;
