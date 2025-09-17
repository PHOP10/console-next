// "use client";

// import {
//   Document,
//   Packer,
//   Paragraph,
//   TextRun,
//   Table,
//   TableRow,
//   TableCell,
//   WidthType,
//   AlignmentType,
// } from "docx";
// import { saveAs } from "file-saver";
// import dayjs from "dayjs";
// import { Button } from "antd";
// import "dayjs/locale/th";

// dayjs.locale("th");

// interface ExportMedicalEquipmentWordProps {
//   record: any;
// }

// const ExportMedicalEquipmentWord: React.FC<ExportMedicalEquipmentWordProps> = ({
//   record,
// }) => {
//   const handleExport = async () => {
//     const tableHeader = new TableRow({
//       children: [
//         new TableCell({
//           children: [
//             new Paragraph({
//               children: [
//                 new TextRun({
//                   text: "ลำดับที่",
//                   font: "TH Sarabun New",
//                   bold: true,
//                 }),
//               ],
//               alignment: AlignmentType.CENTER,
//             }),
//           ],
//           width: { size: 10, type: WidthType.PERCENTAGE },
//         }),
//         new TableCell({
//           children: [
//             new Paragraph({
//               children: [
//                 new TextRun({
//                   text: "รายการ/ชื่อเครื่องมือ",
//                   font: "TH Sarabun New",
//                   bold: true,
//                 }),
//               ],
//               alignment: AlignmentType.CENTER,
//             }),
//           ],
//           width: { size: 70, type: WidthType.PERCENTAGE },
//         }),
//         new TableCell({
//           children: [
//             new Paragraph({
//               children: [
//                 new TextRun({
//                   text: "จำนวน",
//                   font: "TH Sarabun New",
//                   bold: true,
//                 }),
//               ],
//               alignment: AlignmentType.CENTER,
//             }),
//           ],
//           width: { size: 20, type: WidthType.PERCENTAGE },
//         }),
//         new TableCell({
//           children: [
//             new Paragraph({
//               children: [
//                 new TextRun({
//                   text: "หมายเหตุ",
//                   font: "TH Sarabun New",
//                   bold: true,
//                 }),
//               ],
//               alignment: AlignmentType.CENTER,
//             }),
//           ],
//           width: { size: 50, type: WidthType.PERCENTAGE },
//         }),
//       ],
//     });

//     const tableRows = (record.items || []).map(
//       (item: any, index: number) =>
//         new TableRow({
//           children: [
//             new TableCell({
//               children: [
//                 new Paragraph({
//                   children: [
//                     new TextRun({
//                       text: String(index + 1),
//                       font: "TH Sarabun New",
//                     }),
//                   ],
//                   alignment: AlignmentType.CENTER,
//                 }),
//               ],
//             }),
//             new TableCell({
//               children: [
//                 new Paragraph({
//                   children: [
//                     new TextRun({
//                       text: item.medicalEquipment?.equipmentName || "-",
//                       font: "TH Sarabun New",
//                     }),
//                   ],
//                 }),
//               ],
//             }),
//             new TableCell({
//               children: [
//                 new Paragraph({
//                   children: [
//                     new TextRun({
//                       text: String(item.quantity),
//                       font: "TH Sarabun New",
//                     }),
//                   ],
//                   alignment: AlignmentType.CENTER,
//                 }),
//               ],
//             }),
//             new TableCell({
//               children: [
//                 new Paragraph({
//                   children: [
//                     new TextRun({
//                       text: item.note || "",
//                       font: "TH Sarabun New",
//                     }),
//                   ],
//                 }),
//               ],
//             }),
//           ],
//         })
//     );

//     const doc = new Document({
//       sections: [
//         {
//           properties: {},
//           children: [
//             // หัวข้อใหญ่
//             new Paragraph({
//               children: [
//                 new TextRun({
//                   text: "ชุดเครื่อมือและอุปกรณ์ที่ส่งฆ่าเชื้อจากโรงพยาบาลส่งเสริมสุขภาพบ้านผาผึ้ง",
//                   font: "TH Sarabun New",
//                   bold: true,
//                   size: 32,
//                 }),
//               ],
//               alignment: AlignmentType.CENTER,
//             }),
//             new Paragraph({
//               children: [
//                 new TextRun({
//                   text: "ตำบลเชียงทอง อำเภอวังเจ้า จังหวัดตาก ที่ โรงพยาบาลวังเจ้า",
//                   font: "TH Sarabun New",
//                   bold: true,
//                   size: 32,
//                 }),
//               ],
//               alignment: AlignmentType.CENTER,
//             }),
//             new Paragraph({ text: "" }),

//             // วันที่ส่ง
//             new Paragraph({
//               alignment: AlignmentType.CENTER,
//               children: [
//                 new TextRun({
//                   text: `นำส่งวันที่: ${
//                     record.sentDate
//                       ? dayjs(record.sentDate)
//                           .locale("th")
//                           .format("D MMMM BBBB")
//                       : "-"
//                   }`,
//                   font: "TH Sarabun New",
//                   bold: true,
//                   size: 28,
//                 }),
//               ],
//             }),
//             new Paragraph({ text: "" }),

//             // ตาราง
//             new Table({
//               width: { size: 100, type: WidthType.PERCENTAGE },
//               rows: [tableHeader, ...tableRows],
//             }),

//             new Paragraph({ text: "" }),
//             new Paragraph({ text: "" }),

//             // ผู้ส่ง
//             new Paragraph({
//               children: [
//                 new TextRun({
//                   text: "ผู้ส่ง\n", // ขึ้นบรรทัดใหม่
//                   font: "TH Sarabun New",
//                   bold: true,
//                   size: 28,
//                 }),
//                 new TextRun({
//                   text: record.createdBy || "-",
//                   font: "TH Sarabun New",
//                   size: 28,
//                 }),
//               ],
//             }),
//           ],
//         },
//       ],
//     });

//     const blob = await Packer.toBlob(doc);
//     saveAs(blob, `MedicalEquipment_${record.id}.docx`);
//   };

//   return (
//     <Button size="small" type="primary" onClick={handleExport}>
//       Export Word
//     </Button>
//   );
// };

// export default ExportMedicalEquipmentWord;

"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Button } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

interface ExportMedicalEquipmentWordProps {
  record: any;
}

const ExportMedicalEquipmentWord: React.FC<ExportMedicalEquipmentWordProps> = ({
  record,
}) => {
  const handleExport = async () => {
    // โหลด template Word
    const response = await fetch("/equipmentTemplate.docx");
    if (!response.ok) throw new Error("ไม่สามารถโหลด template.docx");
    const arrayBuffer = await response.arrayBuffer();

    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // เตรียมข้อมูล
    const data = {
      sentDate: record.sentDate
        ? dayjs(record.sentDate).format("D MMMM BBBB")
        : "-",
      createdBy: record.createdBy,
      items: (record.items || []).map((item: any, index: number) => ({
        index: index + 1,
        name: item.medicalEquipment?.equipmentName || "-",
        quantity: item.quantity || "-",
        note: item.note || "",
      })),
    };

    doc.render(data);

    const blob = doc.getZip().generate({ type: "blob" });
    saveAs(blob, `MedicalEquipment_${record.id}.docx`);
  };

  return (
    <Button size="small" type="primary" onClick={handleExport}>
      Export Word
    </Button>
  );
};

export default ExportMedicalEquipmentWord;
