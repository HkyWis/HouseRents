import React, {
  useState,
  useContext,
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from "../../components/nav";
import Toast from "../common/Toast";

import { UserContext } from "../../App";

axios.defaults.withCredentials = true;

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // CONTEXT
  const {
    setUserData,
    setUserLoggedIn,
  } = useContext(UserContext);

  // FORM DATA
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  // TOAST
  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  // SHOW TOAST
  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });
  };

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setData({
      ...data,
      [name]: value,
    });
  };

  // LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8001/api/user/login",
        data,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const user = res.data.user;

        // SAVE TO LOCAL STORAGE
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );

        // UPDATE CONTEXT
        setUserData(user);
        setUserLoggedIn(true);

        // SUCCESS TOAST
        showToast(
          "success",
          res.data.message
        );

        // REDIRECT
        setTimeout(() => {
          switch (user.type) {
            case "Admin":
              navigate("/adminhome");
              break;

            case "Owner":
              navigate("/ownerhome");
              break;

            default:
              navigate("/renterhome");
              break;
          }
        }, 800);
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
        "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-300 flex flex-col">
      {/* TOAST */}
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

      {/* NAVBAR */}
      <Navbar />

      {/* LOGIN FORM */}
      <div className="flex-grow flex justify-center items-center px-4 pt-20">
        <div className="bg-white/80 border border-slate-200 backdrop-blur-md shadow-xl rounded-3xl w-full max-w-md p-8">
          {/* HEADER */}
          <div className="text-center mb-7">
            {/* ICON */}
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 text-3xl shadow-inner">
              🔒
            </div>

            {/* TITLE */}
            <h1 className="text-3xl font-bold text-slate-800 mt-5">
              Sign In
            </h1>

            {/* SUBTITLE */}
            <p className="text-slate-500 mt-2 text-sm">
              Welcome back to EaseProperties
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* EMAIL */}
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 transition"
            />

            {/* PASSWORD */}
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
                placeholder="New Password"
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

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
            >
              Sign In
            </button>

            {/* LINKS */}
            <div className="flex justify-between text-sm pt-2">
              <Link
                to="/forgotpassword"
                className="text-red-400 hover:text-red-500 transition"
              >
                Forgot Password?
              </Link>

              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-600 transition"
              >
                Create Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;