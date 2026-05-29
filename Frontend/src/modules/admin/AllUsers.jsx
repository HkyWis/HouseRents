import React, {
  useState,
  useEffect,
} from "react";

import axios from "axios";

import Toast from "../common/Toast";

import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

const AllUsers = () => {
  const [allUser, setAllUser] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const navigate = useNavigate();

  // TOAST
  const showToast = (
    type,
    message
  ) => {
    setToast({
      show: true,
      type,
      message,
    });
  };

  // GET USERS
  useEffect(() => {
    getAllUser();
  }, []);

  const getAllUser = async () => {
    try {
      const response =
        await axios.get(
          "http://localhost:8001/api/admin/getallusers"
        );

      if (response.data.success) {
        setAllUser(
          response.data.data
        );
      } else {
        showToast(
          "error",
          response.data.message
        );

        navigate("/login");
      }
    } catch (error) {
      console.error(error);

      if (
        error.response &&
        error.response.status === 401
      ) {
        showToast(
          "error",
          "Session expired, please login again"
        );

        navigate("/login");
      } else {
        showToast(
          "error",
          "Failed to fetch users"
        );
      }
    }
  };

  // HANDLE STATUS
  const handleStatus = async (
    userid,
    status
  ) => {
    try {
      const res = await axios.post(
        "http://localhost:8001/api/admin/handlestatus",
        {
          userid,
          status,
        }
      );

      if (res.data.success) {
        showToast(
          "success",
          "Status updated successfully"
        );

        getAllUser();
      } else {
        showToast(
          "error",
          res.data.message
        );
      }
    } catch (error) {
      console.error(error);

      showToast(
        "error",
        "Failed to update status"
      );
    }
  };

  const filteredUsers = allUser
    .filter((u) => filterType === "" || u.type.toLowerCase() === filterType.toLowerCase())
    .filter((u) => filterStatus === "" || u.granted === filterStatus);

  return (
    <div className="mt-6">
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

      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-500 mb-2">
            Admin Panel
          </p>

          <h1 className="text-3xl font-bold text-slate-800">
            All Users
          </h1>
        </div>

        {/* TOTAL */}
        <div className="bg-slate-100 border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">
            Total Users
          </p>

          <h2 className="text-2xl font-bold text-slate-800">
            {allUser.length}
          </h2>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="owner">Owner</option>
          <option value="renter">Renter</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="granted">Granted</option>
          <option value="ungranted">Waiting Approval (Ungranted)</option>
        </select>
      </div>

      {/* TABLE CARD */}
      <div className="bg-slate-100 border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            {/* HEAD */}
            <thead className="bg-slate-200 border-b border-slate-300">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">
                  User
                </th>

                <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">
                  Email
                </th>

                <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">
                  Type
                </th>

                <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">
                  Status
                </th>

                <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(
                  (user, index) => (
                    <tr
                      key={user._id}
                      className={`transition ${index % 2 === 0
                          ? "bg-slate-50"
                          : "bg-slate-100"
                        } hover:bg-blue-50`}
                    >
                      {/* USER */}
                      <td className="py-4 px-6 border-b border-slate-200">
                        <div className="flex items-center gap-4">
                          {/* AVATAR */}
                          <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold uppercase shadow-sm">
                            {user?.name?.charAt(
                              0
                            )}
                          </div>

                          {/* INFO */}
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              {user.name}
                            </h3>

                            <p className="text-xs text-slate-500">
                              ID:{" "}
                              {user._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="py-4 px-6 border-b border-slate-200 text-center text-slate-600">
                        {user.email}
                      </td>

                      {/* TYPE */}
                      <td className="py-4 px-6 border-b border-slate-200 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
                          {user.type}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-6 border-b border-slate-200 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${user.type === "Admin"
                              ? "bg-red-100 text-red-700"
                              : user.type === "Renter"
                                ? "bg-blue-100 text-blue-700"
                                : user.granted === "granted"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {user.type === "Admin"
                            ? "Admin"
                            : user.type === "Renter"
                              ? "Renter"
                              : user.granted === "granted"
                                ? "Granted"
                                : "Waiting Approval"}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="py-4 px-6 border-b border-slate-200 text-center">
                        {user.type ===
                          "Owner" &&
                          user.granted ===
                          "ungranted" && (
                            <button
                              onClick={() =>
                                handleStatus(
                                  user._id,
                                  "granted"
                                )
                              }
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium shadow-sm transition"
                            >
                              Grant
                            </button>
                          )}

                        {user.type ===
                          "Owner" &&
                          user.granted ===
                          "granted" && (
                            <button
                              onClick={() =>
                                handleStatus(
                                  user._id,
                                  "ungranted"
                                )
                              }
                              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium shadow-sm transition"
                            >
                              Ungrant
                            </button>
                          )}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-16 text-center"
                  >
                    <p className="text-slate-500 text-lg font-medium">
                      No users found
                    </p>

                    <p className="text-slate-400 text-sm mt-2">
                      There are currently no users available.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;