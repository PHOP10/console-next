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
              <Form.Item label="วันที่เริ่มต้น :">
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
                <span>{record.status ?? "-"}</span>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="อนุมัติโดย :">
                <span>
                  {record.approvedByName
                    ? `${record.approvedByName} (${record.approvedById})`
                    : "-"}
                </span>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="วันที่อนุมัติ :">
                <span>
                  {record.approvedDate
                    ? new Date(record.approvedDate).toLocaleDateString("th-TH")
                    : "-"}
                </span>
              </Form.Item>
            </Col>

            <Col span={12}>
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

          <Row gutter={18}>
            <Col span={24}>
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
        </Form>
      )}
    </Modal>
  );
};

export default DataLeaveDetail;
