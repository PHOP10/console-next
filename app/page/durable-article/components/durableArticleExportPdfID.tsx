// "use client";

// import { Button, message } from "antd";
// import Script from "next/script";

// interface DurableArticleExportPdfProps {
//   record: any;
// }

// declare let window: any; // ให้ TypeScript รู้จัก

// const DurableArticleExportPdf: React.FC<DurableArticleExportPdfProps> = ({
//   record,
// }) => {
//   const handleExportPdf = () => {
//     if (!window.jspdf || !window.jspdfAutoTable) {
//       message.error("ยังโหลด jsPDF ไม่เสร็จ");
//       return;
//     }

//     const doc = new window.jspdf.jsPDF();
//     const autoTable = window.jspdfAutoTable;

//     const tableData = [
//       ["รหัส", record.code],
//       [
//         "วันที่ได้มา",
//         record.acquiredDate
//           ? new Date(record.acquiredDate).toLocaleDateString("th-TH")
//           : "-",
//       ],
//       ["รายละเอียด", record.description],
//       ["ราคาต่อหน่วย", record.unitPrice],
//       ["ประเภทการได้มา", record.acquisitionType],
//       ["อายุการใช้งาน (ปี)", record.usageLifespanYears],
//       ["ค่าเสื่อม/เดือน", record.monthlyDepreciation],
//       ["ค่าเสื่อม/ปี", record.yearlyDepreciation ?? "-"],
//       ["ค่าเสื่อมสะสม", record.accumulatedDepreciation ?? "-"],
//       ["มูลค่าสุทธิ", record.netValue ?? "-"],
//       ["หมายเหตุ", record.note ?? "-"],
//     ];

//     doc.setFontSize(16);
//     doc.text("รายละเอียดครุภัณฑ์", 14, 20);

//     autoTable(doc, {
//       startY: 30,
//       head: [["ฟิลด์", "ค่า"]],
//       body: tableData,
//     });

//     doc.save(`DurableArticle_${record.code}.pdf`);
//     message.success("ส่งออก PDF สำเร็จ");
//   };

//   return (
//     <>
//       <Script
//         src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
//         strategy="beforeInteractive"
//       />
//       <Script
//         src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"
//         strategy="beforeInteractive"
//       />
//       <Button size="small" onClick={handleExportPdf}>
//         Export PDF
//       </Button>
//     </>
//   );
// };

// export default DurableArticleExportPdf;
