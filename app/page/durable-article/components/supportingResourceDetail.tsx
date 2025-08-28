"use client";

import { Modal, Form, Row, Col, Input } from "antd";
import dayjs from "dayjs";
import { SupportingResourceType } from "../../common";

interface Props {
  open: boolean;
  onClose: () => void;
  record?: SupportingResourceType | null;
}

export default function SupportingResourceDetail({
  open,
  onClose,
  record,
}: Props) {
  const { TextArea } = Input;

  return (
    <Modal
      title="รายละเอียดวัสดุสนับสนุน"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {record ? (
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="เลขที่หรือรหัส :">
                <span>{record.code || "-"}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ :">
                <TextArea
                  value={record.name}
                  rows={2}
                  readOnly
                  bordered={false}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="วัน เดือน ปี :">
                <span>
                  {record.acquiredDate
                    ? dayjs(record.acquiredDate).format("DD/MM/YYYY")
                    : "-"}
                </span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="วิธีการได้มา :">
                <TextArea
                  value={record.acquisitionType}
                  rows={2}
                  readOnly
                  bordered={false}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="ผู้เพิ่มข้อมูล :">
                <span>{record.createdBy || "-"}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="วันที่เพิ่มข้อมูล:">
                <span>
                  {record.createdAt
                    ? dayjs(record.createdAt).format("DD/MM/YYYY")
                    : "-"}
                </span>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="หมายเหตุ :">
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
              <Form.Item label="วันที่แก้ไขล่าสุด :">
                <span>
                  {record.updatedAt
                    ? dayjs(record.updatedAt).format("DD/MM/YYYY HH:mm")
                    : "-"}
                </span>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ) : (
        <p>ไม่พบข้อมูล</p>
      )}
    </Modal>
  );
}
