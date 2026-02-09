"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Tooltip } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../../user/services/user.service";
import { useEffect, useState } from "react";
import { UserType } from "../../common";
import { ExportOutlined, FileWordOutlined } from "@ant-design/icons";

dayjs.locale("th");

interface OfficialTravelExportWordProps {
  record: any; // ควรเปลี่ยนเป็น Type ของ OfficialTravelRequest เมื่อพร้อม
}

const OfficialTravelExportWord: React.FC<OfficialTravelExportWordProps> = ({
  record,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);
  const [userData, setUserData] = useState<UserType[]>([]);
  const now = dayjs();

  const fetchData = async () => {
    try {
      const res = await intraAuthService.getUserQuery();
      setUserData(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toThaiNumber = (input: string | number | null | undefined): string => {
    if (input === null || input === undefined) return "-";
    const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
    return input
      .toString()
      .replace(/[0-9]/g, (digit) => thaiDigits[parseInt(digit)]);
  };

  const formatThaiDate = (date: string | Date) => {
    if (!date) return "-";

    const d = dayjs(date);

    const day = d.format("D"); // 24
    const month = d.format("MMMM"); // มกราคม
    const year = d.year() + 543; // 2569
    const time = d.format("HH:mm"); // 08:00

    // เว้นวรรค: วัน เดือน ปี เวลา xx:xx น.
    return `${day} ${month} ${year} เวลา ${time} น.`;
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/officialTravelRequestTemplate.docx");
      if (!response.ok)
        throw new Error("ไม่สามารถโหลด officialTravelRequestTemplate.docx");
      const arrayBuffer = await response.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      if (userData.length === 0) {
        try {
          const res = await intraAuthService.getUserQuery();
          setUserData(res);
        } catch (err) {
          console.error(err);
          return;
        }
      }

      // หาตำแหน่งของผู้สร้างเอกสาร
      const userPosition =
        record.createdName && userData.length > 0
          ? userData.find(
              (u) => `${u.firstName} ${u.lastName}` === record.createdName,
            )?.position || "ไม่ระบุตำแหน่ง"
          : "ไม่ระบุตำแหน่ง";

      // จัดการรายชื่อผู้โดยสาร
      const passengerList = Array.isArray(record.passengerNames)
        ? record.passengerNames.map((userId: string, i: number) => {
            const user = userData.find((u) => u.userId === userId);
            let prefix = "";
            if (user) {
              if (user.gender === "male") prefix = "นาย";
              else if (user.gender === "female") prefix = "นาง";
              else if (user.gender === "miss") prefix = "นางสาว";
            }

            return {
              index: toThaiNumber(i + 1),
              name: user
                ? `${prefix}${user.firstName} ${user.lastName}`
                : "(ไม่พบชื่อ)",
              position: user?.position ?? "-",
            };
          })
        : [];

      const creator = userData.find((u) => {
        const fullName = `${u.firstName} ${u.lastName}`;
        return fullName === record.createdName;
      });

      const genderPrefix = creator
        ? creator.gender === "male"
          ? "นาย"
          : creator.gender === "female"
            ? "นาง"
            : creator.gender === "miss"
              ? "นางสาว"
              : (creator.gender ?? "-")
        : "-";

      const checkeds = "(/)";
      const uncheckeds = "( )";
      const checked = "☑"; // \u2611
      const unchecked = "☐"; // \u2610
      const standardBudgets = ["งบกลาง", "งบโครงการ", "งบผู้จัด", "เงินบำรุง"];

      const data = {
        // --- ข้อมูลเอกสารทั่วไป ---
        id: toThaiNumber(record.id),
        documentNo: toThaiNumber(record.documentNo ?? "-"),
        title: record.title ?? "-", // หัวข้อเรื่อง
        recipient: record.recipient ?? "-", // เรียน (ใคร)

        // --- รายละเอียดการเดินทาง ---
        missionDetail: record.missionDetail ?? "-", // map จาก purpose เดิม เป็น missionDetail
        location: record.location ?? "-", // map จาก destination เดิม
        passengers: toThaiNumber(record.passengers ?? "-"),
        passengerss: passengerList, // Loop รายชื่อ

        // --- วันเวลา ---
        // ใช้ startDate / endDate แทน dateStart / dateEnd
        dateStart: record.startDate ? formatThaiDate(record.startDate) : "-",
        dateEnd: record.endDate ? formatThaiDate(record.endDate) : "-",
        EndDate: formatThaiDate(new Date()),
        wd: toThaiNumber(now.format("D")), // วันที่ (เลขไทย)
        wm: now.format("MMMM"), // เดือน (ชื่อเต็มภาษาไทย)
        wb: toThaiNumber(now.year() + 543), // ปี พ.ศ. (เลขไทย)
        // --- ผู้ขอ / ผู้สร้าง ---
        createdName: record.createdName ?? "-",
        gd: genderPrefix,
        userPosition: userPosition,

        // --- วันที่สร้างเอกสาร (ส่วนท้ายกระดาษ) ---
        D: record.createdAt
          ? toThaiNumber(dayjs(record.createdAt).format("D"))
          : "-",
        MM: record.createdAt ? dayjs(record.createdAt).format("MMMM") : "-",
        BBBB: record.createdAt
          ? toThaiNumber(dayjs(record.createdAt).year() + 543)
          : "-",

        // --- งบประมาณ ---
        budget: record.budget
          ? toThaiNumber(
              // ถ้า budget เก็บเป็น string ตัวเลข หรือ number ให้แปลงก่อน
              // สมมติถ้าเก็บเป็น Text ชื่องบเฉยๆ ก็แสดงเลย แต่ถ้าเป็นตัวเงินต้องแปลง
              record.budget,
            )
          : "-",

        // Checkbox งบประมาณ (ถ้า logic เดิมยังใช้อยู่)
        kl: record.budget === "งบกลาง" ? checkeds : uncheckeds,
        k: record.budget === "งบโครงการ" ? checkeds : uncheckeds,
        j: record.budget === "งบผู้จัด" ? checkeds : uncheckeds,
        br: record.budget === "เงินบำรุง" ? checkeds : uncheckeds,
        no: record.budget === "ไม่ขอเบิก" ? checkeds : uncheckeds,

        // o:
        //   record.budget && !standardBudgets.includes(record.budget)
        //     ? checked
        //     : unchecked,
        // oBName: !standardBudgets.includes(record.budget)
        //   ? record.budget
        //   : "..........",

        // --- การอนุมัติ ---
        approvedByName: record.approvedByName ?? "-",
        approvedDate: record.approvedDate
          ? formatThaiDate(record.approvedDate)
          : "-",

        // --- การยกเลิก ---
        status: record.status ?? "-",
        cancelName: record.cancelName ?? "-",
        cancelReason: record.cancelReason ?? "-",
        cancelAt: record.cancelAt
          ? toThaiNumber(dayjs(record.cancelAt).format("D MMMM BBBB HH:mm"))
          : "-",

        // --- ข้อมูลรถ (Relation MasterCar) ---
        // ใน Schema ใหม่เป็น MasterCar (ตัวพิมพ์ใหญ่ M) และเป็น Optional
        carName: record.MasterCar?.carName ?? "-",
        licensePlate: toThaiNumber(
          record.MasterCar?.licensePlate ?? "................",
        ),
        brand: record.MasterCar?.brand ?? "-",
        model: record.MasterCar?.model ?? "-",
        OC: record.travelType?.includes("official") ? checkeds : uncheckeds,
        AC: record.travelType?.includes("bus") ? checkeds : uncheckeds,
        AP: record.travelType?.includes("plane") ? checkeds : uncheckeds,
        PC: record.travelType?.includes("private") ? checkeds : uncheckeds,
        OT: record.travelType?.includes("other") ? checkeds : uncheckeds,

        // รถส่วนตัว (ถ้ามี)
        privateCarId: record.privateCarId ?? ".................",
        otherTravelType: record.otherTravelType ?? ".................",

        // --- ส่วนที่ตัดออก / ยังไม่มีใน Schema ใหม่ ---
        // driver (yes/no) -> ตัดออก
        // typeName (ในจังหวัด/นอกจังหวัด) -> ถ้าจะใช้ต้อง map จาก travelType หรือ location
      };

      doc.render(data);
      const blob = doc.getZip().generate({ type: "blob" });
      // เปลี่ยนชื่อไฟล์ตอน Save
      saveAs(blob, `ขอไปราชการ_${record.documentNo || record.id}.docx`);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <Tooltip
      title={
        record.status === "approve"
          ? "พิมพ์ใบขอไปราชการ"
          : "รอการอนุมัติเพื่อพิมพ์เอกสาร"
      }
    >
      <FileWordOutlined
        style={{
          fontSize: 18,
          // 1. กำหนดสี: ถ้า approved ใช้สีฟ้า Word ถ้ายังไม่ approved (เช่น pending) ใช้สีเทาจางๆ
          color: record.status === "approve" ? "#1677ff" : "#d9d9d9",

          // 2. กำหนด Mouse Cursor: ถ้ายังไม่ approved ให้เป็นรูปห้าม (not-allowed)
          cursor: record.status === "approve" ? "pointer" : "not-allowed",

          opacity: record.status === "approve" ? 1 : 0.45,

          transition: "all 0.2s",
        }}
        onClick={() => {
          if (record.status === "approve") {
            handleExport();
          }
        }}
      />
    </Tooltip>
  );
};

export default OfficialTravelExportWord;
