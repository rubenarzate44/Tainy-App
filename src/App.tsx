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
  AlertCircle
} from "lucide-react";

// Default/mock initial bookings to populate the interface immediately
const DEFAULT_BOOKINGS: Booking[] = [];

export default function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"calendar" | "dashboard">("calendar");
  const [activeView, setActiveView] = useState<"list" | "form" | "document">("list");
  
  // Form coordination states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

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
  };

  const handleDeleteBooking = (id: string, hostName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el contrato de ${hostName}?`)) {
      const filtered = bookings.filter((b) => b.id !== id);
      saveBookings(filtered);
    }
  };

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
            setActiveView("document");
          }}
        />

        {/* Navigation Tabs bar */}
        <div className="flex justify-between items-center border-b border-white/20 pb-1 gap-2">
          <div className="flex gap-2">
            <button
              id="tab-calendar-btn"
              onClick={() => {
                setActiveTab("calendar");
                setActiveView("list");
              }}
              className={`px-5 py-3 rounded-t-2xl font-black font-display text-sm tracking-wide transition-all flex items-center gap-2 ${
                activeTab === "calendar"
                  ? "bg-white/90 text-brand-blue shadow-md backdrop-blur-md transform translate-y-[2px]"
                  : "bg-white/20 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
              }`}
            >
              <CalendarIcon className="w-4.5 h-4.5" />
              Calendario & Contratos
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

          {activeTab === "calendar" && activeView === "list" && (
            <button
              id="new-contract-floating-btn"
              onClick={() => {
                setSelectedBooking(null);
                setSelectedDate("");
                setActiveView("form");
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-orange to-brand-yellow hover:brightness-105 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4.5 h-4.5 stroke-[3]" />
              Crear Contrato
            </button>
          )}
        </div>

        {/* Dynamic Views Rendering */}
        {activeTab === "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Form or Document or Booking list depending on activeView */}
            <div className="lg:col-span-7 space-y-6">
              {activeView === "list" && (
                <div className="glass-panel-heavy rounded-3xl p-6 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-brand-blue tracking-tight">📝 Listado de Contratos</h3>
                    <p className="text-xs text-brand-blue/60 font-black">Gestiona y visualiza todos los contratos generados</p>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl bg-white/40">
                      <FileText className="w-12 h-12 mb-2 text-slate-400" />
                      <p className="font-bold text-slate-700">No hay contratos guardados</p>
                      <p className="text-xs mt-1">Usa el botón para crear tu primer contrato o haz clic en el calendario.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {bookings.map((booking) => {
                        const pkg = PACKAGES.find((p) => p.id === booking.packageId);
                        const pending = booking.totalPrice - booking.advancePayment;
                        return (
                          <div
                            key={booking.id}
                            id={`booking-item-${booking.id}`}
                            className="p-4 bg-white/60 hover:bg-white/80 rounded-2xl border border-white/50 hover:border-white transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
                          >
                            <div className="text-left space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-800">
                                  {booking.hostName}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-white/60 px-2 py-0.5 rounded-md">
                                  {booking.eventDate}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                                <span className="bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-md font-bold text-[10px]">
                                  {pkg ? pkg.name : booking.packageId}
                                </span>
                                ⏱️ {booking.eventTime} a {getEndTime(booking.eventTime)} hrs
                              </p>
                              {booking.phone && (
                                <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" /> {booking.phone}
                                </p>
                              )}
                            </div>

                            <div className="flex sm:flex-col items-end gap-3 justify-between w-full sm:w-auto border-t border-slate-200/50 sm:border-t-0 pt-2 sm:pt-0">
                              <div className="text-right">
                                <p className="text-xs font-black text-slate-700">
                                  Total: <span className="font-mono">${booking.totalPrice.toLocaleString("es-MX")}</span>
                                </p>
                                <p className={`text-[10px] font-black ${pending > 0 ? "text-brand-orange" : "text-brand-green"}`}>
                                  {pending > 0 ? `Pendiente: $${pending.toLocaleString("es-MX")}` : "✅ LIQUIDADO"}
                                </p>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setActiveView("document");
                                  }}
                                  className="p-1.5 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
                                  title="Ver documento de contrato"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setActiveView("form");
                                  }}
                                  className="p-1.5 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
                                  title="Editar contrato"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBooking(booking.id, booking.hostName)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 border border-red-100 transition-colors"
                                  title="Eliminar contrato"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

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

              {activeView === "document" && selectedBooking && (
                <ContractDocument
                  booking={selectedBooking}
                  onClose={() => {
                    setActiveView("list");
                    setSelectedBooking(null);
                  }}
                />
              )}
            </div>

            {/* Right side: Always show the Interactive Calendar in Tab 1 */}
            <div className="lg:col-span-5">
              <CalendarView
                bookings={bookings}
                onSelectDate={(dateStr) => {
                  setSelectedDate(dateStr);
                  setSelectedBooking(null);
                  setActiveView("form");
                }}
                onSelectBooking={(booking) => {
                  setSelectedBooking(booking);
                  setActiveView("document");
                }}
                onNewBookingAtDate={(dateStr) => {
                  setSelectedDate(dateStr);
                  setSelectedBooking(null);
                  setActiveView("form");
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <DashboardView bookings={bookings} />
        )}
      </main>
    </div>
  );
}
