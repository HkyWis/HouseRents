import { useState, useContext } from "react";
import PropTypes from "prop-types";

import { UserContext } from "../../../App";

import AllPropertiesCards from "../AllPropertiesCards";
import FavoriteAllProperty from "../AllFavoriteList";

import AllProperty from "./AllProperties";

import Navbar from "../../../components/nav";

const CustomTabPanel = ({
  children,
  value,
  index,
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      className="w-full"
    >
      {value === index && (
        <div>{children}</div>
      )}
    </div>
  );
};

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number
    .isRequired,
  value: PropTypes.number
    .isRequired,
};

const RenterHome = () => {
  const user =
    useContext(UserContext);

  const [value, setValue] = useState(0);

  return (
    <div className="min-h-screen bg-slate-300">
      {/* NAVBAR */}
      <Navbar />

      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-24 pb-10">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-500 mb-2">
            Renter Dashboard
          </p>

          <h1 className="text-4xl font-bold text-slate-800">
            Find Your Perfect Property
          </h1>

        </div>

        {/* MAIN CARD */}
        <div className="bg-slate-100 border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          {/* TABS */}
          <div className="border-b border-slate-200 bg-slate-100/80 backdrop-blur-md">
            <div className="flex flex-wrap gap-3 p-4">
              <button
                onClick={() =>
                  setValue(0)
                }
                className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${value === 0
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
              >
                All Properties
              </button>

              <button
                onClick={() =>
                  setValue(1)
                }
                className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${value === 1
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
              >
                Booking History
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-5 md:p-6">
            <CustomTabPanel
              value={value}
              index={0}
            >
              <AllPropertiesCards
                loggedIn={
                  user.userLoggedIn
                }
              />
            </CustomTabPanel>

            <CustomTabPanel
              value={value}
              index={1}
            >
              <AllProperty />
            </CustomTabPanel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenterHome;