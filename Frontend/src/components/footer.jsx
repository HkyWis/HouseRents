import React from "react";
import {
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";

import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#eef3f8] border-t border-slate-200 px-6 md:px-12 py-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        {/* LOGO */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Ease
            <span className="text-blue-500">
              Properties
            </span>
          </h1>
        </div>

        {/* COPYRIGHT */}
        <p className="text-sm text-slate-500">
          © 2025 EaseProperties. All rights reserved.
        </p>

        {/* SOCIAL */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-500 hover:border-blue-200 hover:shadow-md transition"
          >
            <FaInstagram className="text-xl" />
          </Link>

          <Link
            to="/"
            className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-500 hover:border-blue-200 hover:shadow-md transition"
          >
            <FaFacebook className="text-xl" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;