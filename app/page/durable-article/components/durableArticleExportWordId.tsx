"use client";

import { Button, message } from "antd";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  TextRun,
  TableLayoutType,
  AlignmentType,
  HeadingLevel,
  PageOrientation,
} from "docx";
import { saveAs } from "file-saver";

interface DurableArticleExportWordProps {
  record: any;
}

const DurableArticleExportWord: React.FC<DurableArticleExportWordProps> = ({
  record,
}) => {
  const handleExportWord = async () => {
    try {
      const headers = [
        "รหัส",
        "วันที่ได้มา",
        "รายละเอียด",
        "ราคาต่อหน่วย",
        "ประเภทการได้มา",
        "อายุการใช้งาน (ปี)",
        "ค่าเสื่อม/เดือน",
        "ค่าเสื่อมสะสม",
        "มูลค่าสุทธิ",
        "หมายเหตุ",
      ];

      const values = [
        record.code,
        record.acquiredDate
          ? new Date(record.acquiredDate).toLocaleDateString("th-TH")
          : "-",
        record.description,
        record.unitPrice,
        record.acquisitionType,
        record.usageLifespanYears,
        record.monthlyDepreciation,
        // record.yearlyDepreciation ?? "-",
        record.accumulatedDepreciation ?? "-",
        record.netValue ?? "-",
        record.note ?? "-",
      ];

      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
          new TableRow({
            children: headers.map(
              (h) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: h,
                          bold: true,
                          font: "TH Sarabun New", // ฟอนต์ header
                          size: 24, // ขนาด 12pt (docx ใช้ half-points)
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                })
            ),
          }),
          new TableRow({
            children: values.map(
              (v) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: String(v),
                          font: "TH Sarabun New", // ฟอนต์ข้อมูล
                          size: 22, // ขนาด 11pt
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                })
            ),
          }),
        ],
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: { size: { orientation: PageOrientation.LANDSCAPE } },
            },
            children: [
              // หัวข้อกลาง
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: "ทะเบียนคุมทรัพย์สิน",
                    font: "TH Sarabun New",
                    size: 32,
                    bold: true,
                  }),
                ],
              }),

              // ข้อความชิดซ้าย
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { after: 100 },
                children: [
                  new TextRun({
                    text: `แผ่นที่: 202`,
                    font: "TH Sarabun New",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { after: 100 },
                children: [
                  new TextRun({
                    text: `ประเภท: ครุภัณฑ์`,
                    font: "TH Sarabun New",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: `รหัส: ${record.code}`,
                    font: "TH Sarabun New",
                    size: 24,
                  }),
                ],
              }),

              // ตาราง
              table,
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `ทะเบียนคุมทรัพย์สิน_${record.code}.docx`);
      message.success("ส่งออก Word สำเร็จ");
    } catch (error) {
      console.error(error);
      message.error("ไม่สามารถส่งออก Word ได้");
    }
  };

  return (
    <Button size="small" type="primary" onClick={handleExportWord}>
      Export Word
    </Button>
  );
};

export default DurableArticleExportWord;
