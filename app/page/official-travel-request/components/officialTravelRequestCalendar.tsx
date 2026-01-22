"use client";

import React, { useState } from "react";
import {
  Calendar,
  momentLocalizer,
  Event as RbcEvent,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { OfficialTravelRequestType, UserType } from "../../common";
import moment from "moment";
import "moment/locale/th";

// 🔹 Import Component รายละเอียดที่ทำไว้
import OfficialTravelRequestDetail from "./officialTravelRequestDetail";

// Setup Localizer
const localizer = momentLocalizer(moment);

// --- Custom Interfaces ---
interface CustomEvent extends RbcEvent {
  id: number;
  status: string;
  title: string;
  location: string;
  MasterCar?: {
    licensePlate: string;
    brand: string;
    model: string;
  };
  masterCar: string;
  originalRecord: OfficialTravelRequestType;
}

interface Props {
  data: OfficialTravelRequestType[];
  loading: boolean;
  fetchData: () => void;
  dataUser: UserType[];
}

const OfficialTravelRequestCalendar: React.FC<Props> = ({ data, dataUser }) => {
  const [selected, setSelected] = useState<OfficialTravelRequestType | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  // --- Event Handling ---
  const onSelectEvent = (event: CustomEvent) => {
    // หาข้อมูล record จริงจาก data
    const item = data.find((d) => d.id === event.id);
    if (item) {
      setSelected(item);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // setTimeout(() => setSelected(null), 300); // ถ้าต้องการเคลียร์ data หลังปิด Animation
  };

  return (
    <>
      {/* 🔹 ส่วนปฏิทิน */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-blue-500 pl-3">
          ปฏิทินการเดินทาง
        </h2>

        <Calendar<CustomEvent>
          localizer={localizer}
          events={data.map(
            (item): CustomEvent => ({
              id: item.id,
              title: item.createdName || "ไม่ระบุชื่อ",
              start: new Date(item.startDate),
              end: new Date(item.endDate),
              status: item.status,
              location: `${item.location}`,
              masterCar: item.MasterCar?.licensePlate || "",
              allDay: false,
              originalRecord: item,
            }),
          )}
          style={{ height: 600, fontFamily: "Prompt, sans-serif" }}
          onSelectEvent={onSelectEvent}
          // Custom Event Style (Soft Pill Look) - คงไว้เพื่อให้ปฏิทินสวยเหมือนเดิม
          eventPropGetter={(event: CustomEvent) => {
            let bgColor = "#eff6ff"; // blue-50
            let textColor = "#1d4ed8"; // blue-700
            let borderColor = "#bfdbfe"; // blue-200

            if (event.status === "approve") {
              bgColor = "#f0fdf4"; // green-50
              textColor = "#15803d"; // green-700
              borderColor = "#bbf7d0"; // green-200
            } else if (event.status === "cancel") {
              bgColor = "#fef2f2"; // red-50
              textColor = "#b91c1c"; // red-700
              borderColor = "#fecaca"; // red-200
            } else if (event.status === "edit") {
              bgColor = "#fff7ed"; // orange-50
              textColor = "#c2410c"; // orange-700
              borderColor = "#fed7aa"; // orange-200
            }

            return {
              style: {
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                fontSize: 12,
                borderRadius: 6,
                fontWeight: 500,
                padding: "2px 5px",
              },
            };
          }}
          messages={{
            next: "ถัดไป",
            previous: "ก่อนหน้า",
            today: "วันนี้",
            month: "เดือน",
            week: "สัปดาห์",
            day: "วัน",
            agenda: "กำหนดการ",
            date: "วันที่",
            time: "เวลา",
            event: "ภารกิจ",
            showMore: (total) => `+ ดูอีก ${total} รายการ`,
          }}
        />
      </div>

      {/* 🔹 เรียกใช้ Component Detail แทนการเขียน Modal ซ้ำ */}
      <OfficialTravelRequestDetail
        open={modalOpen}
        onClose={handleCloseModal}
        record={selected}
        dataUser={dataUser}
      />
    </>
  );
};

export default OfficialTravelRequestCalendar;
