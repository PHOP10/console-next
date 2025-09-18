"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Button } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

interface DataLeaveWordProps {
  record: any; // ควรเป็น DataLeave type
  backupUserName?: string; // ถ้าอยากแสดงชื่อผู้รับผิดชอบงาน
  masterLeaves?: any[]; // ควรเป็น MasterLeaveType[]
}

const DataLeaveWord: React.FC<DataLeaveWordProps> = ({
  record,
  backupUserName,
  masterLeaves = [],
}) => {
  const handleExport = async () => {
    try {
      const response = await fetch("/dataLeaveTemplate.docx");
      if (!response.ok) throw new Error("ไม่สามารถโหลด template.docx");
      const arrayBuffer = await response.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      //   console.log("record for word:", masterLeaves);
      console.log("record:", record.masterLeave);

      // แปลง typeId เป็นตัวแปร {1}, {2}, {3} แบบ dynamic
      let leave1 = "-";
      let leave2 = "-";
      let leave3 = "-";

      // ตรวจสอบประเภทการลา
      const masterLeave = record.masterLeave;
      if (masterLeave) {
        switch (masterLeave.leaveType) {
          case "ลาป่วย":
            leave1 = "{1}"; // ใส่เครื่องหมาย {1} เฉพาะลาป่วย
            break;
          case "ลากิจ":
            leave2 = "{2}"; // ใส่ {2} เฉพาะลากิจ
            break;
          case "ลาคลอด":
            leave3 = "{3}"; // ใส่ {3} เฉพาะลาคลอด
            break;
          default:
            // กรณีอื่น ๆ ไม่ต้องใส่อะไร
            break;
        }
      }

      const data = {
        // reason: record.reason || "-",
        // reason: reasonVariable,
        "1": leave1,
        "2": leave2,
        "3": leave3,
        dateStart: record.dateStart
          ? `${dayjs(record.dateStart).format("D MMMM")} ${
              dayjs(record.dateStart).year() + 543
            }`
          : "-",
        dateEnd: record.dateEnd
          ? `${dayjs(record.dateEnd).format("D MMMM")} ${
              dayjs(record.dateEnd).year() + 543
            }`
          : "-",

        writeAt: record.writeAt || "-",
        contactAddress: record.contactAddress || "-",
        contactPhone: record.contactPhone || "-",
        backupUser: backupUserName || "-",
        details: record.details || "-",
        status: record.status || "-",
        approvedBy: record.approvedByName || "-",
        approvedDate: record.approvedDate
          ? dayjs(record.approvedDate).format("D MMMM BBBB")
          : "-",
        createdBy: record.createdName || "-",
        createdAt: record.createdAt
          ? dayjs(record.createdAt).format("D MMMM BBBB")
          : "-",
        D: record.createdAt ? dayjs(record.createdAt).format("D") : "-",
        MM: record.createdAt
          ? dayjs(record.createdAt).locale("th").format("MMMM")
          : "-",
        BBBB: record.createdAt ? dayjs(record.createdAt).year() + 543 : "-",
      };

      doc.render(data);

      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(blob, `ใบลาครั้งที่_${record.id}.docx`);
    } catch (error) {
      console.error("Export Word error:", error);
    }
  };

  return (
    <Button
      size="small"
      type="primary"
      onClick={handleExport}
      disabled={record.status !== "pending"}
    >
      Export Word
    </Button>
  );
};

export default DataLeaveWord;
