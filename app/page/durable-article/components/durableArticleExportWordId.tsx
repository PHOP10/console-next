"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Button } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

interface DurableArticleExportWordProps {
  record: any;
}

const DurableArticleExportWord: React.FC<DurableArticleExportWordProps> = ({
  record,
}) => {
  const handleExport = async () => {
    try {
      // โหลด template Word
      const response = await fetch("/durableArticlesTemplate.docx");
      if (!response.ok)
        throw new Error("ไม่สามารถโหลด durableArticlesTemplate.docx");
      const arrayBuffer = await response.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        // delimiters: { start: "{", end: "}" }, // ✅ ใช้วงเล็บเดียว
      });

      // เตรียมข้อมูล
      const data = {
        // วัน เดือน ปี
        acDate: record.acquiredDate
          ? dayjs(record.acquiredDate).format("D MMMM BBBB")
          : "-",

        // ตาราง (แถวเดียว หรือสามารถทำเป็น array)
        id: record.id ?? "-",
        code: record.code ?? "-",
        attributes: record.attributes ?? "-",
        items: [
          {
            id: record.id ?? "-", // ลำดับ
            docId: record.documentId ?? "-", // ที่เอกสาร
            desc: record.description ?? "-", // รายการ
            code: record.code ?? "-", // หมายเลขและทะเบียน
            attributes: record.attributes ?? "-", // ลักษณะ/คุณสมบัติ
            unitPrice: record.unitPrice?.toLocaleString("th-TH") ?? "-",
            usLY: record.usageLifespanYears ?? "-",
            moD: record.monthlyDepreciation?.toLocaleString("th-TH") ?? "-",
            accumulatedDepreciation:
              record.accumulatedDepreciation?.toLocaleString("th-TH") ?? "-",
            netV: record.netValue?.toLocaleString("th-TH") ?? "-",
            note: record.note ?? "-",
            responsibleAgency: record.responsibleAgency ?? "-",
            category: record.category ?? "-", // ประเภท
            acDate: record.acquiredDate
              ? dayjs(record.acquiredDate).format("D MMMM BBBB")
              : "-",
          },
        ],

        // ฟิลด์อื่นๆ
        category: record.category ?? "-",
        responsibleAgency: record.responsibleAgency ?? "-",
      };

      // render ลง template
      doc.render(data);

      // บันทึกไฟล์
      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(blob, `ครุภัณฑ์_${record.code}.docx`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button size="small" type="primary" onClick={handleExport}>
      Export
    </Button>
  );
};

export default DurableArticleExportWord;
