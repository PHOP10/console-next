// DataLeaveDetail.tsx

import { Modal, Form, Row, Col, Input, Tag, Button, Tooltip, Card } from "antd";
import { User } from "next-auth";
import { UserType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { FileOutlined } from "@ant-design/icons";
import { DataLeaveService } from "../services/dataLeave.service";

interface DataLeaveDetailProps {
  open: boolean;
  onClose: () => void;
  record: any;
  user: UserType[];
}

const DataLeaveDetail: React.FC<DataLeaveDetailProps> = ({
  open,
  onClose,
  record,
  user,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);
  const { TextArea } = Input;

  const fileUrl = record?.fileName
    ? intraAuthService.getFileUrl(record.fileName)
    : "";

  const getStatusTag = (status: string) => {
    switch (status) {
      case "pending":
        return <Tag color="orange">รอดำเนินการ</Tag>;
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
        <div
          style={{
            textAlign: "center",
            color: "#0683e9",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          รายละเอียดการลา
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
            <Row gutter={18}>
              <Col span={12}>
                <Form.Item label="ประเภทการลา :">
                  <span>{record.masterLeave?.leaveType || "-"}</span>
                </Form.Item>
              </Col>
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
            </Row>

            <Row gutter={18}>
              <Col span={12}>
                <Form.Item label="ตั้งแต่วันที่ :">
                  {/* <span>
                  {record.dateStart
                    ? new Date(record.dateStart).toLocaleDateString("th-TH")
                    : "-"}
                </span> */}
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
                <Form.Item label="ถึงวันที่ :">
                  {/* <span>
                  {record.dateEnd
                    ? new Date(record.dateEnd).toLocaleDateString("th-TH")
                    : "-"}
                </span> */}
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
              {" "}
              <Col span={12}>
                <Form.Item label="เบอร์ติดต่อระหว่างลา :">
                  <span>{record.contactPhone}</span>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="ผู้รับผิดชอบงานระหว่างลา :">
                  <span>
                    {user.find((u) => u.userId === record.backupUserId)
                      ? `${
                          user.find((u) => u.userId === record.backupUserId)
                            ?.firstName
                        } ${
                          user.find((u) => u.userId === record.backupUserId)
                            ?.lastName
                        }`
                      : "-"}
                  </span>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={18}>
              <Col span={12}>
                <Form.Item label="หมายเหตุเพิ่เติม :">
                  <TextArea
                    value={record.details}
                    rows={2}
                    readOnly
                    bordered={false}
                    style={{ resize: "none" }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="ไฟล์ใบรับรองแพทย์ :">
                  {record?.fileName ? (
                    <Button
                      type="link"
                      onClick={() =>
                        window.open(
                          intraAuthService.getFileUrl(record.fileName),
                          "_blank"
                        )
                      }
                    >
                      เปิดดูไฟล์
                    </Button>
                  ) : (
                    <span>-</span>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="สถานะ :">{getStatusTag(record.status)}</Form.Item>
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
      </Card>
    </Modal>
  );
};

export default DataLeaveDetail;
