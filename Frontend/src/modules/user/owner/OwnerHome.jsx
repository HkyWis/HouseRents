import React, { useState } from "react";

import AddProperty from "./AddProperty";
import AllProperties from "./AllProperties";
import AllBookings from "./AllBookings";

import Navbar from "../../../components/nav";

const tabs = [
  {
    name: "Add Property",
    component: <AddProperty />,
  },
  {
    name: "All Properties",
    component: <AllProperties />,
  },
  {
    name: "All Bookings",
    component: <AllBookings />,
  },
];

const OwnerHome = () => {
  const [activeTab, setActiveTab] =
    useState(0);

  return (
    <div className="min-h-screen bg-slate-300">
      {/* NAVBAR */}
      <Navbar />

      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-24 pb-10">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-500 mb-2">
            Owner Dashboard
          </p>

          <h1 className="text-4xl font-bold text-slate-800">
            Manage Your Properties
          </h1>

        </div>

        {/* MAIN CARD */}
        <div className="bg-slate-100 border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          {/* TABS */}
          <div className="border-b border-slate-200 bg-slate-100 backdrop-blur-md">
            <div className="flex flex-wrap gap-3 p-4">
              {tabs.map(
                (tab, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setActiveTab(
                        index
                      )
                    }
                    className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      activeTab ===
                      index
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {tab.name}
                  </button>
                )
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-5 md:p-6">
            {
              tabs[activeTab]
                .component
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerHome;