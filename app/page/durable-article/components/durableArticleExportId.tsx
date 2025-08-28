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
      // เตรียมข้อมูลให้อยู่ในรูปแบบ Array of Objects
      const data = [
        {
          รหัส: record.code,
          วันที่ได้มา: record.acquiredDate
            ? new Date(record.acquiredDate).toLocaleDateString("th-TH")
            : "-",
          รายละเอียด: record.description,
          ราคาต่อหน่วย: record.unitPrice,
          ประเภทการได้มา: record.acquisitionType,
          อายุการใช้งานปี: record.usageLifespanYears,
          ค่าเสื่อมต่อเดือน: record.monthlyDepreciation,
          ค่าเสื่อมต่อปี: record.yearlyDepreciation ?? "-",
          ค่าเสื่อมสะสม: record.accumulatedDepreciation ?? "-",
          มูลค่าสุทธิ: record.netValue ?? "-",
          หมายเหตุ: record.note ?? "-",
        },
      ];

      // แปลงเป็น worksheet
      const ws = XLSX.utils.json_to_sheet(data);

      // สร้าง workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DurableArticle");

      // ดาวน์โหลดเป็นไฟล์
      XLSX.writeFile(wb, `DurableArticle_${record.code}.xlsx`);

      message.success("ส่งออกข้อมูลสำเร็จ");
    } catch (error) {
      console.error("Export Error:", error);
      message.error("ไม่สามารถส่งออกข้อมูลได้");
    }
  };

  return (
    <Button size="small" type="primary" onClick={handleExport}>
      Export Excel
    </Button>
  );
};

export default DurableArticleExport;
