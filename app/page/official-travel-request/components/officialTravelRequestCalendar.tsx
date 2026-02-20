"use client";

import React, { useState, useMemo } from "react"; // ✅ เพิ่ม useMemo
import {
  Calendar,
  Formats,
  momentLocalizer,
  Event as RbcEvent,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { OfficialTravelRequestType, UserType } from "../../common";
import moment from "moment";
import "moment/locale/th";

// 🔹 Import Component รายละเอียดที่ทำไว้
import OfficialTravelRequestDetail from "./officialTravelRequestDetail";
import { Tooltip } from "antd";
import Holidays from "date-holidays"; // ✅ เพิ่ม import Holidays

// Setup Localizer
const localizer = momentLocalizer(moment);
const hd = new Holidays("TH"); // ✅ ประกาศตัวแปรวันหยุด

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
  masterCarObj?: any;
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
    const item = data.find((d) => d.id === event.id);
    if (item) {
      setSelected(item);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approve":
        return "#10b981";
      case "cancel":
        return "#ef4444";
      case "pending":
        return "#3b82f6";
      case "edit":
        return "#f97316";
      case "success":
        return "#6b7280";
      default:
        return "#fafafa";
    }
  };

  // ✅ เพิ่ม Logic การตัดวันหยุดและวันเสาร์อาทิตย์ (ตามแบบ MaCarCalendar)
  const processEvents = useMemo(() => {
    const processedEvents: CustomEvent[] = [];

    data.forEach((item) => {
      const start = moment(item.startDate);
      const end = moment(item.endDate);

      let current = start.clone();

      let chunkStart: moment.Moment | null = null;
      let chunkEnd: moment.Moment | null = null;

      const pushChunk = () => {
        if (chunkStart && chunkEnd) {
          processedEvents.push({
            id: item.id,
            title: item.createdName || "ไม่ระบุชื่อ",
            // ใช้เวลาเริ่มของ chunkStart และเวลาจบของ chunkEnd (สิ้นวัน)
            // หากต้องการเวลาที่แม่นยำตาม record เดิม ให้ปรับ logic ตรง toDate()
            start: chunkStart.toDate(),
            end: chunkEnd.endOf("day").toDate(),
            status: item.status,
            location: `${item.location}`,
            masterCar: item.MasterCar?.licensePlate || "",
            allDay: false,
            originalRecord: item,
          });
        }
        chunkStart = null;
        chunkEnd = null;
      };

      // วนลูปตั้งแต่วันเริ่ม จนถึงวันสิ้นสุด
      while (current.isSameOrBefore(end, "day")) {
        const dayOfWeek = current.day();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0=อาทิตย์, 6=เสาร์
        const holiday = hd.isHoliday(current.toDate());
        const isPublicHoliday =
          holiday &&
          (holiday[0].type === "public" || holiday[0].type === "bank");

        // ถือว่าเป็นวันทำการ ถ้าไม่ใช่วันหยุดเสาร์อาทิตย์ และไม่ใช่วันหยุดนักขัตฤกษ์
        const isWorkingDay = !isWeekend && !isPublicHoliday;

        if (isWorkingDay) {
          if (!chunkStart) {
            chunkStart = current.clone();
            // กรณีเป็นวันแรกของ chunk ให้คงเวลาเริ่มต้นเดิมไว้ (ถ้าต้องการ)
            // แต่ถ้า chunk เกิดจากการข้ามวันหยุด เวลาเริ่มจะเป็น 00:00 โดยอัตโนมัติจากการ clone
            if (current.isSame(start, "day")) {
              chunkStart = start.clone();
            }
          }
          chunkEnd = current.clone();
          // กรณีเป็นวันสุดท้าย ให้ใช้วันเวลาสิ้นสุดตามจริง
          if (current.isSame(end, "day")) {
            chunkEnd = end.clone();
          }
        } else {
          // เจอวันหยุด -> ตัดจบ chunk ก่อนหน้า (ถ้ามี)
          pushChunk();
        }

        current.add(1, "day");
      }

      // จบลูปแล้ว อย่าลืม push chunk สุดท้าย
      pushChunk();
    });

    return processedEvents;
  }, [data]);

  const formats: Formats = {
    monthHeaderFormat: (date: Date) => {
      const mDate = moment(date);
      return `${mDate.format("MMMM")} ${mDate.year() + 543}`;
    },
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
      const s = moment(start);
      const e = moment(end);
      if (s.year() === e.year()) {
        return `${s.format("D MMM")} - ${e.format("D MMM")} ${e.year() + 543}`;
      }
      return `${s.format("D MMM")} ${s.year() + 543} - ${e.format("D MMM")} ${e.year() + 543}`;
    },
    dayHeaderFormat: (date: Date) => {
      const mDate = moment(date);
      return `${mDate.format("D MMMM")} ${mDate.year() + 543}`;
    },
  };

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-2 tracking-tight">
          ปฏิทินคำขอไปราขการ
        </h2>
        <hr className="border-slate-100/20 -mx-6 md:-mx-6" />
      </div>

      <div className="modern-calendar-wrapper">
        <Calendar<CustomEvent>
          localizer={localizer}
          formats={formats}
          events={processEvents} // ✅ เปลี่ยนมาใช้ processEvents
          style={{ height: 600, fontFamily: "Prompt, sans-serif" }}
          onSelectEvent={onSelectEvent}
          eventPropGetter={(event) => {
            const color = getStatusColor(event.status);
            return {
              style: {
                backgroundColor: `${color}1A`,
                color: color,
                border: `1px solid ${color}4D`,
                borderTop: "1px solid #e2e8f0",
                fontSize: 12,
                borderRadius: "4px",
                fontWeight: 600,
                padding: "2px 6px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                marginBottom: "2px",
              },
            };
          }}
          messages={{
            next: "ถัดไป",
            previous: "ย้อนกลับ",
            today: "วันนี้",
            month: "เดือน",
            week: "สัปดาห์",
            day: "วัน",
            agenda: "กำหนดการ",
            date: "วันที่",
            time: "เวลา",
            event: "ภารกิจ",
            showMore: (total, remaining, events) => {
              const content = (
                <div className="flex flex-col gap-1 p-2 min-w-[160px]">
                  {events.map((evt, idx) => {
                    const color = getStatusColor(evt.status);
                    return (
                      <div
                        key={idx}
                        className="truncate text-xs px-2 py-1 rounded mb-1 last:mb-0"
                        style={{
                          backgroundColor: `${color}1A`,
                          color: color,
                          border: `1px solid ${color}4D`,
                          textAlign: "left",
                        }}
                      >
                        {evt.title}
                      </div>
                    );
                  })}
                </div>
              );

              return (
                <Tooltip
                  title={content}
                  color="#ffffff"
                  overlayInnerStyle={{
                    color: "black",
                    padding: 0,
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  mouseEnterDelay={0.1}
                >
                  <span className="cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-500 font-medium transition-colors">
                    + อีก {total} รายการ
                  </span>
                </Tooltip>
              );
            },
          }}
        />
      </div>

      <style jsx global>{`
        /* สีประจำวัน */
        .rbc-header:nth-child(1) {
          background-color: #fef2f2;
          color: #dc2626;
          border-bottom: 2px solid #fecaca;
        }
        .rbc-header:nth-child(2) {
          background-color: #fefce8;
          color: #a16207;
          border-bottom: 2px solid #fef08a;
        }
        .rbc-header:nth-child(3) {
          background-color: #fdf2f8;
          color: #db2777;
          border-bottom: 2px solid #fbcfe8;
        }
        .rbc-header:nth-child(4) {
          background-color: #f0fdf4;
          color: #16a34a;
          border-bottom: 2px solid #bbf7d0;
        }
        .rbc-header:nth-child(5) {
          background-color: #fff7ed;
          color: #ea580c;
          border-bottom: 2px solid #fed7aa;
        }
        .rbc-header:nth-child(6) {
          background-color: #e0f2fe;
          color: #0284c7;
          border-bottom: 2px solid #bae6fd;
        }
        .rbc-header:nth-child(7) {
          background-color: #faf5ff;
          color: #9333ea;
          border-bottom: 2px solid #e9d5ff;
        }

        /* Toolbar */
        .rbc-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          flex-wrap: wrap; /* Allow wrapping */
          gap: 8px;
        }
        .rbc-toolbar-label {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
        }

        /* Buttons */
        .rbc-btn-group button {
          border: 1px solid #cbd5e1 !important;
          background-color: #fff;
          color: #475569;
          padding: 6px 14px;
          font-size: 0.9rem;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .rbc-btn-group > button:first-child {
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }
        .rbc-btn-group > button:last-child {
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        .rbc-btn-group button.rbc-active {
          background-color: #2563eb !important;
          color: #fff !important;
          border-color: #2563eb !important;
        }
        /* Grid */
        .rbc-month-view {
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          overflow: hidden;
          background-color: #fff;
        }
        .rbc-header {
          padding: 12px 0;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .rbc-day-bg {
          border-left: 1px solid #e2e8f0;
        }
        .rbc-month-row + .rbc-month-row {
          border-top: 1px solid #e2e8f0;
        }
        .rbc-off-range-bg {
          background-color: #f8fafc !important;
        }
        .rbc-date-cell {
          padding: 6px 8px;
          font-weight: 600;
          color: #64748b;
        }
        /* Current Day */
        .rbc-now .rbc-button-link {
          color: #fff;
          background: #2563eb;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* --- Mobile Responsive Styles --- */
        @media (max-width: 768px) {
          /* Stack Toolbar */
          .rbc-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .rbc-toolbar-label {
            margin: 0;
            font-size: 1.25rem;
            order: -1; /* Title on top */
          }
          /* Full width button groups */
          .rbc-btn-group {
            display: flex;
            width: 100%;
          }
          .rbc-btn-group button {
            flex: 1;
            padding: 8px 4px;
            font-size: 0.85rem;
            justify-content: center;
          }
          /* Adjust Headers */
          .rbc-header {
            font-size: 0.75rem;
            font-weight: normal; /* กฎข้อ 4 */
            padding: 4px 0;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          /* Adjust Date Cells */
          .rbc-date-cell {
            font-size: 0.8rem;
            padding: 2px 4px;
            font-weight: normal; /* กฎข้อ 4 */
          }

          /* Adjust Events */
          .rbc-event {
            font-size: 0.7rem !important;
            padding: 1px 4px !important;
            line-height: 1.2;
          }
        }
      `}</style>

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
