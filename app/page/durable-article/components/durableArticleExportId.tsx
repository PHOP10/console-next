// DurableArticleExport.tsx
import { Button, message } from "antd";
import * as XLSX from "xlsx";

interface DurableArticleExportProps {
  record: any;
}

const DurableArticleExport: React.FC<DurableArticleExportProps> = ({
  record,
}) => {
  const handleExport = () => {
    try {
      const data = [
        {
          รหัส: record.code,
          วันที่ได้มา: record.acquiredDate
            ? new Date(record.acquiredDate).toLocaleDateString("th-TH")
            : "-",
          รายละเอียด: record.description ?? "-",
          ราคาต่อหน่วย: record.unitPrice ?? "-",
          ประเภทการได้มา: record.acquisitionType ?? "-",
          อายุการใช้งานปี: record.usageLifespanYears ?? "-",
          ค่าเสื่อมต่อเดือน: record.monthlyDepreciation ?? "-",
          ค่าเสื่อมต่อปี: record.yearlyDepreciation ?? "-",
          ค่าเสื่อมสะสม: record.accumulatedDepreciation ?? "-",
          มูลค่าสุทธิ: record.netValue ?? "-",
          หมายเหตุ: record.note ?? "-",
        },
      ];

      // สร้าง worksheet เปล่า
      const ws = XLSX.utils.json_to_sheet([]);

      // เพิ่ม title ในแถวแรก
      XLSX.utils.sheet_add_aoa(ws, [["ครุภัณฑ์ทั้งหมด"]], { origin: "A1" });

      // เพิ่มข้อมูลเริ่มต้นจากแถว 2
      XLSX.utils.sheet_add_json(ws, data, { origin: "A2" });

      // กำหนด column widths ให้ถูกต้อง (หลังจากเพิ่มข้อมูลแล้ว)
      const colCount = Object.keys(data[0]).length;
      ws["!cols"] = [
        { wch: 12 }, // รหัส
        { wch: 18 }, // วันที่ได้มา
        { wch: 35 }, // รายละเอียด
        { wch: 15 }, // ราคาต่อหน่วย
        { wch: 20 }, // ประเภทการได้มา
        { wch: 18 }, // อายุการใช้งานปี
        { wch: 18 }, // ค่าเสื่อมต่อเดือน
        { wch: 18 }, // ค่าเสื่อมต่อปี
        { wch: 18 }, // ค่าเสื่อมสะสม
        { wch: 15 }, // มูลค่าสุทธิ
        { wch: 25 }, // หมายเหตุ
      ];

      // Merge title cell ให้ครอบคลุมทุกคอลัมน์
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }];

      // จัดรูปแบบ title cell (ตรงกลาง, ตัวหนา)
      const titleCell = ws["A1"];
      if (titleCell) {
        titleCell.s = {
          font: { bold: true, sz: 14 },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }

      // สร้าง workbook และเพิ่ม worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "ครุภัณฑ์");

      // สร้างชื่อไฟล์ที่ปลอดภัย (กรองอักขระพิเศษออก)
      const safeFileName = `ครุภัณฑ์_${
        record.code?.toString().replace(/[^\w\s-]/g, "") || "unknown"
      }.xlsx`;

      // ดาวน์โหลดไฟล์
      XLSX.writeFile(wb, safeFileName);

      message.success("ส่งออกข้อมูลสำเร็จ");
    } catch (error) {
      console.error("Export Error:", error);
      message.error("ไม่สามารถส่งออกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <Button
      size="small"
      type="primary"
      onClick={handleExport}
      disabled={!record} // ป้องกันการ export เมื่อไม่มีข้อมูล
    >
      Export Excel
    </Button>
  );
};

export default DurableArticleExport;
