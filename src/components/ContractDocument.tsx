import React from "react";
import { Booking, PACKAGES, EXTRA_SERVICES, CONTRACT_TERMS, getEndTime } from "../types";
import { Share2, PhoneCall, Copy, Check, Printer, FileText, ArrowLeft, Edit3 } from "lucide-react";

interface ContractDocumentProps {
  booking: Booking;
  onClose: () => void;
  onEdit?: () => void;
}

export default function ContractDocument({ booking, onClose, onEdit }: ContractDocumentProps) {
  const pkg = PACKAGES.find((p) => p.id === booking.packageId) || PACKAGES[0];
  const pendingBalance = Math.max(0, booking.totalPrice - booking.advancePayment);

  // Generate plain text for copying or sharing
  const generateContractText = (isUpdate = false) => {
    let addOnsText = "";
    if (booking.selectedAddOns.length > 0) {
      addOnsText = "\n\n*Servicios Adicionales:*";
      booking.selectedAddOns.forEach((item) => {
        const service = EXTRA_SERVICES.find((s) => s.id === item.serviceId);
        if (service) {
          const disc = item.discount || 0;
          const unitPrice = service.price * (1 - disc / 100);
          const itemTotal = unitPrice * item.quantity;
          const discInfo = disc > 0 ? ` [Con ${disc}% Desc.]` : "";
          addOnsText += `\n- ${service.name} (Cant: ${item.quantity})${discInfo} - $${itemTotal.toLocaleString("es-MX")} MXN`;
        }
      });
    }

    const title = isUpdate ? "🔄 ACTUALIZACIÓN DE CONTRATO TANYLANDIA" : "🎈 CONTRATO DE EVENTO - TANYLANDIA";

    return `*${title}*
--------------------------------------------
*Anfitrión:* ${booking.hostName}
*Domicilio:* ${booking.address}
*Fecha del Evento:* ${booking.eventDate}
*Horario del Evento:* ${booking.eventTime} a ${getEndTime(booking.eventTime)} hrs (Duración de 6.5 horas)
*Teléfono:* ${booking.phone}

*Paquete Contratado:* ${pkg.name} ($${pkg.price.toLocaleString("es-MX")} MXN)
*Detalles del Paquete:* ${pkg.description}${addOnsText}

--------------------------------------------
*RESUMEN DE CUENTA:*
*Costo Total del Evento:* $${booking.totalPrice.toLocaleString("es-MX")} MXN
*Anticipo Pagado:* $${booking.advancePayment.toLocaleString("es-MX")} MXN
*Saldo Pendiente:* $${pendingBalance.toLocaleString("es-MX")} MXN
*Estado:* ${booking.isPaidInFull ? "✅ LIQUIDADO / TOTALMENTE PAGADO" : "⚠️ PENDIENTE DE LIQUIDACIÓN"}

--------------------------------------------
*Términos y Condiciones de Tanylandia:*
0. En caso de permanecer después del término se cobrará hora extra.
1. El evento debe quedar pagado en su totalidad una semana antes del mismo.
2. En caso de cancelación no se regresará ningún anticipo.
3. Cualquier cambio de fecha está sujeto a disponibilidad.
4. Toma de corriente externa para shows/inflables: $300.00 MXN adicionales.

*Estrictamente Prohibido:*
1. Ingreso de mascotas.
2. Fumar dentro de las instalaciones.
3. Ingresar pelotas similares a las del juego.
4. Confeti, cañones de papel o espuma ($300.00 MXN de penalización).

*IMPORTANTE:* Cualquier desperfecto en las instalaciones (juegos, mobiliario, baños) causado durante el evento será responsabilidad del anfitrión, el cual deberá cubrir el monto indicado al término.`;
  };

  const handleCopyText = () => {
    const text = generateContractText();
    navigator.clipboard.writeText(text);
    alert("¡Contrato copiado al portapapeles con éxito!");
  };

  const handleSendWhatsApp = (isUpdate = false) => {
    const text = encodeURIComponent(generateContractText(isUpdate));
    // Sanitize phone number (remove spaces, special characters)
    const cleanPhone = booking.phone.replace(/[^0-9]/g, "");
    
    // Check if phone has country code, default to Mexico (+52) if 10 digits
    const targetPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
    
    const url = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${text}`;
    window.open(url, "_blank");
  };

  return (
    <div className="glass-panel-heavy rounded-3xl shadow-2xl overflow-hidden">
      {/* Action Header bar */}
      <div className="bg-gradient-to-r from-brand-blue to-blue-900 p-5 text-white flex justify-between items-center">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-bold bg-white/15 hover:bg-white/25 px-3.5 py-2 rounded-xl transition-all border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" /> Regresar
        </button>
        <span className="font-display font-bold text-sm tracking-wide">
          Vista Previa de Contrato
        </span>
        <div className="flex gap-2 items-center">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-xs font-black bg-brand-orange hover:bg-orange-600 text-white px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>Actualizar Detalle y Pagos</span>
            </button>
          )}
          <button
            onClick={handleCopyText}
            className="p-2 bg-white/15 hover:bg-white/25 rounded-xl transition-all border border-white/20"
            title="Copiar texto"
          >
            <Copy className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-transparent">
        {/* Printable styled view */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-8 space-y-6 relative overflow-hidden">
          {/* Watermark/Fun background dots */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

          {/* Document Brand Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <h1 className="text-4xl font-black text-brand-blue font-display tracking-tight">
                TANYLANDIA
              </h1>
              <p className="text-xs text-brand-orange font-bold uppercase tracking-wider">
                Salón de fiestas infantiles y eventos
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-slate-700">FOLIO DE RESERVA</p>
              <p className="font-mono text-base font-black text-brand-orange">{booking.id}</p>
              <p className="text-slate-400 font-medium">Generado el: {booking.createdAt}</p>
            </div>
          </div>

          {/* Section: Client & Event details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-brand-blue border-b pb-1">👤 Datos del Anfitrión</h3>
              <p className="text-slate-700"><span className="font-semibold text-slate-500">Nombre:</span> {booking.hostName}</p>
              <p className="text-slate-700"><span className="font-semibold text-slate-500">Domicilio:</span> {booking.address}</p>
              <p className="text-slate-700"><span className="font-semibold text-slate-500">Teléfono:</span> {booking.phone}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-brand-orange border-b pb-1">📅 Detalles del Evento</h3>
              <p className="text-slate-700"><span className="font-semibold text-slate-500">Fecha:</span> {booking.eventDate}</p>
              <p className="text-slate-700"><span className="font-semibold text-slate-500">Horario:</span> {booking.eventTime} a {getEndTime(booking.eventTime)} hrs <span className="text-[10px] text-brand-orange font-bold font-mono bg-orange-50 px-1.5 py-0.5 rounded-md ml-1 inline-block">(6.5 hrs)</span></p>
              <p className="text-slate-700"><span className="font-semibold text-slate-500">Paquete:</span> {pkg.name}</p>
            </div>
          </div>

          {/* Section: Package Description */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
            <h4 className="font-bold text-slate-800 mb-1">🎁 Contenido del {pkg.name}:</h4>
            <p className="text-slate-600 leading-relaxed text-xs">{pkg.description}</p>
          </div>

          {/* Section: Add-ons breakdown */}
          {booking.selectedAddOns.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-sm">➕ Servicios Unitarios Adicionales</h3>
              <table className="w-full text-xs text-left text-slate-500 border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                    <th className="py-2 px-3">Servicio</th>
                    <th className="py-2 px-3 text-center">Cantidad</th>
                    <th className="py-2 px-3 text-right">Precio Unitario</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.selectedAddOns.map((item) => {
                    const s = EXTRA_SERVICES.find((serv) => serv.id === item.serviceId);
                    if (!s) return null;
                    const disc = item.discount || 0;
                    const unitPrice = s.price * (1 - disc / 100);
                    const itemTotal = unitPrice * item.quantity;

                    return (
                      <tr key={item.serviceId} className="border-b border-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-800">
                          {s.name}
                          {disc > 0 && (
                            <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-md">
                              -{disc}% desc.
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono">
                          {disc > 0 ? (
                            <div className="flex flex-col items-end">
                              <span className="line-through text-slate-400 text-[10px]">${s.price} MXN</span>
                              <span className="text-emerald-700 font-bold">${unitPrice.toLocaleString("es-MX")} MXN</span>
                            </div>
                          ) : (
                            <span>${s.price} MXN</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                          ${itemTotal.toLocaleString("es-MX")} MXN
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Section: Balance Summary */}
          <div className="border-t pt-4 flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="text-xs text-slate-400">
              {booking.notes && (
                <p className="italic text-slate-600 mb-1">
                  <b>Notas:</b> {booking.notes}
                </p>
              )}
              *Este documento sirve como contrato oficial para salón Tanylandia.
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border min-w-[240px] space-y-1.5 text-right">
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>Costo Total:</span>
                <span className="font-mono text-slate-800">${booking.totalPrice.toLocaleString("es-MX")}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>Anticipo Pagado:</span>
                <span className="font-mono text-emerald-600">${booking.advancePayment.toLocaleString("es-MX")}</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t pt-1.5 text-slate-900">
                <span>Saldo Pendiente:</span>
                <span className={`font-mono text-lg ${pendingBalance > 0 ? "text-brand-orange" : "text-brand-green"}`}>
                  ${pendingBalance.toLocaleString("es-MX")}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures Area */}
          <div className="grid grid-cols-2 gap-12 pt-12 text-center text-xs">
            <div className="border-t pt-3">
              <p className="font-bold text-slate-800">{booking.hostName}</p>
              <p className="text-slate-400 font-medium">Firma del Anfitrión</p>
            </div>
            <div className="border-t pt-3">
              <p className="font-bold text-slate-800">Tanylandia Eventos</p>
              <p className="text-slate-400 font-medium">Firma de Conformidad</p>
            </div>
          </div>
        </div>

        {/* Action Controls Side Card */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 pb-2 border-b">
              🚀 Acciones y Compartir
            </h3>
            
            {onEdit && (
              <button
                onClick={onEdit}
                className="w-full py-3.5 bg-gradient-to-r from-brand-orange to-brand-yellow hover:brightness-105 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4 stroke-[3]" />
                Actualizar Detalle y Pagos
              </button>
            )}

            <p className="text-xs text-slate-500 leading-relaxed pt-1">
              Comparte el contrato directamente con el anfitrión usando cualquiera de estas opciones:
            </p>

            <button
              onClick={() => handleSendWhatsApp(false)}
              className="w-full py-3 bg-brand-green hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              💬 Enviar por WhatsApp
            </button>

            <button
              onClick={() => handleSendWhatsApp(true)}
              className="w-full py-3 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              🔄 Enviar Actualización
            </button>

            <button
              onClick={handleCopyText}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Copy className="w-4 h-4" /> Copiar Contrato (Texto)
            </button>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" /> Imprimir Contrato
            </button>
          </div>

          <div className="bg-gradient-to-br from-brand-orange/10 to-brand-yellow/10 p-5 rounded-2xl border border-brand-orange/10 space-y-3">
            <h4 className="font-bold text-xs text-brand-orange uppercase tracking-wider">
              💡 Cláusula de Liquidación:
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recuerda al cliente que el contrato debe quedar liquidado en su totalidad <b>una semana antes del evento</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
