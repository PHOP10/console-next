"use client";

import React, { useState } from "react";
import {
  Calendar,
  momentLocalizer,
  Event as RbcEvent,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DataLeaveType, UserType } from "../../common";
import moment from "moment";
import "moment/locale/th";

// 🔹 Import Component รายละเอียด
import DataLeaveDetail from "./dataLeaveDetail";

const localizer = momentLocalizer(moment);

interface CustomEvent extends RbcEvent {
  id: number;
  status: string;
  title: string;
  reason: string;
  details?: string;
  approvedByName?: string;
  createdName?: string;
  leaveType?: string;
  cancelName?: string;
  cancelReason?: string;
  originalRecord: DataLeaveType;
}

interface Props {
  data: DataLeaveType[];
  loading: boolean;
  fetchData: () => void;
  dataUser: UserType[]; // ✅ เพิ่ม dataUser เพื่อใช้ map ชื่อ
}

const DataLeaveCalendar: React.FC<Props> = ({ data, dataUser }) => {
  const [selected, setSelected] = useState<DataLeaveType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔹 Helper Function: แปลง ID เป็นชื่อ (สำหรับแสดงในปฏิทิน)
  const getUserName = (idOrName?: string) => {
    if (!idOrName) return "-";
    const user = dataUser?.find((u) => u.userId === idOrName);
    return user ? `${user.firstName} ${user.lastName}` : idOrName;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approve":
        return "#10b981"; // green
      case "cancel":
        return "#ef4444"; // red
      case "pending":
        return "#f97316"; // orange (การลาปกติใช้สีส้มสำหรับ pending)
      case "edit":
        return "#f59e0b"; // amber
      default:
        return "#3b82f6"; // blue
    }
  };

  const onSelectEvent = (event: CustomEvent) => {
    const item = data.find((d) => d.id === event.id);
    if (item) {
      setSelected(item);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      {/* 🔹 ส่วนปฏิทิน (Wrapper Card) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-blue-500 pl-3">
          ปฏิทินการลา
        </h2>

        <Calendar<CustomEvent>
          localizer={localizer}
          events={data.map(
            (item): CustomEvent => ({
              id: item.id,
              title: getUserName(item.createdName), // แปลงชื่อตรงนี้
              start: new Date(item.dateStart),
              end: new Date(item.dateEnd),
              status: item.status,
              reason: item.reason,
              details: item.details,
              approvedByName: item.approvedByName,
              createdName: item.createdName,
              leaveType: item.masterLeave?.leaveType,
              cancelName: item.cancelName,
              cancelReason: item.cancelReason,
              originalRecord: item,
            }),
          )}
          style={{ height: 600, fontFamily: "Prompt, sans-serif" }}
          onSelectEvent={onSelectEvent}
          // Custom Event Style (Soft Pill)
          eventPropGetter={(event: CustomEvent) => {
            const color = getStatusColor(event.status);
            return {
              style: {
                backgroundColor: `${color}1A`, // Opacity 10%
                color: color,
                border: `1px solid ${color}4D`,
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
            event: "การลา",
            showMore: (total) => `+ ดูอีก ${total} รายการ`,
          }}
        />
      </div>

      {/* 🔹 เรียกใช้ DataLeaveDetail Component */}
      <DataLeaveDetail
        open={modalOpen}
        onClose={handleCloseModal}
        record={selected}
        user={dataUser} // ส่ง dataUser ไปเป็น prop 'user'
      />
    </>
  );
};

export default DataLeaveCalendar;
