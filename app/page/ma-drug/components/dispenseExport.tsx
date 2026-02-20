import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { DispenseType, UserType } from "../../common";
import { userService } from "../../user/services/user.service";
import dayjs from "dayjs";
import "dayjs/locale/th";

export const exportDispenseToExcel = async (
  data: DispenseType,
  intraAuth: any,
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ใบจ่ายยา");
  const intraAuthUserService = userService(intraAuth);

  // 1. ดึงข้อมูล User
  let users: UserType[] = [];
  try {
    users = await intraAuthUserService.getUserQuery();
  } catch (err) {
    console.error("Failed to fetch user data", err);
  }

  // 2. Logic หาผู้จ่ายยา (Dispenser) เพื่อใส่คำนำหน้า และ ตำแหน่ง
  let formattedDispenserName =
    data.dispenserName || "........................................";
  let dispenserPosition = ".............................";

  if (data.dispenserName && users.length > 0) {
    const matchedUser = users.find(
      (u) =>
        data.dispenserName?.includes(u.firstName) &&
        data.dispenserName?.includes(u.lastName),
    );

    if (matchedUser) {
      let prefix = "";
      const gender = matchedUser.gender?.toLowerCase();

      if (gender === "ชาย" || gender === "male" || gender === "m") {
        prefix = "นาย ";
      } else if (gender === "หญิง" || gender === "female" || gender === "f") {
        prefix = "นางสาว ";
      }

      formattedDispenserName = `${prefix}${matchedUser.firstName} ${matchedUser.lastName}`;
      dispenserPosition =
        matchedUser.position || ".............................";
    }
  }

  // 3. ตั้งค่าหน้ากระดาษ
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

  // ✅ 4. ปรับโครงสร้างเป็น 8 คอลัมน์ ตามที่ระบุ
  worksheet.columns = [
    { width: 6 }, // A: ลำดับ
    { width: 14 }, // B: Working Code
    { width: 30 }, // C: รายการยา
    { width: 10 }, // D: ขนาดบรรจุ
    { width: 14 }, // E: ราคา/ขนาดบรรจุ
    { width: 10 }, // F: คงเหลือ
    { width: 10 }, // G: จำนวนจ่าย
    { width: 15 }, // H: หมายเหตุ
  ];

  // 5. Helper Functions
  const setBaseFont = (
    target: ExcelJS.Cell | ExcelJS.Row,
    size = 15,
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

  worksheet.mergeCells("A1:H1");
  const titleRow = worksheet.getCell("A1");
  titleRow.value =
    "ใบรายการจ่ายยาและเวชภัณฑ์ที่มิใช่ยา โรงพยาบาลส่งเสริมสุขภาพตําบลบ้านผาผึ้ง";
  titleRow.alignment = { vertical: "middle", horizontal: "center" };
  setBaseFont(titleRow, 19, true);

  const currentMonth = dayjs().month();
  let fiscalYear = dayjs().year() + 543;
  if (currentMonth >= 9) {
    fiscalYear += 1;
  }

  worksheet.mergeCells("A2:H2"); // Merge ถึง H
  const subTitleRow = worksheet.getCell("A2");
  subTitleRow.value = `กลุ่มงานเภสัชกรรม ประจำปีงบประมาณ ${fiscalYear}`;
  subTitleRow.alignment = { vertical: "middle", horizontal: "center" };
  setBaseFont(subTitleRow, 17, true);

  worksheet.addRow([""]);

  // ✅ 7. ข้อมูลใบจ่าย (ปรับ Layout ให้ หมายเหตุ และ รวมเงิน ขึ้นมาขนานกัน)
  const addInfoRow = (l1: string, v1: string, l2: string, v2: string) => {
    const row = worksheet.addRow(["", l1, v1, "", l2, v2, "", ""]);
    setBaseFont(row, 15); // ตัวหนังสือธรรมดา ไม่หนา

    row.getCell(2).alignment = { horizontal: "right" }; // Label ซ้าย
    row.getCell(3).alignment = { horizontal: "left", indent: 1 }; // Value ซ้าย
    row.getCell(5).alignment = { horizontal: "right" }; // Label ขวา
    row.getCell(6).alignment = { horizontal: "left", indent: 1 }; // Value ขวา

    worksheet.mergeCells(`C${row.number}:D${row.number}`);
    worksheet.mergeCells(`F${row.number}:H${row.number}`);
  };

  // แถวที่ 1: วันที่ และ หมายเหตุ
  addInfoRow(
    "",
    "",
    "วันที่จ่าย:",
    data.dispenseDate
      ? dayjs(data.dispenseDate).locale("th").format("D MMMM BBBB")
      : "-",
  );

  // แถวที่ 2: จำนวนรายการ และ รวมเป็นเงิน (ใช้ตัวธรรมดา)
  const totalPriceStr = data.totalPrice
    ? `${Number(data.totalPrice).toLocaleString()} บาท`
    : "-";

  addInfoRow(
    "จำนวนรายการ:",
    data.dispenseItems ? `${data.dispenseItems.length} รายการ` : "-",
    "รวมเป็นเงิน:",
    totalPriceStr,
  );

  worksheet.addRow([""]);

  // ✅ 8. ส่วนลายเซ็น (จัดกึ่งกลางปกติ ไม่ต้องถ่วง Spacebar เพื่อความสวยงาม)
  const signLabelRow = worksheet.addRow([
    "",
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
    "",
    "",
    "",
    `(${formattedDispenserName})`,
    "",
    "",
    "",
  ]);
  const signPositionRow = worksheet.addRow([
    "",
    "",
    "",
    "",
    `ตำแหน่ง ${dispenserPosition}`,
    "",
    "",
    "",
  ]);

  [signLabelRow, signNameRow, signPositionRow].forEach((row) => {
    setBaseFont(row, 15);
    row.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.mergeCells(`E${row.number}:H${row.number}`); // Merge คอลัมน์ E ถึง H
  });

  worksheet.addRow([""]);

  // ✅ 9. หัวตาราง (อัปเดต 8 คอลัมน์)
  const headerRow = worksheet.addRow([
    "ลำดับ",
    "Working Code",
    "รายการยา",
    "ขนาดบรรจุ",
    "ราคา/\nขนาดบรรจุ", // ตัดคำให้สวยงาม
    "คงเหลือ",
    "จำนวนจ่าย",
    "หมายเหตุ",
  ]);

  headerRow.eachCell((cell) => {
    setBaseFont(cell, 15, true);
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    setBorder(cell);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEEEEE" },
    };
  });

  // 10. ข้อมูลยา (Loop Items)
  if (data.dispenseItems && data.dispenseItems.length > 0) {
    let index = 1;
    const groupedItems: Record<string, any[]> = {};
    data.dispenseItems.forEach((item: any) => {
      const typeName = item.drug?.drugType?.drugType || "อื่นๆ";
      if (!groupedItems[typeName]) groupedItems[typeName] = [];
      groupedItems[typeName].push(item);
    });

    Object.keys(groupedItems)
      .sort()
      .forEach((groupName) => {
        const groupRow = worksheet.addRow([groupName]);
        setBaseFont(groupRow, 15, true);
        worksheet.mergeCells(`A${groupRow.number}:H${groupRow.number}`);
        groupRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDDEBF7" },
        };
        groupRow.getCell(1).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        setBorder(groupRow.getCell(1));

        groupedItems[groupName].forEach((item) => {
          // ✅ อัปเดตข้อมูลใส่ 8 คอลัมน์
          const row = worksheet.addRow([
            index++,
            item.drug?.workingCode || "-",
            item.drug?.name || "-",
            item.drug?.packagingSize || "-",
            item.price || 0,
            item.drug?.quantity || 0, // คงเหลือ
            item.quantity || 0, // จำนวนจ่าย
            item.note || "",
          ]);

          row.eachCell((cell, colNumber) => {
            setBaseFont(cell, 15);
            setBorder(cell);

            if (colNumber === 3 || colNumber === 8) {
              // รายการยา และ หมายเหตุ จัดซ้าย
              cell.alignment = {
                horizontal: "left",
                wrapText: true,
                vertical: "middle",
              };
            } else if (colNumber === 5) {
              // ราคา จัดขวา ทศนิยม 2 ตำแหน่ง
              cell.alignment = { horizontal: "right", vertical: "middle" };
              cell.numFmt = "#,##0.00";
            } else {
              // อื่นๆ จัดกึ่งกลาง
              cell.alignment = { horizontal: "center", vertical: "middle" };
            }
          });
        });
      });
  } else {
    const emptyRow = worksheet.addRow(["ไม่พบรายการยา"]);
    worksheet.mergeCells(`A${emptyRow.number}:H${emptyRow.number}`);
    emptyRow.getCell(1).alignment = { horizontal: "center" };
    setBaseFont(emptyRow, 15);
  }

  // 11. สร้างไฟล์
  const buffer = await workbook.xlsx.writeBuffer();

  const dateStr = data.dispenseDate
    ? dayjs(data.dispenseDate).locale("th").format("D_MMM_BBBB")
    : "unknown";

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `ใบจ่ายยา_${dateStr}.xlsx`);
};
