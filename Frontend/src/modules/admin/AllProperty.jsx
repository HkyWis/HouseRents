import React, {
  useState,
  useEffect,
} from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import Toast from "../common/Toast";

axios.defaults.withCredentials = true;

const AdminAllProperty = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterAdType, setFilterAdType] = useState("");

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

  // GET PROPERTIES
  const getAllProperty = async () => {
    try {
      const response =
        await axios.get(
          "http://localhost:8001/api/admin/getallproperties",
          {
            withCredentials: true,
          }
        );

      if (response.data.success) {
        setAllProperties(
          response.data.data
        );
      } else {
        showToast(
          "error",
          response.data.message ||
            "Unauthorized access"
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
          "Failed to fetch properties"
        );
      }
    }
  };

  useEffect(() => {
    getAllProperty();
  }, []);

  const filteredProperties = allProperties
    .filter((p) => filterType === "" || p.propertyType.toLowerCase().includes(filterType.toLowerCase()))
    .filter((p) => filterAdType === "" || p.propertyAdType.toLowerCase().includes(filterAdType.toLowerCase()));

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
            Property Management
          </p>

          <h1 className="text-3xl font-bold text-slate-800">
            All Properties
          </h1>
        </div>

        {/* TOTAL */}
        <div className="bg-slate-100 border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">
            Total Properties
          </p>

          <h2 className="text-2xl font-bold text-slate-800">
            {
              allProperties.length
            }
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
          <option value="commercial">Commercial</option>
          <option value="land/plot">Land / Plot</option>
          <option value="residential">Residential</option>
        </select>

        <select
          value={filterAdType}
          onChange={(e) => setFilterAdType(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Ad Types</option>
          <option value="rent">Rent</option>
          <option value="sale">Sale</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-slate-100 border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            {/* TABLE HEAD */}
            <thead className="bg-slate-200 border-b border-slate-300">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">
                  Property
                </th>

                <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">
                  Owner ID
                </th>

                <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">
                  Type
                </th>

                <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">
                  Ad Type
                </th>

                <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">
                  Address
                </th>

                <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">
                  Contact
                </th>

                <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">
                  Amount
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {filteredProperties.length >
              0 ? (
                filteredProperties.map(
                  (
                    property,
                    index
                  ) => (
                    <tr
                      key={
                        property._id
                      }
                      className={`transition ${
                        index % 2 ===
                        0
                          ? "bg-slate-50"
                          : "bg-slate-100"
                      } hover:bg-blue-50`}
                    >
                      {/* PROPERTY */}
                      <td className="py-4 px-6 border-b border-slate-200">
                        <div className="flex items-center gap-4">
                          {/* ICON */}
                          <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                            🏠
                          </div>

                          {/* INFO */}
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              {
                                property.propertyType
                              }
                            </h3>

                            <p className="text-xs text-slate-500">
                              ID:{" "}
                              {property.propertyId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* OWNER ID */}
                      <td className="py-4 px-6 border-b border-slate-200 text-center text-slate-600">
                        {property.ownerId}
                      </td>

                      {/* PROPERTY TYPE */}
                      <td className="py-4 px-6 border-b border-slate-200 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
                          {
                            property.propertyType
                          }
                        </span>
                      </td>

                      {/* AD TYPE */}
                      <td className="py-4 px-6 border-b border-slate-200 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 capitalize">
                          {property.propertyAdType ||
                            "N/A"}
                        </span>
                      </td>

                      {/* ADDRESS */}
                      <td className="py-4 px-6 border-b border-slate-200 text-center text-slate-600">
                        {
                          property.propertyAddress
                        }
                      </td>

                      {/* CONTACT */}
                      <td className="py-4 px-6 border-b border-slate-200 text-center text-slate-600">
                        {
                          property.ownerContact
                        }
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 border-b border-slate-200 text-center">
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ">
                          {
                            property.propertyAmt
                          }
                        </span>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="py-16 text-center"
                  >
                    <p className="text-slate-500 text-lg font-medium">
                      No properties
                      found
                    </p>

                    <p className="text-slate-400 text-sm mt-2">
                      There are
                      currently no
                      properties
                      available.
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

export default AdminAllProperty;