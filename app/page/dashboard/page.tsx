"use client";
import React, { useState, useMemo, useEffect } from "react";
// import UseAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
// import DashboardService from "./services/index.service";
import SalesLineChart from "./components/sales-chart";
import OrdersBarChart from "./components/orders-bar-chart";
import SalesPieChart from "./components/sales-pie-chart";

export const monthlySales = [
  { month: "Jan", sales: 4200 },
  { month: "Feb", sales: 3800 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4700 },
  { month: "May", sales: 5200 },
  { month: "Jun", sales: 6100 },
];

export const ordersByCategory = [
  { category: "Electronics", orders: 320 },
  { category: "Fashion", orders: 410 },
  { category: "Home & Kitchen", orders: 290 },
  { category: "Books", orders: 120 },
];

export const salesByRegion = [
  { name: "North America", value: 4000 },
  { name: "Europe", value: 3000 },
  { name: "Asia", value: 5000 },
  { name: "Other", value: 1500 },
];

const BillDashboard: React.FC = () => {
  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}>
      <div className="p-6 bg-gray-100 min-h-screen grid gap-6">
        <SalesLineChart data={monthlySales} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OrdersBarChart data={ordersByCategory} />
          <SalesPieChart data={salesByRegion} />
        </div>
      </div>
    </div>
  );
};

export default BillDashboard;
