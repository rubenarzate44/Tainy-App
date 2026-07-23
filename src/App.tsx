import React, { useState, useEffect } from "react";
import { Booking, PACKAGES, EXTRA_SERVICES, Package, getEndTime } from "./types";
import CalendarView from "./components/CalendarView";
import ContractForm from "./components/ContractForm";
import ContractDocument from "./components/ContractDocument";
import DashboardView from "./components/DashboardView";
import AlertsPanel from "./components/AlertsPanel";
import { initAuthListener, googleSignIn, logout } from "./lib/auth";
import { syncToGoogleSheets } from "./lib/sheets";
import { User } from "firebase/auth";
import {
  Calendar as CalendarIcon,
  FileText,
  TrendingUp,
  Share2,
  Trash2,
  Edit3,
  Eye,
  Plus,
  RefreshCw,
  LogOut,
  Sparkles,
  Info,
  Phone,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  X,
  CreditCard
} from "lucide-react";

// Default initial bookings state
const DEFAULT_BOOKINGS: Booking[] = [];

export default function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"calendar" | "contracts" | "dashboard">("calendar");
  const [activeView, setActiveView] = useState<"list" | "form" | "document">("list");
  
  // Form coordination states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Modal for inspecting contract from calendar view
  const [calendarModalBooking, setCalendarModalBooking] = useState<Booking | null>(null);

  // Search & Filter states for contracts tab
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");

  // OAuth & Google Sheets Sync States
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [showSyncSuccess, setShowSyncSuccess] = useState<boolean>(false);

  // Load bookings from LocalStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("tanylandia_bookings_clean");
    if (stored) {
      setBookings(JSON.parse(stored));
    } else {
      setBookings(DEFAULT_BOOKINGS);
      localStorage.setItem("tanylandia_bookings_clean", JSON.stringify(DEFAULT_BOOKINGS));
    }

    // Try to auto-connect Firebase Auth if session is already active
    initAuthListener(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    ).catch((err) => console.log("Firebase Auth no inicializado aún:", err));
  }, []);

  // Save bookings to LocalStorage whenever they change
  const saveBookings = (updatedBookings: Booking[]) => {
    setBookings(updatedBookings);
    localStorage.setItem("tanylandia_bookings_clean", JSON.stringify(updatedBookings));

    // If synchronized, push update message
    if (accessToken) {
      triggerSheetsSync(updatedBookings);
    }
  };

  const handleLogin = async () => {
    try {
      setSyncStatus("Iniciando sesión en Google...");
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setSyncStatus("Sesión iniciada. Sincronizando con Google Sheets...");
        await triggerSheetsSync(bookings, result.accessToken);
      }
    } catch (err) {
      console.error(err);
      setSyncStatus("Fallo de inicio de sesión.");
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setSheetUrl(null);
    setSyncStatus("");
  };

  const triggerSheetsSync = async (currentBookings = bookings, token = accessToken) => {
    if (!token) return;
    setSyncStatus("Sincronizando con Google Sheets...");
    const res = await syncToGoogleSheets(token, currentBookings, (status) => {
      setSyncStatus(status);
    });
    if (res.success && res.url) {
      setSheetUrl(res.url);
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 5000);
    }
  };

  // Create or Update Contract
  const handleSaveBooking = (booking: Booking) => {
    let updated: Booking[];
    const index = bookings.findIndex((b) => b.id === booking.id);
    if (index >= 0) {
      updated = [...bookings];
      updated[index] = booking;
    } else {
      updated = [booking, ...bookings];
    }
    saveBookings(updated);
    setActiveView("list");
    setSelectedBooking(null);
  };

  const handleDeleteBooking = (id: string, hostName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el contrato de ${hostName}?`)) {
      const filtered = bookings.filter((b) => b.id !== id);
      saveBookings(filtered);
    }
  };

  // Filtered contracts list
  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      b.hostName.toLowerCase().includes(query) ||
      b.phone.includes(query) ||
      b.eventDate.includes(query) ||
      b.address.toLowerCase().includes(query) ||
      b.id.toLowerCase().includes(query);

    if (!matchesQuery) return false;

    if (statusFilter === "pending") return !b.isPaidInFull;
    if (statusFilter === "paid") return b.isPaidInFull;
    return true;
  });

  return (
    <div className="min-h-screen pb-12 text-slate-800">
      {/* Visual top colorful border */}
      <div className="h-6 bg-gradient-to-r from-brand-blue via-brand-orange via-brand-yellow to-brand-green"></div>

      {/* Primary Brand Header */}
      <header className="max-w-7xl mx-auto px-4 py-6">
        <div className="glass-panel-heavy rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            {/* Visual playful logo */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue via-brand-orange to-brand-yellow p-1 shadow-lg transform rotate-3 flex items-center justify-center text-white text-3xl font-black font-display select-none">
              🎈
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-brand-blue tracking-tight font-display flex items-center justify-center md:justify-start gap-1">
                Tanylandia <span className="text-brand-orange">✨</span>
              </h1>
              <p className="text-xs text-brand-blue/70 font-black uppercase tracking-widest mt-0.5">
                Salón de fiestas infantiles & Gestión de Eventos
              </p>
            </div>
          </div>

          {/* Sync & Google Sheets Configuration */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/40 backdrop-blur-sm p-3 rounded-2xl border border-white/40">
            {user ? (
              <div className="text-center sm:text-right text-xs">
                <p className="font-bold text-brand-blue">🟢 Conectado con Google</p>
                <p className="text-[10px] text-slate-600 font-medium truncate max-w-[150px]">{user.email}</p>
              </div>
            ) : (
              <div className="text-center sm:text-right text-xs">
                <p className="font-bold text-slate-600">⚪ Modo Offline (Solo Local)</p>
                <p className="text-[10px] text-slate-500">Inicia sesión para sincronizar a Google Sheets</p>
              </div>
            )}

            <div className="flex gap-2">
              {user ? (
                <>
                  {sheetUrl && (
                    <a
                      href={sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-brand-green hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      📁 Ver Sheets
                    </a>
                  )}
                  <button
                    onClick={() => triggerSheetsSync()}
                    className="p-2 bg-white/60 hover:bg-white/80 rounded-xl text-slate-700 transition-all border border-white/40"
                    title="Sincronizar ahora"
                  >
                    <RefreshCw className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-100"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-brand-blue hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  Sincronizar Google Sheets
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sync status alert */}
        {syncStatus && (
          <div className="mt-3 mx-2 text-xs font-semibold text-brand-blue bg-white/80 backdrop-blur-sm border border-white/40 px-4 py-2 rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-blue" />
            <span>{syncStatus}</span>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Alerts / Notifications Panel for balances due 1 week before */}
        <AlertsPanel
          bookings={bookings}
          onSelectBooking={(booking) => {
            setSelectedBooking(booking);
            setActiveTab("contracts");
            setActiveView("document");
          }}
        />

        {/* Navigation Tabs bar */}
        <div className="flex justify-between items-center border-b border-white/20 pb-1 gap-2 flex-wrap">
          <div className="flex gap-2">
            <button
              id="tab-calendar-btn"
              onClick={() => {
                setActiveTab("calendar");
              }}
              className={`px-5 py-3 rounded-t-2xl font-black font-display text-sm tracking-wide transition-all flex items-center gap-2 ${
                activeTab === "calendar"
                  ? "bg-white/90 text-brand-blue shadow-md backdrop-blur-md transform translate-y-[2px]"
                  : "bg-white/20 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
              }`}
            >
              <CalendarIcon className="w-4.5 h-4.5" />
              Calendario de Eventos
            </button>

            <button
              id="tab-contracts-btn"
              onClick={() => {
                setActiveTab("contracts");
                setActiveView("list");
              }}
              className={`px-5 py-3 rounded-t-2xl font-black font-display text-sm tracking-wide transition-all flex items-center gap-2 ${
                activeTab === "contracts"
                  ? "bg-white/90 text-brand-blue shadow-md backdrop-blur-md transform translate-y-[2px]"
                  : "bg-white/20 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
              }`}
            >
              <FileText className="w-4.5 h-4.5" />
              Contratos ({bookings.length})
            </button>

            <button
              id="tab-dashboard-btn"
              onClick={() => setActiveTab("dashboard")}
              className={`px-5 py-3 rounded-t-2xl font-black font-display text-sm tracking-wide transition-all flex items-center gap-2 ${
                activeTab === "dashboard"
                  ? "bg-white/90 text-brand-blue shadow-md backdrop-blur-md transform translate-y-[2px]"
                  : "bg-white/20 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5" />
              Estadísticas & Finanzas
            </button>
          </div>

          {activeTab === "contracts" && activeView === "list" && (
            <button
              id="new-contract-btn"
              onClick={() => {
                setSelectedBooking(null);
                setSelectedDate("");
                setActiveView("form");
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-orange to-brand-yellow hover:brightness-105 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4.5 h-4.5 stroke-[3]" />
              Crear Nuevo Contrato
            </button>
          )}
        </div>

        {/* TAB 1: DEDICATED CALENDAR PAGE */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            {/* Quick KPI stats above calendar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel-heavy rounded-2xl p-4 shadow-md flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center font-bold">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Reservas</p>
                  <p className="text-xl font-black text-brand-blue font-mono">{bookings.length}</p>
                </div>
              </div>

              <div className="glass-panel-heavy rounded-2xl p-4 shadow-md flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-brand-green flex items-center justify-center font-bold">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Eventos Liquidados</p>
                  <p className="text-xl font-black text-brand-green font-mono">
                    {bookings.filter((b) => b.isPaidInFull).length}
                  </p>
                </div>
              </div>

              <div className="glass-panel-heavy rounded-2xl p-4 shadow-md flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-brand-orange flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Saldo Pendiente</p>
                  <p className="text-xl font-black text-brand-orange font-mono">
                    {bookings.filter((b) => !b.isPaidInFull).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Interactive Calendar View */}
            <CalendarView
              bookings={bookings}
              onSelectDate={(dateStr) => {
                // Clicking an empty date in calendar switches to contracts tab to create
                setSelectedDate(dateStr);
                setSelectedBooking(null);
                setActiveTab("contracts");
                setActiveView("form");
              }}
              onSelectBooking={(booking) => {
                // Clicking an occupied date opens contract detail modal
                setCalendarModalBooking(booking);
              }}
              onNewBookingAtDate={(dateStr) => {
                setSelectedDate(dateStr);
                setSelectedBooking(null);
                setActiveTab("contracts");
                setActiveView("form");
              }}
            />
          </div>
        )}

        {/* TAB 2: DEDICATED CONTRACTS PAGE */}
        {activeTab === "contracts" && (
          <div className="space-y-6">
            {activeView === "list" && (
              <div className="glass-panel-heavy rounded-3xl p-6 shadow-xl space-y-6">
                {/* Header & Search / Filter Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                  <div>
                    <h3 className="text-2xl font-black text-brand-blue tracking-tight font-display flex items-center gap-2">
                      📝 Gestión de Contratos
                    </h3>
                    <p className="text-xs text-brand-blue/70 font-bold">
                      Busca, administra, edita o actualiza detalles y pagos de cada cliente
                    </p>
                  </div>

                  {/* Search bar */}
                  <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <div className="relative min-w-[260px]">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar por anfitrión, fecha, tel..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                      <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          statusFilter === "all" ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Todos ({bookings.length})
                      </button>
                      <button
                        onClick={() => setStatusFilter("pending")}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          statusFilter === "pending" ? "bg-white text-brand-orange shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Pendientes ({bookings.filter((b) => !b.isPaidInFull).length})
                      </button>
                      <button
                        onClick={() => setStatusFilter("paid")}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          statusFilter === "paid" ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Liquidados ({bookings.filter((b) => b.isPaidInFull).length})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contracts List Grid */}
                {filteredBookings.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl bg-white/40">
                    <FileText className="w-12 h-12 mb-2 text-slate-400" />
                    <p className="font-bold text-slate-700">No se encontraron contratos</p>
                    <p className="text-xs mt-1">
                      {searchQuery || statusFilter !== "all"
                        ? "Intenta cambiar los filtros de búsqueda."
                        : "Haz clic en 'Crear Nuevo Contrato' o selecciona una fecha en el calendario."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBookings.map((booking) => {
                      const pkg = PACKAGES.find((p) => p.id === booking.packageId);
                      const pending = booking.totalPrice - booking.advancePayment;
                      const cleanPhone = booking.phone.replace(/[^0-9]/g, "");
                      const targetPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;

                      return (
                        <div
                          key={booking.id}
                          id={`contract-card-${booking.id}`}
                          className="p-5 bg-white/80 hover:bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-2">
                            {/* Card Top Header */}
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-black text-base text-slate-900 tracking-tight">
                                  🎈 {booking.hostName}
                                </h4>
                                <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
                                  <span>📅 {booking.eventDate}</span>
                                  <span>•</span>
                                  <span>⏱️ {booking.eventTime} a {getEndTime(booking.eventTime)} hrs</span>
                                </p>
                              </div>

                              <span
                                className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                                  booking.isPaidInFull
                                    ? "bg-brand-green/15 text-brand-green border border-brand-green/30"
                                    : "bg-brand-orange/15 text-brand-orange border border-brand-orange/30 animate-pulse"
                                }`}
                              >
                                {booking.isPaidInFull ? "✅ Liquidado" : "⏳ Saldo Pendiente"}
                              </span>
                            </div>

                            {/* Details Row */}
                            <div className="flex flex-wrap gap-2 text-xs pt-1">
                              <span className="bg-brand-blue/10 text-brand-blue px-2.5 py-1 rounded-lg font-bold">
                                📦 {pkg ? pkg.name : booking.packageId}
                              </span>
                              {booking.phone && (
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${targetPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors"
                                  title="Enviar WhatsApp"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  {booking.phone}
                                </a>
                              )}
                            </div>

                            {/* Address & Notes */}
                            <p className="text-xs text-slate-600 font-medium truncate">
                              📍 <b>Domicilio:</b> {booking.address}
                            </p>
                            {booking.notes && (
                              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                                💬 "{booking.notes}"
                              </p>
                            )}

                            {/* Financial breakdown pill */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 grid grid-cols-3 gap-2 text-center text-xs">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Total</span>
                                <span className="font-mono font-black text-slate-800">${booking.totalPrice.toLocaleString("es-MX")}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Anticipo</span>
                                <span className="font-mono font-bold text-emerald-600">${booking.advancePayment.toLocaleString("es-MX")}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Pendiente</span>
                                <span className={`font-mono font-black ${pending > 0 ? "text-brand-orange" : "text-brand-green"}`}>
                                  ${pending.toLocaleString("es-MX")}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons Row */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setActiveView("document");
                              }}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                              title="Ver documento oficial de contrato"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver Contrato
                            </button>

                            {/* EXPLICIT UPDATE DETAILS & PAYMENTS BUTTON */}
                            <button
                              id={`update-payment-btn-${booking.id}`}
                              onClick={() => {
                                setSelectedBooking(booking);
                                setActiveView("form");
                              }}
                              className="flex-1 py-2 px-3 bg-gradient-to-r from-brand-orange to-brand-yellow hover:brightness-105 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                              title="Actualizar datos del cliente, anticipo o abonos"
                            >
                              <CreditCard className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Actualizar Detalle y Pagos</span>
                            </button>

                            <button
                              onClick={() => handleDeleteBooking(booking.id, booking.hostName)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl transition-colors"
                              title="Eliminar contrato"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* FORM VIEW inside Contracts Tab */}
            {activeView === "form" && (
              <ContractForm
                initialDate={selectedDate}
                editBooking={selectedBooking}
                onSave={handleSaveBooking}
                onCancel={() => {
                  setActiveView("list");
                  setSelectedBooking(null);
                }}
              />
            )}

            {/* DOCUMENT VIEW inside Contracts Tab */}
            {activeView === "document" && selectedBooking && (
              <ContractDocument
                booking={selectedBooking}
                onClose={() => {
                  setActiveView("list");
                  setSelectedBooking(null);
                }}
                onEdit={() => {
                  setActiveView("form");
                }}
              />
            )}
          </div>
        )}

        {/* TAB 3: DASHBOARD */}
        {activeTab === "dashboard" && (
          <DashboardView bookings={bookings} />
        )}
      </main>

      {/* MODAL: VIEW CONTRACT DETAILS WHEN CLICKED FROM CALENDAR */}
      {calendarModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="max-w-4xl w-full my-8 relative">
            <ContractDocument
              booking={calendarModalBooking}
              onClose={() => setCalendarModalBooking(null)}
              onEdit={() => {
                const b = calendarModalBooking;
                setCalendarModalBooking(null);
                setSelectedBooking(b);
                setActiveTab("contracts");
                setActiveView("form");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
