"use client";

import { Modal, Form, Table, Row, Col } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { Input } from "antd";

interface Props {
  record: any;
  open: boolean;
  onClose: () => void;
}

export default function MedicalEquipmentTableDetails({
  record,
  open,
  onClose,
}: Props) {
  const [formDetails] = Form.useForm();
  const { TextArea } = Input;

  const columnsDetails = [
    {
      title: "ชื่ออุปกรณ์",
      dataIndex: ["medicalEquipment", "equipmentName"],
      key: "equipmentName",
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
    },
  ];

  return (
    <Modal
      title="รายละเอียดการส่งเครื่องมือ"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Form form={formDetails} layout="vertical" initialValues={record}>
        {/* ตารางรายการอุปกรณ์ */}
        <Form.Item label="รายการอุปกรณ์ที่ส่ง :">
          <Table
            dataSource={record?.items || []}
            columns={columnsDetails}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="วันที่ส่ง :">
              <span>
                {record?.sentDate
                  ? dayjs(record.sentDate).format("DD/MM/YYYY")
                  : "-"}
              </span>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="ผู้ส่ง :">
              <span>{record?.createdBy}</span>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="สถานะ :">
              <span>
                {record?.status === "pending"
                  ? "รอดำเนินการ"
                  : record?.status === "approve"
                  ? "อนุมัติ"
                  : record?.status === "cancel"
                  ? "ยกเลิก"
                  : record?.status === "return"
                  ? "รับคืนแล้ว"
                  : ""}
              </span>
            </Form.Item>
          </Col>

          <Col span={12}>
            {record?.note && (
              <Form.Item label="รายละเอียด :">
                <TextArea
                  value={record.note}
                  rows={3}
                  readOnly
                  bordered={false}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            )}
          </Col>
        </Row>
        <Row gutter={16}>
          {record ? (
            record.approveBy ? (
              // ✅ กรณีอนุมัติ
              <>
                <Col span={12}>
                  <Form.Item label="ผู้อนุมัติ :">
                    <span>{record.approveBy}</span>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="วันที่อนุมัติ :">
                    <span>
                      {record.approveAt
                        ? dayjs(record.approveAt).format("DD/MM/YYYY")
                        : "-"}
                    </span>
                  </Form.Item>
                </Col>
              </>
            ) : record.nameReason ? (
              // ✅ กรณียกเลิก
              <>
                <Col span={12}>
                  <Form.Item label="ผู้ยกเลิก :">
                    <span>{record.nameReason}</span>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="วันที่ยกเลิก :">
                    <span>
                      {record.createdAt
                        ? dayjs(record.createdAt).format("DD/MM/YYYY")
                        : "-"}
                    </span>
                  </Form.Item>
                </Col>
              </>
            ) : (
              <></>
            )
          ) : null}
        </Row>
        <Row gutter={16}>
          {record?.returnName && (
            <Col span={12}>
              <Form.Item label="ผู้รับคืน :">
                <span>{record.returnName}</span>
              </Form.Item>
            </Col>
          )}

          {record?.returndAt && (
            <Col span={12}>
              <Form.Item label="วันที่รับคืน :">
                <span>{dayjs(record.returndAt).format("DD/MM/YYYY")}</span>
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            {record?.cancelReason && (
              <Form.Item label="เหตุผลยกเลิก :">
                <TextArea
                  value={record.cancelReason}
                  rows={2}
                  readOnly
                  bordered={false}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            )}
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
