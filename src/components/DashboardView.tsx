import React from "react";
import { Booking, PACKAGES, EXTRA_SERVICES } from "../types";
import { DollarSign, Percent, TrendingUp, Calendar, AlertCircle, ShoppingBag, PiggyBank } from "lucide-react";

interface DashboardViewProps {
  bookings: Booking[];
}

export default function DashboardView({ bookings }: DashboardViewProps) {
  // Calculate aggregate metrics
  const totalBookings = bookings.length;
  const totalGrossRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalCosts = bookings.reduce((sum, b) => sum + b.totalCost, 0);
  const totalNetProfit = bookings.reduce((sum, b) => sum + b.totalNetGain, 0);
  const averageNetMargin = totalGrossRevenue > 0 ? (totalNetProfit / totalGrossRevenue) * 100 : 0;

  // Count package popularity
  const packagePopularity = PACKAGES.map((pkg) => {
    const count = bookings.filter((b) => b.packageId === pkg.id).length;
    return {
      ...pkg,
      count,
    };
  }).sort((a, b) => b.count - a.count);

  // Count add-on service quantities sold
  const addOnsSold = EXTRA_SERVICES.map((service) => {
    const totalSold = bookings.reduce((sum, b) => {
      const found = b.selectedAddOns.find((item) => item.serviceId === service.id);
      return sum + (found ? found.quantity : 0);
    }, 0);
    return {
      ...service,
      totalSold,
      totalRevenue: totalSold * service.price,
      totalGain: totalSold * service.gain,
    };
  }).filter((s) => s.totalSold > 0).sort((a, b) => b.totalSold - a.totalSold);

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gross Profit */}
        <div className="bg-gradient-to-br from-brand-blue to-blue-800 rounded-3xl p-5 text-white shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] uppercase font-bold bg-white/15 px-2 py-0.5 rounded-full">Bruto</span>
          </div>
          <div>
            <p className="text-xs text-blue-100 font-medium">Ingresos Brutos Totales</p>
            <h3 className="text-3xl font-black tracking-tight font-mono">
              ${totalGrossRevenue.toLocaleString("es-MX")} <span className="text-xs font-semibold text-blue-200">MXN</span>
            </h3>
          </div>
        </div>

        {/* KPI 2: Net Profit */}
        <div className="bg-gradient-to-br from-brand-green to-emerald-700 rounded-3xl p-5 text-white shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] uppercase font-bold bg-white/15 px-2 py-0.5 rounded-full">Neto</span>
          </div>
          <div>
            <p className="text-xs text-emerald-100 font-medium">Ganancia Neta Estimada</p>
            <h3 className="text-3xl font-black tracking-tight font-mono">
              ${totalNetProfit.toLocaleString("es-MX")} <span className="text-xs font-semibold text-emerald-200">MXN</span>
            </h3>
          </div>
        </div>

        {/* KPI 3: Profit Margin % */}
        <div className="bg-gradient-to-br from-brand-orange to-orange-600 rounded-3xl p-5 text-white shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Percent className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] uppercase font-bold bg-white/15 px-2 py-0.5 rounded-full">Rendimiento</span>
          </div>
          <div>
            <p className="text-xs text-orange-100 font-medium">Margen Neto Promedio</p>
            <h3 className="text-3xl font-black tracking-tight font-mono">
              {averageNetMargin.toFixed(1)}%
            </h3>
          </div>
        </div>

        {/* KPI 4: Total Bookings */}
        <div className="bg-gradient-to-br from-brand-yellow via-amber-400 to-amber-500 rounded-3xl p-5 text-slate-900 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-black/10 p-2 rounded-xl backdrop-blur-sm">
              <Calendar className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-[10px] uppercase font-bold bg-black/10 px-2 py-0.5 rounded-full">Eventos</span>
          </div>
          <div>
            <p className="text-xs text-slate-800 font-medium">Contratos & Reservas</p>
            <h3 className="text-3xl font-black tracking-tight font-mono">
              {totalBookings} <span className="text-sm font-bold text-slate-700">Eventos</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Main Breakdown Area (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Packages */}
        <div className="lg:col-span-2 glass-panel-heavy rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-brand-blue tracking-tight">🎒 Popularidad de Paquetes</h3>
                <p className="text-xs text-brand-blue/60 font-black">Paquetes más contratados por tus clientes</p>
              </div>
              <TrendingUp className="w-5 h-5 text-brand-blue" />
            </div>

            <div className="space-y-4">
              {packagePopularity.map((pkg) => {
                const percentage = totalBookings > 0 ? (pkg.count / totalBookings) * 100 : 0;
                return (
                  <div key={pkg.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 font-bold">{pkg.name}</span>
                      <span className="text-slate-500 font-mono">
                        {pkg.count} {pkg.count === 1 ? "evento" : "eventos"} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/40 h-3.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-brand-blue h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional Services Sold */}
        <div className="glass-panel-heavy rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-brand-orange tracking-tight">🎁 Servicios Unitarios</h3>
              <p className="text-xs text-brand-orange/60 font-black">Detalle de aditamentos vendidos</p>
            </div>
            <ShoppingBag className="w-5 h-5 text-brand-orange" />
          </div>

          {addOnsSold.length === 0 ? (
            <div className="h-48 flex flex-col justify-center items-center text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mb-2 text-slate-400" />
              <p className="text-xs font-bold text-slate-700">No se han vendido servicios adicionales.</p>
              <p className="text-[10px] text-slate-500">Agrega servicios extra en tus contratos para ver estadísticas.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {addOnsSold.map((service) => (
                <div key={service.id} className="p-3 bg-white/50 rounded-2xl border border-white/50 flex justify-between items-center text-xs shadow-sm">
                  <div>
                    <p className="font-extrabold text-slate-800">{service.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Cant: {service.totalSold} unidades</p>
                  </div>
                  <div className="text-right font-mono font-bold">
                    <p className="text-slate-800">+${service.totalRevenue.toLocaleString("es-MX")}</p>
                    <p className="text-[10px] text-brand-green">Neto: +${service.totalGain.toLocaleString("es-MX")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
