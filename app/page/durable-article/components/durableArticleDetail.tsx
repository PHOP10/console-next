// DurableArticleDetail.tsx

import { Modal, Form, Row, Col, Input } from "antd";
import dayjs from "dayjs";

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
      width={900}
    >
      {record && (
        <Form layout="vertical">
          {/* หมายเลขและวันได้มา */}
          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="เลขที่หรือรหัส :">
                <span>{record.code || "-"}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="หมายเลขทะเบียน :">
                <span>{record.registrationNumber || "-"}</span>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="วัน เดือน ปี ได้มา :">
                <span>
                  {record.acquiredDate
                    ? dayjs(record.acquiredDate).format("DD/MM/YYYY")
                    : "-"}
                </span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="เลขที่เอกสาร :">
                <span>{record.documentId || "-"}</span>
              </Form.Item>
            </Col>
          </Row>

          {/* รายละเอียดครุภัณฑ์ */}
          <Row gutter={18}>
            <Col span={12}>
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
              <Form.Item label="ลักษณะ/คุณสมบัติ :">
                <TextArea
                  value={record.attributes}
                  rows={3}
                  readOnly
                  bordered={false}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="ประเภท :">
                <span>{record.category || "-"}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="วิธีการได้มา :">
                <span>{record.acquisitionType || "-"}</span>
              </Form.Item>
            </Col>
          </Row>

          {/* ค่าใช้จ่ายและการเสื่อม */}
          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="ราคาต่อหน่วย (บาท) :">
                <span>{record.unitPrice ?? "-"}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="อายุการใช้งาน (ปี) :">
                <span>{record.usageLifespanYears ?? "-"}</span>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="ค่าเสื่อมราคาต่อเดือน (บาท) :">
                <span>{record.monthlyDepreciation ?? "-"}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="ค่าเสื่อม/ปี :">
                <span>{record.yearlyDepreciation ?? "-"}</span>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="ค่าเสื่อมสะสม :">
                <span>{record.accumulatedDepreciation ?? "-"}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="มูลค่าสุทธิ :">
                <span>{record.netValue ?? "-"}</span>
              </Form.Item>
            </Col>
          </Row>

          {/* เอกสารและหน่วยงาน */}
          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="เลขที่เอกสาร :">
                <span>{record.documentId || "-"}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="หน่วยงานรับผิดชอบ :">
                <span>{record.responsibleAgency || "-"}</span>
              </Form.Item>
            </Col>
          </Row>

          {/* หมายเหตุ */}
          <Row gutter={18}>
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

          {/* วันที่สร้างและอัปเดต */}
          <Row gutter={18}>
            <Col span={12}>
              <Form.Item label="วันที่บันทึก :">
                <span>
                  {record.createdAt
                    ? dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")
                    : "-"}
                </span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="แก้ไขล่าสุด :">
                <span>
                  {record.updatedAt
                    ? dayjs(record.updatedAt).format("DD/MM/YYYY HH:mm")
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

export default DurableArticleDetail;
