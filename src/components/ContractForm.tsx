import React, { useState, useEffect } from "react";
import { Booking, PACKAGES, EXTRA_SERVICES, CONTRACT_TERMS, getEndTime } from "../types";
import { FileText, User, MapPin, Calendar, Clock, Phone, Sparkles, Check, DollarSign, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface ContractFormProps {
  initialDate?: string;
  editBooking?: Booking | null;
  onSave: (booking: Booking) => void;
  onCancel: () => void;
}

export default function ContractForm({
  initialDate = "",
  editBooking = null,
  onSave,
  onCancel,
}: ContractFormProps) {
  const [hostName, setHostName] = useState("");
  const [address, setAddress] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("12:00");
  const [phone, setPhone] = useState("");
  const [packageId, setPackageId] = useState("sirvan");
  const [advancePayment, setAdvancePayment] = useState<number>(1500); // Default downpayment
  const [notes, setNotes] = useState("");

  // Track quantities for extra add-on services
  const [selectedAddOns, setSelectedAddOns] = useState<{ [serviceId: string]: number }>({});

  // Show/hide terms and conditions accordion
  const [showTerms, setShowTerms] = useState(false);

  // Initialize form when editing or adding
  useEffect(() => {
    if (editBooking) {
      setHostName(editBooking.hostName);
      setAddress(editBooking.address);
      setEventDate(editBooking.eventDate);
      setEventTime(editBooking.eventTime);
      setPhone(editBooking.phone);
      setPackageId(editBooking.packageId);
      setAdvancePayment(editBooking.advancePayment);
      setNotes(editBooking.notes || "");

      const addOnMap: { [serviceId: string]: number } = {};
      editBooking.selectedAddOns.forEach((item) => {
        addOnMap[item.serviceId] = item.quantity;
      });
      setSelectedAddOns(addOnMap);
    } else {
      setHostName("");
      setAddress("");
      setEventDate(initialDate || new Date().toISOString().split("T")[0]);
      setEventTime("12:00");
      setPhone("");
      setPackageId("sirvan");
      setAdvancePayment(1500);
      setNotes("");
      setSelectedAddOns({});
    }
  }, [editBooking, initialDate]);

  // Adjust default advancePayment or package values
  const currentPackage = PACKAGES.find((p) => p.id === packageId) || PACKAGES[0];

  // Calculate prices, costs, and gains
  const calculateTotals = () => {
    // 1. Base Package calculations
    let totalPrice = currentPackage.price;
    let totalCost = currentPackage.cost;
    let totalNetGain = currentPackage.netGain;

    // 2. Extra Add-ons calculations
    Object.entries(selectedAddOns).forEach(([serviceId, qty]) => {
      const qtyVal = qty as number;
      if (qtyVal > 0) {
        const service = EXTRA_SERVICES.find((s) => s.id === serviceId);
        if (service) {
          totalPrice += service.price * qtyVal;
          totalNetGain += service.gain * qtyVal;
          // Cost is price minus gain
          const serviceCost = service.price - service.gain;
          totalCost += serviceCost * qtyVal;
        }
      }
    });

    const pendingBalance = Math.max(0, totalPrice - advancePayment);
    const isPaidInFull = pendingBalance === 0;

    return {
      totalPrice,
      totalCost,
      totalNetGain,
      pendingBalance,
      isPaidInFull,
    };
  };

  const { totalPrice, totalCost, totalNetGain, pendingBalance, isPaidInFull } = calculateTotals();

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    setSelectedAddOns((prev) => ({
      ...prev,
      [serviceId]: Math.max(0, quantity),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) {
      alert("Por favor ingresa el nombre del anfitrión.");
      return;
    }
    if (!address.trim()) {
      alert("Por favor ingresa el domicilio.");
      return;
    }
    if (!eventDate) {
      alert("Por favor selecciona una fecha para el evento.");
      return;
    }
    if (!phone.trim()) {
      alert("Por favor ingresa un número de teléfono.");
      return;
    }

    const addOnsList = Object.entries(selectedAddOns)
      .filter(([_, qty]) => (qty as number) > 0)
      .map(([serviceId, qty]) => ({ serviceId, quantity: qty as number }));

    const bookingData: Booking = {
      id: editBooking ? editBooking.id : `tany-${Date.now()}`,
      hostName,
      address,
      eventDate,
      eventTime,
      phone,
      packageId,
      selectedAddOns: addOnsList,
      totalPrice,
      totalCost,
      totalNetGain,
      advancePayment,
      isPaidInFull,
      notes,
      createdAt: editBooking ? editBooking.createdAt : new Date().toLocaleDateString("es-MX"),
    };

    onSave(bookingData);
  };

  return (
    <div className="glass-panel-heavy rounded-3xl shadow-2xl overflow-hidden">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-brand-orange to-brand-yellow p-6 text-white relative">
        <div className="flex items-center gap-3">
          <div className="bg-white/25 p-2.5 rounded-xl backdrop-blur-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight">
              {editBooking ? "📝 Editar Contrato" : "✨ Crear Nuevo Contrato"}
            </h2>
            <p className="text-xs text-orange-50 font-extrabold uppercase tracking-wide">
              Formulario de Contrato • Tanylandia
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Customer Data */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-blue border-b pb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-blue" />
              Datos del Cliente
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Nombre del Anfitrión <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="input-host-name"
                  type="text"
                  required
                  placeholder="Ej. María de Jesús Torres"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange text-sm transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Domicilio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="input-address"
                  type="text"
                  required
                  placeholder="Ej. Calle Primavera #123, Col. Centro"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange text-sm transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Fecha del Evento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    id="input-event-date"
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange text-sm transition-all font-mono shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Hora de Inicio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    id="input-event-time"
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange text-sm transition-all font-mono shadow-inner"
                  />
                </div>
                {eventTime && (
                  <div className="mt-1.5 p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] font-black text-brand-orange flex items-center gap-1.5 shadow-sm animate-pulse">
                    <span>⏱️</span>
                    <span>Término: <b className="font-mono text-xs">{getEndTime(eventTime)} hrs</b> (Duración fija de 6.5 horas)</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="input-phone"
                  type="tel"
                  required
                  placeholder="Ej. 5512345678 (WhatsApp)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange text-sm transition-all font-mono shadow-inner"
                />
              </div>
            </div>

            {/* Note/Specs area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Notas especiales o detalles del evento
              </label>
              <textarea
                placeholder="Ingresa notas, requerimientos o comentarios específicos..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-3 bg-white/60 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange text-sm transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Section 2: Event Pricing & Packages */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-orange border-b pb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-orange" />
              Paquete & Servicios Extra
            </h3>

            {/* Selector de Paquete */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Selecciona Paquete del Evento
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {PACKAGES.map((pkg) => {
                  const isSelected = packageId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setPackageId(pkg.id)}
                      className={`p-3 rounded-2xl cursor-pointer border-2 transition-all flex justify-between items-center ${
                        isSelected
                          ? "border-brand-orange bg-orange-50 text-brand-orange shadow-md"
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-extrabold text-sm">{pkg.name}</p>
                        <p className="text-[10px] opacity-80">{pkg.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-sm">${pkg.price.toLocaleString("es-MX")} MXN</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Servicios adicionales */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Servicios Unitarios Adicionales
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {EXTRA_SERVICES.map((service) => {
                  const qty = selectedAddOns[service.id] || 0;
                  return (
                    <div
                      key={service.id}
                      className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="text-left flex-1 mr-2">
                        <p className="font-black text-slate-800">{service.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium truncate max-w-[200px]" title={service.details}>
                          {service.details}
                        </p>
                        <p className="text-[10px] font-bold text-brand-blue font-mono">
                          ${service.price} MXN
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(service.id, qty - 1)}
                          className="w-7 h-7 rounded-lg bg-slate-200 font-bold flex items-center justify-center text-slate-700 hover:bg-brand-orange hover:text-white transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-sm">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(service.id, qty + 1)}
                          className="w-7 h-7 rounded-lg bg-slate-200 font-bold flex items-center justify-center text-slate-700 hover:bg-brand-orange hover:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Financial computations / Downpayment */}
        <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Anticipo / Monto Pagado ($)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-5 h-5 text-brand-green" />
              <input
                id="input-advance-payment"
                type="number"
                min={0}
                value={advancePayment}
                onChange={(e) => setAdvancePayment(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/50 text-base font-black font-mono text-emerald-700"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Ingresa el monto pagado para actualizar saldo pendiente.
            </p>
          </div>

          {/* Quick Stats Summary */}
          <div className="md:col-span-2 grid grid-cols-3 gap-3 text-center">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monto Total</span>
              <span className="text-xl font-black font-mono text-slate-800">
                ${totalPrice.toLocaleString("es-MX")}
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Pendiente</span>
              <span className={`text-xl font-black font-mono ${pendingBalance > 0 ? "text-brand-orange" : "text-brand-green"}`}>
                ${pendingBalance.toLocaleString("es-MX")}
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estado de Pago</span>
              {isPaidInFull ? (
                <span className="bg-brand-green/15 text-brand-green text-xs font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Liquidado
                </span>
              ) : (
                <span className="bg-brand-orange/15 text-brand-orange text-xs font-black px-2.5 py-1 rounded-full uppercase">
                  Pendiente
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Accordion for Terms & Conditions */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTerms(!showTerms)}
            className="w-full bg-slate-50 p-4 text-left font-bold text-sm text-slate-700 flex justify-between items-center hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              📜 Términos, Condiciones y Políticas de Tanylandia
            </span>
            {showTerms ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          
          {showTerms && (
            <div className="p-4 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-600 space-y-3 leading-relaxed">
              <p className="font-extrabold text-slate-700">Términos y condiciones de Tanylandia:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><b className="text-slate-800">0. Extra horas:</b> En caso de que permanezca en el salón después del término de su evento se le cobrará una hora extra.</li>
                <li><b className="text-slate-800">1. Liquidación:</b> El evento debe quedar pagado en su totalidad una semana antes del mismo (una semana antes).</li>
                <li><b className="text-slate-800">2. Cancelación:</b> En caso de cancelación no se regresará ningún anticipo.</li>
                <li><b className="text-slate-800">3. Cambios:</b> Cualquier cambio de fecha está sujeto a disponibilidad.</li>
                <li><b className="text-slate-800">4. Equipos externos:</b> En caso de ingresar un show de cualquier tipo o externo como microondas, inflable, etc. que necesite toma de corriente se cobrarán $300.00 MXN adicionales.</li>
              </ul>
              
              <p className="font-extrabold text-slate-700 pt-1">Estrictamente prohibido dentro de Tanylandia:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>🚫 Ingreso de cualquier tipo de mascota.</li>
                <li>🚫 Fumar dentro de las instalaciones.</li>
                <li>🚫 Ingresar pelotas similares a las del juego.</li>
                <li>🚫 Confeti, cañones de papel o espuma de cualquier tipo (penalización de $300.00 MXN adicionales si no se respeta).</li>
              </ul>

              <p className="bg-orange-50 text-brand-orange p-3 rounded-xl font-bold border border-brand-orange/10">
                ⚠️ IMPORTANTE: CUALQUIER DESPERFECTO EN LAS INSTALACIONES DE TANYLANDIA (JUEGOS, MOBILIARIO, BAÑOS, ACCESORIOS) CAUSADOS DURANTE EL EVENTO SERÁN RESPONSABILIDAD DEL ANFITRIÓN, EL CUAL DEBERÁ CUBRIR EL MONTO QUE TANYLANDIA INDIQUE AL TÉRMINO DEL EVENTO.
              </p>
            </div>
          )}
        </div>

        {/* Form controls */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            id="cancel-contract-btn"
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            id="save-contract-btn"
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-brand-blue to-blue-700 hover:brightness-110 text-white rounded-2xl font-bold shadow-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            {editBooking ? "Guardar Cambios" : "Generar Contrato"}
          </button>
        </div>
      </form>
    </div>
  );
}
