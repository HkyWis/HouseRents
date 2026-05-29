import { useState } from "react";

import AllUsers from "./AllUsers";
import AllProperty from "./AllProperty";
import AllBookings from "./AllBookings";

import Navbar from "../../components/nav";

const AdminHome = () => {
  const [activeTab, setActiveTab] =
    useState("users");

  const tabs = [
    {
      key: "users",
      label: "All Users",
    },
    {
      key: "properties",
      label: "All Properties",
    },
    {
      key: "bookings",
      label: "All Bookings",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-300">
      {/* NAVBAR */}
      <Navbar />

      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-24 pb-10">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-500 mb-2">
            Admin Dashboard
          </p>

          <h1 className="text-4xl font-bold text-slate-800">
            Manage Platform
          </h1>

        </div>

        {/* TABS CARD */}
        <div className="bg-slate-100 border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          {/* TAB HEADER */}
          <div className="border-b border-slate-200 bg-slate-100/80 backdrop-blur-md">
            <div className="flex flex-wrap gap-3 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() =>
                    setActiveTab(
                      tab.key
                    )
                  }
                  className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    activeTab ===
                    tab.key
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-5 md:p-6">
            {activeTab ===
              "users" && (
              <AllUsers />
            )}

            {activeTab ===
              "properties" && (
              <AllProperty />
            )}

            {activeTab ===
              "bookings" && (
              <AllBookings />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;