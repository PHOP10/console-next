"use client";

import { Modal, Table, Row, Col, Tag, Card } from "antd";
import dayjs from "dayjs";
import { Input } from "antd";
import "../../../../app/globals.css";

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
  const { TextArea } = Input;

  const columnsDetails = [
    {
      title: "รายการ/ชื่อเครื่องมือ",
      dataIndex: ["medicalEquipment", "equipmentName"],
      key: "equipmentName",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (quantity: number) => (
        <Tag color="blue" className="text-sm px-3 py-1 rounded-md">
          {quantity} ชิ้น
        </Tag>
      ),
    },
  ];

  // ฟังก์ชันช่วยจัด label + value
  const InfoItem = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | null;
  }) => (
    <div className="flex items-center space-x-2 mb-2">
      <span className="font-medium text-gray-700">{label}</span>
      <span>{value || "-"}</span>
    </div>
  );

  return (
    <Modal
      title="รายละเอียดการส่งเครื่องมือ"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div className="space-y-6">
        {/* ตารางรายการอุปกรณ์ */}
        <Card>
          <Table
            dataSource={record?.items || []}
            columns={columnsDetails}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            className="rounded-lg overflow-hidden [&_.ant-table-thead>tr>th]:bg-green-200 [&_.ant-table-thead>tr>th]:font-semibold"
            rowClassName={(_, index) =>
              index % 2 === 0
                ? "bg-purple-50 hover:bg-purple-100"
                : "bg-white hover:bg-purple-100"
            }
          />
        </Card>
        <Card>
          {/* ข้อมูลเพิ่มเติม */}
          <Row gutter={16}>
            <Col span={12}>
              <InfoItem
                label="วันที่ส่ง :"
                value={
                  record?.sentDate
                    ? dayjs(record.sentDate).format("DD/MM/YYYY")
                    : null
                }
              />
            </Col>
            <Col span={12}>
              <InfoItem label="ผู้ส่ง :" value={record?.createdBy} />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-gray-700">สถานะ :</span>
                {record?.status === "pending" && (
                  <Tag color="orange">รอดำเนินการ</Tag>
                )}
                {record?.status === "approve" && (
                  <Tag color="green">อนุมัติ</Tag>
                )}
                {record?.status === "cancel" && <Tag color="red">ยกเลิก</Tag>}
                {record?.status === "return" && (
                  <Tag color="blue">รับคืนแล้ว</Tag>
                )}
              </div>
            </Col>

            <Col span={12}>
              {record?.note && (
                <div>
                  <span className="font-medium text-gray-700">
                    รายละเอียด :
                  </span>
                  <TextArea
                    value={record.note}
                    rows={3}
                    readOnly
                    bordered={false}
                    style={{ resize: "none" }}
                    className="bg-purple-50 rounded-lg mt-1"
                  />
                </div>
              )}
            </Col>
          </Row>

          {/* ผู้อนุมัติ / ยกเลิก */}
          {record && (
            <Row gutter={16}>
              {record.approveBy && (
                <>
                  <Col span={12}>
                    <InfoItem label="ผู้อนุมัติ :" value={record.approveBy} />
                  </Col>
                  <Col span={12}>
                    <InfoItem
                      label="วันที่อนุมัติ :"
                      value={
                        record.approveAt
                          ? dayjs(record.approveAt).format("DD/MM/YYYY")
                          : null
                      }
                    />
                  </Col>
                </>
              )}

              {record.nameReason && (
                <>
                  <Col span={12}>
                    <InfoItem label="ผู้ยกเลิก :" value={record.nameReason} />
                  </Col>
                  <Col span={12}>
                    <InfoItem
                      label="วันที่ยกเลิก :"
                      value={
                        record.createdAt
                          ? dayjs(record.createdAt).format("DD/MM/YYYY")
                          : null
                      }
                    />
                  </Col>
                </>
              )}
            </Row>
          )}

          {/* รับคืน */}
          {record?.returnName || record?.returndAt ? (
            <Row gutter={16}>
              {record?.returnName && (
                <Col span={12}>
                  <InfoItem label="ผู้รับคืน :" value={record.returnName} />
                </Col>
              )}
              {record?.returndAt && (
                <Col span={12}>
                  <InfoItem
                    label="วันที่รับคืน :"
                    value={dayjs(record.returndAt).format("DD/MM/YYYY")}
                  />
                </Col>
              )}
            </Row>
          ) : null}

          {/* เหตุผลยกเลิก */}
          {record?.cancelReason && (
            <div>
              <span className="font-medium text-gray-700">เหตุผลยกเลิก :</span>
              <TextArea
                value={record.cancelReason}
                rows={2}
                readOnly
                bordered={false}
                style={{ resize: "none" }}
                className="bg-purple-50 rounded-lg mt-1"
              />
            </div>
          )}
        </Card>
      </div>
    </Modal>
  );
}
