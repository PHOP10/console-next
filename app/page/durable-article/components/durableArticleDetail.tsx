// DurableArticleDetail.tsx

import { Modal, Form, Row, Col, Input } from "antd";

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
  const { TextArea } = Input;

  return (
    <Modal
      title="รายละเอียดครุภัณฑ์"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {record && (
        <Form layout="vertical">
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item label="เลขที่หรือรหัส :">
                <span>{record.code || "-"}</span>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="วัน เดือน ปี :">
                <span>
                  {record.acquiredDate
                    ? new Date(record.acquiredDate).toLocaleDateString("th-TH")
                    : "-"}
                </span>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ :">
                <TextArea
                  value={record.description}
                  rows={3}
                  readOnly
                  bordered={false}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="ราคาต่อหน่วย :">
                <span>{record.unitPrice ?? "-"}</span>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="ประเภทการได้มา :">
                <TextArea
                  value={record.acquisitionType}
                  rows={3}
                  readOnly
                  bordered={false}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="อายุการใช้งาน (ปี) :">
                <span>{record.usageLifespanYears ?? "-"}</span>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="ค่าเสื่อม/เดือน :">
                <span>{record.monthlyDepreciation ?? "-"}</span>
              </Form.Item>
            </Col>

            <Col span={12}>
              {/* <Form.Item label="ค่าเสื่อม/ปี :">
                <span>{record.yearlyDepreciation ?? "-"}</span>
              </Form.Item> */}
              <Form.Item label="ค่าเสื่อมสะสม :">
                <span>{record.accumulatedDepreciation ?? "-"}</span>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="มูลค่าสุทธิ :">
                <span>{record.netValue ?? "-"}</span>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="หมายเหตุ :">
                <TextArea
                  value={record.note}
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

export default DurableArticleDetail;
