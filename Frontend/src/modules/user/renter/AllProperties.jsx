import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../../common/Toast";

axios.defaults.withCredentials = true;

const RenterAllProperty = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const navigate = useNavigate();

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });
  };

  // GET BOOKINGS
  const getAllProperty = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8001/api/user/getallbookings",
        { withCredentials: true }
      );

      if (response.data.success) {
        setAllProperties(response.data.data);

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
          "Failed to fetch bookings"
        );
      }
    }
  };

  useEffect(() => {
    getAllProperty();
  }, []);

  const filteredProperties = allProperties.filter(
    (b) => filterStatus === "" || b.bookingStatus.toLowerCase() === filterStatus.toLowerCase()
  );

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
            Booking History
          </p>

          <h1 className="text-3xl font-bold text-slate-800">
            All My Bookings
          </h1>
        </div>

        {/* TOTAL */}
        <div className="bg-slate-100 border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">
            Total Bookings
          </p>

          <h2 className="text-2xl font-bold text-slate-800">
            {allProperties.length}
          </h2>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="booked">Booked</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-slate-100 border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* HEAD */}
            <thead className="bg-slate-200 border-b border-slate-300">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Booking
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Property ID
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Tenant Name
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Phone
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Booking Status
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {filteredProperties.length > 0 ? (
                filteredProperties.map(
                  (booking, index) => (
                    <tr
                      key={booking._id}
                      className={`transition ${index % 2 === 0
                          ? "bg-slate-50"
                          : "bg-slate-100"
                        } hover:bg-blue-50`}
                    >
                      {/* BOOKING */}
                      <td className="px-4 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                            📅
                          </div>

                          <div>
                            <h3 className="font-semibold text-slate-800">
                              Booking
                            </h3>

                            <p className="text-xs text-slate-500">
                              ID:{" "}
                              {booking._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PROPERTY ID */}
                      <td className="px-6 py-4 border-b border-slate-200 text-center text-slate-600">
                        {booking.propertyId}
                      </td>

                      {/* TENANT */}
                      <td className="px-6 py-4 border-b border-slate-200 text-center text-slate-700 font-medium">
                        {booking.userName}
                      </td>

                      {/* PHONE */}
                      <td className="px-6 py-4 border-b border-slate-200 text-center text-slate-600">
                        {booking.phone}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4 border-b border-slate-200 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${booking.bookingStatus ===
                              "booked"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {
                            booking.bookingStatus
                          }
                        </span>
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
                      No bookings found
                    </p>

                    <p className="text-slate-400 text-sm mt-2">
                      You don't have any bookings yet.
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

export default RenterAllProperty;