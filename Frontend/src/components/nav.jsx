import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { UserContext } from "../App";

const Navbar = () => {
  const navigate = useNavigate();

  const {
    userData,
    setUserData,
    userLoggedIn,
    setUserLoggedIn,
  } = useContext(UserContext);

  const [showDropdown, setShowDropdown] =
    useState(false);

  const dropdownRef = useRef();

  // CLOSE DROPDOWN
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("user");

    setUserData(null);
    setUserLoggedIn(false);

    navigate("/");
  };

  // DASHBOARD
  const handleDashboard = () => {
    if (userData?.type === "Admin") {
      navigate("/adminhome");
    } else if (userData?.type === "Owner") {
      navigate("/ownerhome");
    } else {
      navigate("/renterhome");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white backdrop-blur-md border-b border-slate-200 px-6 md:px-12 flex items-center justify-between shadow-sm">
      {/* LOGO */}
      <div className="text-2xl font-bold tracking-tight text-slate-800">
        <Link to={"/"}>
          Ease
          <span className="text-blue-500">
            Properties
          </span>
        </Link>
      </div>

      {/* MENU */}
      <div className="flex items-center gap-3">
        {/* Home */}
        <Link
          to="/"
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-blue-100 hover:text-blue-500 transition"
        >
          Home 
        </Link>

        {userLoggedIn ? (
          <div
            className="relative"
            ref={dropdownRef}
          >
            {/* USER BUTTON */}
            <button
              onClick={() =>
                setShowDropdown(
                  !showDropdown
                )
              }
              className="flex items-center gap-3 bg-white/80 hover:bg-blue-100 border border-slate-200 px-4 py-2 rounded-2xl shadow-sm transition"
            >
              {/* AVATAR */}
              <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold uppercase shadow-sm">
                {userData?.name?.charAt(0)}
              </div>

              {/* INFO */}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-[11px] text-slate-400">
                  Welcome
                </span>

                <span className="text-sm font-semibold text-slate-700">
                  {userData?.name} - {userData?.type}
                </span>
              </div>

              {/* ARROW */}
              <svg
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  showDropdown
                    ? "rotate-180"
                    : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* DROPDOWN */}
            {showDropdown && (
              <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                {/* USER INFO */}
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-800">
                    {userData?.name} - {userData?.type}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {userData?.email}
                  </p>
                </div>

                {/* DASHBOARD */}
                <button
                  onClick={() => {
                    handleDashboard();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  Dashboard
                </button>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* LOGIN */}
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-blue-100 hover:text-blue-500 transition"
            >
              Login
            </Link>

            {/* REGISTER */}
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;