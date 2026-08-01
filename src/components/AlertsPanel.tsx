import React from "react";
import { Booking, PACKAGES, isSchedulePending } from "../types";
import { AlertTriangle, Bell, MessageCircle, DollarSign, Calendar, Clock } from "lucide-react";

interface AlertsPanelProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
}

export default function AlertsPanel({ bookings, onSelectBooking }: AlertsPanelProps) {
  // Current date for comparison (2026-07-19 is current mock time)
  const currentMockDate = new Date("2026-07-19");

  // Filter bookings that are 1 week (7 days) or less away and have a pending balance
  const alertBookings = bookings.filter((booking) => {
    if (booking.isPaidInFull) return false;

    const eventDate = new Date(booking.eventDate + "T00:00:00");
    const diffTime = eventDate.getTime() - currentMockDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Alert if event is in the future and <= 7 days away (or today)
    return diffDays >= 0 && diffDays <= 7;
  });

  const handleSendReminder = (booking: Booking) => {
    const pendingAmount = booking.totalPrice - booking.advancePayment;
    const pkg = PACKAGES.find((p) => p.id === booking.packageId);

    const message = `*⏰ RECORDATORIO DE LIQUIDACIÓN - TANYLANDIA*
--------------------------------------------
Hola *${booking.hostName}*, le saludamos de *Tanylandia*. 

Le recordamos que de acuerdo a las cláusulas de contratación, el evento debe quedar liquidado en su totalidad *una semana antes* del mismo.

Su evento es el día *${booking.eventDate}* ${isSchedulePending(booking) ? "con *horario por definir*" : `a las *${booking.eventTime}* hrs`}.
- *Monto Total:* $${booking.totalPrice.toLocaleString("es-MX")} MXN
- *Anticipo Realizado:* $${booking.advancePayment.toLocaleString("es-MX")} MXN
- *Saldo Pendiente por Liquidar:* *$${pendingAmount.toLocaleString("es-MX")} MXN*

Agradecemos su atención para poder proceder con todos los preparativos de su gran día. ¡Nos vemos pronto en Tanylandia! 🎈`;

    const cleanPhone = booking.phone.replace(/[^0-9]/g, "");
    const targetPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
    window.open(`https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(message)}`, "_blank");
  };

  if (alertBookings.length === 0) {
    return null; // Return nothing if no alerts, keeping the screen clutter-free
  }

  return (
    <div id="alerts-container" className="bg-gradient-to-r from-amber-500 to-brand-orange text-white rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md animate-bounce">
          <AlertTriangle className="w-6 h-6 text-white stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight font-display">
            ⚠️ Alertas de Liquidación (Pendientes)
          </h2>
          <p className="text-xs text-orange-100 font-semibold">
            Los siguientes eventos ocurren en 1 semana o menos y aún tienen saldos pendientes de pago:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alertBookings.map((booking) => {
          const pending = booking.totalPrice - booking.advancePayment;
          const eventDate = new Date(booking.eventDate + "T00:00:00");
          const diffDays = Math.ceil((eventDate.getTime() - currentMockDate.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div
              key={booking.id}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col justify-between space-y-3 hover:bg-white/15 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-sm">{booking.hostName}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-orange-100 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{booking.eventDate} ({diffDays === 0 ? "¡Hoy!" : `Faltan ${diffDays} días`})</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-orange-100">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isSchedulePending(booking) ? "Horario por definir" : `${booking.eventTime} hrs`}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] bg-red-600/50 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                    Por cobrar
                  </span>
                  <p className="font-mono font-black text-base mt-1">
                    ${pending.toLocaleString("es-MX")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => onSelectBooking(booking)}
                  className="flex-1 py-1.5 bg-white text-brand-orange hover:bg-orange-50 font-extrabold rounded-xl text-xs transition-all"
                >
                  Ver Contrato
                </button>
                <button
                  onClick={() => handleSendReminder(booking)}
                  className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" /> Cobrar por WhatsApp
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
