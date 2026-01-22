"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Button, Tooltip } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../../user/services/user.service";
import { useEffect, useState } from "react";
import { UserType } from "../../common";
import { ExportOutlined, FileWordOutlined } from "@ant-design/icons";
dayjs.locale("th");

interface MaCarExportWordProps {
  record: any;
}

const MaCarExportWord: React.FC<MaCarExportWordProps> = ({ record }) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);
  const [userData, setUserData] = useState<UserType[]>([]);
  // console.log("record in MaCarExportWord:", record);

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

  const toThaiNumber = (input: string | number): string => {
    const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
    return input
      .toString()
      .replace(/[0-9]/g, (digit) => thaiDigits[parseInt(digit)]);
  };

  const formatThaiDate = (date: string | Date) => {
    const d = dayjs(date);
    const day = toThaiNumber(d.format("D"));
    const month = d.format("MMMM");
    const year = toThaiNumber(d.year() + 543);
    return `${day} ${month} ${year}`;
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/maCarTemplate.docx");
      if (!response.ok) throw new Error("ไม่สามารถโหลด maCarTemplate.docx");
      const arrayBuffer = await response.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      if (userData.length === 0) {
        // โหลด userData ก่อนถ้ายังว่าง
        try {
          const res = await intraAuthService.getUserQuery();
          setUserData(res);
        } catch (err) {
          console.error(err);
          return;
        }
      }

      const userPosition =
        record.createdName && userData.length > 0
          ? userData.find(
              (u) => `${u.firstName} ${u.lastName}` === record.createdName,
            )?.position || "ไม่ระบุตำแหน่ง"
          : "ไม่ระบุตำแหน่ง";

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

      // 1. ค้นหา User ที่มีชื่อและนามสกุลตรงกับ record.createdName
      const creator = userData.find((u) => {
        const fullName = `${u.firstName} ${u.lastName}`;
        return fullName === record.createdName;
      });

      // 2. ตรวจสอบเพศ/คำนำหน้าจาก User ที่หาเจอ
      const genderPrefix = creator
        ? creator.gender === "male"
          ? "นาย"
          : creator.gender === "female"
            ? "นาง"
            : creator.gender === "miss"
              ? "นางสาว"
              : (creator.gender ?? "-")
        : "-";

      // const checked = "☑"; // \u2611
      // const unchecked = "☐"; // \u2610
      const checkeds = "(/)"; // กรณีเลือก
      const uncheckeds = "( )"; // กรณีไม่ได้เลือก
      const standardBudgets = ["งบกลาง", "งบโครงการ", "งบผู้จัด", "เงินบำรุง"];
      // ✅ เตรียมข้อมูลส่งเข้า template
      const data = {
        ny: record.typeName?.includes("ในจังหวัด") ? checkeds : uncheckeds,
        nn: record.typeName?.includes("นอกจังหวัด") ? checkeds : uncheckeds,
        np: record.typeName?.includes("แผนปกติ") ? checkeds : uncheckeds,
        nd: record.typeName?.includes("แผนด่วน") ? checkeds : uncheckeds,
        id: toThaiNumber(record.id ?? "-"),
        requesterName: record.requesterName ?? "-",
        createdName: record.createdName ?? "-",
        purpose: record.purpose ?? "-",
        destination: record.destination ?? "-",
        passengers: toThaiNumber(record.passengers ?? "-"),
        gd: genderPrefix,
        passengerss: passengerList, // สำหรับนำไปใช้ใน Loop (ถ้ามี)
        budget: record.budget
          ? toThaiNumber(
              record.budget.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              }),
            )
          : "-",
        status: record.status ?? "-",
        dateStart: record.dateStart ? formatThaiDate(record.dateStart) : "-",
        dateEnd: record.dateEnd ? formatThaiDate(record.dateEnd) : "-",
        timeStart: record.dateStart
          ? dayjs(record.dateStart).format("HH:mm")
          : "-",
        timeEnd: record.dateEnd ? dayjs(record.dateEnd).format("HH:mm") : "-",

        createdAt: record.createdAt ? formatThaiDate(record.createdAt) : "-",
        updatedAt: record.updatedAt ? formatThaiDate(record.updatedAt) : "-",
        D: record.createdAt
          ? toThaiNumber(dayjs(record.createdAt).format("D"))
          : "-",
        MM: record.createdAt ? dayjs(record.createdAt).format("MMMM") : "-",
        BBBB: record.createdAt
          ? toThaiNumber(dayjs(record.createdAt).year() + 543)
          : "-",
        // cer
        EndDate: formatThaiDate(new Date()),
        userPosition: userPosition,
        cancelName: record.cancelName ?? "-",
        cancelReason: record.cancelReason ?? "-",
        cancelAt: record.cancelAt
          ? toThaiNumber(dayjs(record.cancelAt).format("D MMMM BBBB HH:mm"))
          : "-",
        approvedByName: record.approvedByName ?? "-",
        approvedAt: record.approvedAt
          ? toThaiNumber(dayjs(record.approvedAt).format("D MMMM BBBB HH:mm"))
          : "-",
        carName: record.masterCar?.carName ?? "-",
        // licensePlate: toThaiNumber(record.masterCar?.licensePlate ?? "-"),
        brand: record.masterCar?.brand ?? "-",
        model: record.masterCar?.model ?? "-",
        year: toThaiNumber(record.masterCar?.year ?? "-"),
        carDetails: record.masterCar?.details ?? "-",
        licensePlate: record.masterCar.licensePlate,
        nT: record.masterCar.numberType,
        fN: record.masterCar.fuelType === "เบนซิน 95" ? checkeds : uncheckeds,
        fD: record.masterCar.fuelType === "ดีเซล" ? checkeds : uncheckeds,
        fO: record.masterCar.fuelType === "เบนซิน 91" ? checkeds : uncheckeds,
        y: record.driver === "yes" ? checkeds : uncheckeds,
        n: record.driver === "no" ? checkeds : uncheckeds,
        kl: record.budget === "งบกลาง" ? checkeds : uncheckeds,
        k: record.budget === "งบโครงการ" ? checkeds : uncheckeds,
        j: record.budget === "งบผู้จัด" ? checkeds : uncheckeds,
        br: record.budget === "เงินบำรุง" ? checkeds : uncheckeds,
        // o: record.budget === "งบอื่นๆ" ? checkeds : uncheckeds,
        o:
          (record.budget && !standardBudgets.includes(record.budget)) ||
          record.budget === "งบอื่นๆ"
            ? checkeds
            : uncheckeds,
        oBName: !standardBudgets.includes(record.budget)
          ? record.budget
          : "..........",
        namedriver:
          record.driver === "no"
            ? (record.createdName ?? "-")
            : ".......................",
        gds: record.driver === "no" ? (genderPrefix ?? "-") : "",
      };

      doc.render(data);
      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(blob, `การใช้รถ_${record.id}.docx`);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <Tooltip title="Export">
      <FileWordOutlined
        style={{
          fontSize: 22,
          color: record.status === "pending" ? "#1677ff" : "#d9d9d9",
          cursor: record.status === "pending" ? "pointer" : "not-allowed",
          transition: "color 0.2s",
        }}
        onClick={() => {
          if (record.status === "pending") {
            handleExport();
          }
        }}
        onMouseEnter={(e) => {
          if (record.status === "pending") {
            (e.currentTarget as HTMLElement).style.color = "#0958d9";
          }
        }}
        onMouseLeave={(e) => {
          if (record.status === "pending") {
            (e.currentTarget as HTMLElement).style.color = "#1677ff";
          }
        }}
      />
    </Tooltip>
  );
};

export default MaCarExportWord;
