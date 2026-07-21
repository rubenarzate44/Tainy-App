import React, { useState } from "react";
import { Booking, PACKAGES, getEndTime } from "../types";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, Clock, Plus, Trash2, Edit } from "lucide-react";

interface CalendarViewProps {
  bookings: Booking[];
  onSelectDate: (dateStr: string) => void;
  onSelectBooking: (booking: Booking) => void;
  onNewBookingAtDate: (dateStr: string) => void;
}

export default function CalendarView({
  bookings,
  onSelectDate,
  onSelectBooking,
  onNewBookingAtDate,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month names in Spanish
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar grid cells
  const days = [];
  
  // Empty slots for preceding month days
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  // Format date string as YYYY-MM-DD helper, adjusting for local timezone offset
  const getFormattedDate = (dayNum: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(dayNum).padStart(2, "0");
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  // Find bookings for a specific day
  const getBookingForDay = (dayNum: number): Booking | undefined => {
    const dateStr = getFormattedDate(dayNum);
    return bookings.find((b) => b.eventDate === dateStr);
  };

  return (
    <div id="calendar-card" className="glass-panel-heavy rounded-3xl p-6 shadow-xl overflow-hidden">
      {/* Header with Month / Year Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-brand-blue text-white p-3 rounded-2xl shadow-md">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brand-blue tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
              Calendario de Tanylandia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="prev-month-btn"
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white/60 hover:bg-brand-orange hover:text-white text-slate-600 transition-colors border border-white/50 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            id="next-month-btn"
            onClick={nextMonth}
            className="p-2 rounded-xl bg-white/60 hover:bg-brand-orange hover:text-white text-slate-600 transition-colors border border-white/50 shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white/40 backdrop-blur-sm p-3 rounded-2xl border border-white/40 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-brand-green"></div>
          <span className="font-extrabold text-slate-700">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-brand-blue"></div>
          <span className="font-extrabold text-slate-700">Reservado (Liquidado)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-brand-orange animate-pulse"></div>
          <span className="font-extrabold text-slate-700">Reservado (Saldo Pendiente)</span>
        </div>
      </div>

      {/* Weekdays headings */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
        <div>Dom</div>
        <div>Lun</div>
        <div>Mar</div>
        <div>Mié</div>
        <div>Jue</div>
        <div>Vie</div>
        <div>Sáb</div>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="aspect-square bg-white/10 rounded-2xl border border-white/5"
              ></div>
            );
          }

          const dateStr = getFormattedDate(day);
          const booking = getBookingForDay(day);
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          let dayStyles = "bg-white/40 text-emerald-950 border border-white/50 hover:bg-white/60 hover:border-brand-green shadow-sm";
          let badgeStyles = "bg-brand-green/20 text-brand-green";

          if (booking) {
            if (booking.isPaidInFull) {
              dayStyles = "bg-blue-50/80 backdrop-blur-sm text-brand-blue border border-brand-blue hover:bg-blue-100 shadow-sm";
              badgeStyles = "bg-brand-blue text-white";
            } else {
              dayStyles = "bg-orange-50/80 backdrop-blur-sm text-brand-orange border border-brand-orange hover:bg-orange-100 shadow-sm";
              badgeStyles = "bg-brand-orange text-white";
            }
          }

          return (
            <div
              key={`day-${day}`}
              id={`day-cell-${dateStr}`}
              onClick={() => {
                if (booking) {
                  onSelectBooking(booking);
                } else {
                  onNewBookingAtDate(dateStr);
                }
              }}
              className={`aspect-square p-2 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-200 transform hover:scale-105 relative ${dayStyles} ${
                isToday ? "ring-4 ring-brand-yellow ring-offset-2" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-black">{day}</span>
                {booking && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${badgeStyles}`}>
                    {booking.isPaidInFull ? "Liquidado" : "Pendiente"}
                  </span>
                )}
              </div>

              {booking ? (
                <div className="mt-1 leading-tight text-left">
                  <p className="text-[10px] font-black truncate max-w-full">
                    🎈 {booking.hostName}
                  </p>
                  <p className="text-[8px] opacity-80 truncate">
                    ⏱️ {booking.eventTime} a {getEndTime(booking.eventTime)}
                  </p>
                </div>
              ) : (
                <div className="mt-1 flex justify-end opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-brand-green text-white p-1 rounded-lg">
                    <Plus className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick stats panel */}
      <div className="mt-6 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <span className="text-slate-600 font-bold">Resumen de disponibilidad:</span>
        <div className="flex gap-3">
          <div className="bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/40 flex items-center gap-1.5 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue"></span>
            <span className="font-extrabold text-slate-700">
              {bookings.filter((b) => b.isPaidInFull).length} Ocupados
            </span>
          </div>
          <div className="bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/40 flex items-center gap-1.5 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-orange animate-pulse"></span>
            <span className="font-extrabold text-slate-700">
              {bookings.filter((b) => !b.isPaidInFull).length} Pendientes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
