import React, { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import axios from "axios";

import Navbar from "../../components/nav";
import Toast from "../common/Toast";

axios.defaults.withCredentials = true;

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    type: "",
  });

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData({
      ...data,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8001/api/user/register",
        data,
        { withCredentials: true }
      );

      if (res.data.success) {
        showToast(
          "success",
          res.data.message
        );

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        showToast(
          "error",
          res.data.message
        );
      }
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
        "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-300 flex flex-col">
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() =>
            setToast({
              ...toast,
              show: false,
            })
          }
        />
      )}

      <Navbar />

      <div className="flex-grow flex justify-center items-center px-4 pt-20">
        <div className="bg-white border border-slate-200 backdrop-blur-md shadow-xl rounded-3xl w-full max-w-md p-8">
          {/* ICON */}
          <div className="text-center mb-7">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 text-3xl shadow-inner">
              📝
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mt-5">
              Create Account
            </h1>

            <p className="text-slate-500 mt-2 text-sm">
              Join EaseProperties today
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 transition"
            />

            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 transition"
            />

            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={data.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 transition"
              />

              <span
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-4 top-4 cursor-pointer text-slate-400"
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </span>
            </div>

            <select
              name="type"
              value={data.type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">
                Select User Type
              </option>

              <option value="Renter">
                Renter
              </option>

              <option value="Owner">
                Owner
              </option>
            </select>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
            >
              Sign Up
            </button>

            <div className="text-center text-sm pt-2">
              <span className="text-slate-500">
                Already have an account?{" "}
              </span>

              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-600"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;