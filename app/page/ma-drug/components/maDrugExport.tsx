import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { MaDrugType, UserType } from "../../common";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { userService } from "../../user/services/user.service";

// Helper แปลงวันที่เป็นพุทธศักราชแบบสั้น (dd/mm/bbbb)
const formatThaiDate = (dateString?: string | Date | null) => {
  if (!dateString) return "-";
  return dayjs(dateString).locale("th").format("DD/MM/BBBB");
};

export const exportMaDrugToExcel = async (data: MaDrugType, intraAuth: any) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ใบเบิกยา");
  const intraAuthUserService = userService(intraAuth);

  // 1. ดึงข้อมูล User
  let users: UserType[] = [];
  try {
    users = await intraAuthUserService.getUserQuery();
  } catch (err) {
    console.error("Failed to fetch user data", err);
  }

  // 2. Logic หาผู้ใช้และใส่คำนำหน้า
  let formattedRequesterName =
    data.requesterName || "........................................";
  let requesterPosition = "............................."; 

  if (data.requesterName && users.length > 0) {
    const matchedUser = users.find(
      (u) =>
        data.requesterName?.includes(u.firstName) &&
        data.requesterName?.includes(u.lastName),
    );

    if (matchedUser) {
      let prefix = "";
      const gender = matchedUser.gender?.toLowerCase();

      if (gender === "ชาย" || gender === "male" || gender === "m") {
        prefix = "นาย ";
      } else if (gender === "หญิง" || gender === "female" || gender === "f") {
        prefix = "นางสาว ";
      }

      formattedRequesterName = `${prefix}${matchedUser.firstName}${matchedUser.lastName}`;
      // ✅ ดึงตำแหน่งมาใช้ ถ้าไม่มีให้ใช้เส้นประ
      requesterPosition =
        matchedUser.position || ".............................";
    }
  }

  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3,
    },
  };

  // ✅ ปรับเป็น 9 คอลัมน์ (ตัดวันหมดอายุออก) และเกลี่ยความกว้างให้พอดี A4
  worksheet.columns = [
    { width: 6 }, // A: ลำดับ
    { width: 14 }, // B: Working Code
    { width: 26 }, // C: รายการ
    { width: 10 }, // D: ขนาดบรรจุ
    { width: 12 }, // E: ราคา/ขนาดบรรจุ (เปลี่ยนชื่อคอลัมน์)
    { width: 10 }, // F: คงเหลือ
    { width: 10 }, // G: จำนวนเบิก
    { width: 10 }, // H: จำนวนจ่าย
    { width: 14 }, // I: หมายเหตุ
  ];

  // 3. Helper Functions
  const setBaseFont = (
    target: ExcelJS.Cell | ExcelJS.Row,
    size = 15, // ✅ ลดฟอนต์เป็น 15
    bold = false,
  ) => {
    target.font = { name: "TH Sarabun New", family: 4, size, bold };
  };

  const setBorder = (cell: ExcelJS.Cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  };

  // 4. Header (Merge ถึง I)
  worksheet.mergeCells("A1:I1");
  const titleRow = worksheet.getCell("A1");
  titleRow.value = "ใบขอเบิกยาและเวชภัณฑ์ที่มิใช่ยา โรงพยาบาลวังเจ้า";
  titleRow.alignment = { vertical: "middle", horizontal: "center" };
  setBaseFont(titleRow, 19, true);

  const currentMonth = dayjs().month();
  let fiscalYear = dayjs().year() + 543;
  if (currentMonth >= 9) {
    fiscalYear += 1;
  }
  worksheet.mergeCells("A2:I2");
  const subTitleRow = worksheet.getCell("A2");
  subTitleRow.value = `กลุ่มงานเภสัชกรรม ประจำปีงบประมาณ ${fiscalYear}`;
  subTitleRow.alignment = { vertical: "middle", horizontal: "center" };
  setBaseFont(subTitleRow, 17, true);

  worksheet.addRow([""]);

  // 5. Info Rows
  const addInfoRow = (l1: string, v1: string, l2: string, v2: string) => {
    // โครงสร้าง 9 คอลัมน์
    const row = worksheet.addRow(["", l1, v1, "", "", l2, v2, "", ""]);
    setBaseFont(row, 15);

    row.getCell(2).alignment = { horizontal: "right" };
    row.getCell(3).alignment = { horizontal: "left", indent: 1 };
    row.getCell(6).alignment = { horizontal: "right" };
    row.getCell(7).alignment = { horizontal: "left", indent: 1 };

    worksheet.mergeCells(`C${row.number}:E${row.number}`); // Merge พื้นที่คำตอบ 1
    worksheet.mergeCells(`G${row.number}:I${row.number}`); // Merge พื้นที่คำตอบ 2
  };

  addInfoRow(
    "เลขที่เบิก:",
    data.requestNumber || "-",
    "วันที่:",
    dayjs(data.requestDate).locale("th").format("D MMMM BBBB"),
  );
  addInfoRow(
    "หน่วยเบิก:",
    data.requestUnit || "-",
    "เบิกครั้งที่:",
    data.roundNumber?.toString() || "-",
  );

  const totalPrice = data.totalPrice
    ? `${Number(data.totalPrice).toLocaleString()} บาท`
    : "-";
  const totalItems = data.quantityUsed ? `${data.quantityUsed} รายการ` : "-";

  addInfoRow("จำนวนรายการ:", totalItems, "รวมเป็นเงิน:", totalPrice);

  worksheet.addRow([""]);

  // 6. Signatures
  const signLabelRow = worksheet.addRow([
    "",
    "ลงชื่อ ........................................ ผู้ขอเบิก",
    "",
    "",
    "",
    "ลงชื่อ ........................................ ผู้จ่ายยา",
    "",
    "",
    "",
  ]);

  const signNameRow = worksheet.addRow([
    "",
    `       (${formattedRequesterName})          `, // เคาะหน้า 7 หลัง 10
    "",
    "",
    "",
    `       (${data.dispenserName || ".............................................."})         `, // เคาะหน้า 7 หลัง 9
    "",
    "",
    "",
  ]);

  const signPositionRow = worksheet.addRow([
    "",
    `ตำแหน่ง ${requesterPosition}          `, // เคาะหลัง 10
    "",
    "",
    "",
    `ตำแหน่ง ........................................         `, // เคาะหลัง 9
    "",
    "",
    "",
  ]);

  // ✅ จัด Format ให้ทั้ง 3 แถว
  [signLabelRow, signNameRow, signPositionRow].forEach((row) => {
    setBaseFont(row, 15);
    row.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.mergeCells(`B${row.number}:E${row.number}`); // ซ้าย
    worksheet.mergeCells(`F${row.number}:I${row.number}`); // ขวา
  });

  worksheet.addRow([""]); // เว้นบรรทัดก่อนขึ้นตาราง

  // 7. หัวตาราง (✅ 9 คอลัมน์ตามที่ต้องการ)
  const headerRow = worksheet.addRow([
    "ลำดับ",
    "Working Code",
    "รายการ",
    "ขนาดบรรจุ", // D
    "ราคา/\nขนาดบรรจุ", // E: เปลี่ยนชื่อ
    "คงเหลือ", // F
    "จำนวนเบิก", // G
    "จำนวนจ่าย", // H
    "หมายเหตุ", // I
  ]);

  headerRow.eachCell((cell) => {
    setBaseFont(cell, 15, true);
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true, // ป้องกันหัวตารางล้น
    };
    setBorder(cell);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEEEEE" },
    };
  });

  // 8. Data Items
  if (data.maDrugItems && data.maDrugItems.length > 0) {
    const groupedItems: Record<string, any[]> = {};

    data.maDrugItems.forEach((item: any) => {
      const typeName = item.drug?.drugType?.drugType || "อื่นๆ";
      if (!groupedItems[typeName]) groupedItems[typeName] = [];
      groupedItems[typeName].push(item);
    });

    let globalIndex = 1;

    Object.keys(groupedItems)
      .sort()
      .forEach((groupName) => {
        const groupRow = worksheet.addRow([groupName]);
        setBaseFont(groupRow, 15, true);
        groupRow.getCell(1).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        worksheet.mergeCells(`A${groupRow.number}:I${groupRow.number}`); // Merge ถึง I
        groupRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDDEBF7" },
        };
        setBorder(groupRow.getCell(1));

        groupedItems[groupName].forEach((item) => {
          const row = worksheet.addRow([
            globalIndex++,
            item.drug?.workingCode || "-",
            item.drug?.name || "-",
            item.drug?.packagingSize || "-",
            item.price || 0,
            item.drug?.quantity || 0,
            item.quantity,
            "", // จำนวนจ่าย
            item.note || "",
          ]);

          row.eachCell((cell, colNumber) => {
            setBaseFont(cell, 15);
            setBorder(cell);
            if (colNumber === 3 || colNumber === 9) {
              // รายการ และ หมายเหตุ
              cell.alignment = { horizontal: "left", wrapText: true };
            } else if (colNumber === 5) {
              // ราคา
              cell.alignment = { horizontal: "right" };
              cell.numFmt = "#,##0.00";
            } else {
              cell.alignment = { horizontal: "center" };
            }
          });
        });
      });
  } else {
    const emptyRow = worksheet.addRow(["ไม่พบรายการยา"]);
    worksheet.mergeCells(`A${emptyRow.number}:I${emptyRow.number}`);
    emptyRow.getCell(1).alignment = { horizontal: "center" };
    setBaseFont(emptyRow, 15);
  }

  // 9. Save File
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `ใบเบิกยา_${data.requestNumber}.xlsx`);
};
