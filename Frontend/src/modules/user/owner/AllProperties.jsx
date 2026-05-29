import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill-new";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../../common/Toast";

axios.defaults.withCredentials = true;
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

const OwnerAllProperties = () => {
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [show, setShow] = useState(false);
  const fileInputRef = useRef(null);

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const [editingPropertyId, setEditingPropertyId] = useState(null);

  const [editingPropertyData, setEditingPropertyData] = useState({
    propertyType: "",
    propertyAdType: "",
    propertyAddress: "",
    ownerContact: "",
    propertyPrice: 0,
    propertyAmt: 0,
    additionalInfo: "",
  });

  const [allProperties, setAllProperties] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterAdType, setFilterAdType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const navigate = useNavigate();

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });
  };

  const handleClose = () => {
    setShow(false);
    setNewImages([]);
    setNewImagePreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setExistingImages([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setEditingPropertyId(null);
    setEditingPropertyData({
      propertyType: "",
      propertyAdType: "",
      propertyAddress: "",
      ownerContact: "",
      propertyPrice: 0,
      propertyAmt: 0,
      additionalInfo: "",
    });
  };

  const handleShow = (property) => {
    setEditingPropertyId(property._id);
    setEditingPropertyData({ ...property });
    setExistingImages(property.propertyImage || []);
    setShow(true);
  };

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const getAllProperty = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8001/api/owner/getallproperties",
        { withCredentials: true }
      );

      if (response.data.success) {
        setAllProperties(response.data.data);
      } else {
        showToast("error", "Unauthorized access");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);

      if (error.response && error.response.status === 401) {
        showToast("error", "Session expired, please login again");
        navigate("/login");
      } else {
        showToast("error", "Failed to fetch properties");
      }
    }
  };

  useEffect(() => {
    getAllProperty();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages((prevImages) => {
      const updatedImages = prevImages.filter(
        (_, i) => i !== index
      );

      return updatedImages;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditingPropertyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveChanges = async (propertyId, status) => {
    try {
      const formData = new FormData();

      Object.entries(editingPropertyData).forEach(([key, value]) => {
        if (
          key !== "isAvailable" &&
          key !== "propertyImage" &&
          key !== "existingImages"
        ) {
          formData.append(key, value);
        }
      });

      if (newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          formData.append("propertyImages", newImages[i]);
        }
      }

      formData.append(
        "existingImages",
        JSON.stringify(existingImages)
      );

      const res = await axios.patch(
        `http://localhost:8001/api/owner/updateproperty/${propertyId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (res.data.success) {
        showToast("success", res.data.message);
        handleClose();
        getAllProperty();
      } else {
        showToast("error", res.data.message || "Unauthorized access");
      }
    } catch (error) {
      console.log("Error detail:", error.response?.data);

      if (error.response && error.response.status === 401) {
        showToast("error", "Session expired, please login again");
        navigate("/login");
      } else {
        showToast("error", error.response?.data?.message || "Failed to save changes");
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8001/api/owner/deleteproperty/${selectedDeleteId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        showToast("success", response.data.message);
        setDeleteModal(false);
        getAllProperty();
      } else {
        showToast("error", response.data.message);
      }
    } catch (error) {
      console.log(error);
      showToast("error", "Failed to delete property");
    }
  };

  const filteredProperties = allProperties
    .filter((p) => filterType === "" || p.propertyType.toLowerCase().includes(filterType.toLowerCase()))
    .filter((p) => filterAdType === "" || p.propertyAdType.toLowerCase().includes(filterAdType.toLowerCase()))
    .filter((p) => filterStatus === "" || p.isAvailable.toLowerCase() === filterStatus.toLowerCase());

  return (
    <div className="mt-6">
      {toast.show && <Toast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />}

      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-500 mb-2">
            Property Management
          </p>

          <h1 className="text-3xl font-bold text-slate-800">
            Your Properties
          </h1>
        </div>

        <div className="bg-slate-100 border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">
            Total Properties
          </p>

          <h2 className="text-2xl font-bold text-slate-800">
            {allProperties.length}
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

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-slate-100 border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-200 border-b border-slate-300">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Property
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Type
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Ad Type
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Address
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Contact
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Price
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Amount
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Status
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProperties.length > 0 ? (
                filteredProperties.map((property, index) => (
                  <tr
                    key={property._id}
                    className={`transition ${index % 2 === 0 ? "bg-slate-50" : "bg-slate-100"} hover:bg-blue-50`}
                  >
                    <td className="px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                          🏠
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {property.propertyType}
                          </h3>

                          <p className="text-xs text-slate-500">
                            ID: {property.propertyId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 border-b border-slate-200 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
                        {property.propertyType}
                      </span>
                    </td>

                    <td className="px-6 py-4 border-b border-slate-200 text-center text-slate-600 capitalize">
                      {property.propertyAdType}
                    </td>

                    <td className="px-6 py-4 border-b border-slate-200 text-center text-slate-600">
                      {property.propertyAddress}
                    </td>

                    <td className="px-6 py-4 border-b border-slate-200 text-center text-slate-600">
                      {property.ownerContact}
                    </td>

                    <td className="px-6 py-4 border-b border-slate-200 text-center">
                      ${property.propertyPrice} {property.propertyAdType === "rent" && <span className="text-xs text-slate-500">/month</span>}
                    </td>

                    <td className="px-6 py-4 border-b border-slate-200 text-center">
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ">
                        {property.propertyAmt}
                      </span>
                    </td>

                    <td className="px-6 py-4 border-b border-slate-200 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${property.propertyAmt <= 0
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                          }`}
                      >
                        {property.propertyAmt <= 0 ? "Unavailable" : "Available"}
                      </span>
                    </td>

                    <td className="px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleShow(property)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDeleteId(property._id);
                            setDeleteModal(true);
                          }}
                          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium shadow-sm transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center"
                  >
                    <p className="text-slate-500 text-lg font-medium">
                      No properties added.
                    </p>

                    <p className="text-slate-400 text-sm mt-2">
                      Add properties to display them here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT */}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* HEADER */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-500 mb-1">
                Edit Property
              </p>

              <h2 className="text-2xl font-bold text-slate-800">
                Update Property
              </h2>
            </div>

            {/* FORM */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveChanges(editingPropertyId, editingPropertyData.isAvailable);
              }}
              className="p-4 sm:p-6 space-y-4 overflow-y-auto hide-scrollbar"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* TYPE */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Type</label>
                  <select
                    name="propertyType"
                    value={editingPropertyData.propertyType}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="land/plot">Land / Plot</option>
                  </select>
                </div>

                {/* AD TYPE */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Ad Type</label>
                  <select
                    name="propertyAdType"
                    value={editingPropertyData.propertyAdType}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rent">Rent</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>

                {/* ADDRESS */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Address</label>
                  <input
                    type="text"
                    name="propertyAddress"
                    value={editingPropertyData.propertyAddress}
                    onChange={handleChange}
                    placeholder="Property Address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* CONTACT */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Contact</label>
                  <input
                    type="text"
                    name="ownerContact"
                    value={editingPropertyData.ownerContact}
                    onChange={handleChange}
                    placeholder="Owner Contact"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* PRICE */}
                <div className="flex flex-col gap-1">
                  {editingPropertyData.propertyAdType === "rent" ? (
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Price (per month)</label>
                  ) : (
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Price</label>
                  )}
                  <input
                    type="number"
                    name="propertyPrice"
                    value={editingPropertyData.propertyPrice}
                    onChange={handleChange}
                    placeholder="Price"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* AMOUNT */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Amount</label>
                  <input
                    type="number"
                    name="propertyAmt"
                    value={editingPropertyData.propertyAmt}
                    onChange={handleChange}
                    placeholder="Units available"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ADDITIONAL INFO */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Additional Information</label>
                <ReactQuill
                  theme="snow"
                  value={editingPropertyData.additionalInfo}
                  onChange={(value) => setEditingPropertyData((prev) => ({
                    ...prev,
                    additionalInfo: value,
                  }))}
                  modules={modules}
                  placeholder="Add more details about the property..."
                  className="w-full bg-white text-sm text-slate-700 overflow-visible [&_.ql-editor]:min-h-30"  
                />
              </div>

              {/* IMAGE UPLOAD */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Update Image</label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700 file:mr-3 file:px-3 file:py-1 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {existingImages.map((img, idx) => {
                    const filename = img.path.split("/").pop().split("\\").pop();
                    return (
                      <div key={`existing-${idx}`} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                        <img src={`http://localhost:8001/uploads/${filename}`} alt={`existing-${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[12px] shadow-sm hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  {newImagePreviews.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                      <img src={url} alt={`new-preview-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[12px] shadow-sm hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 ml-1 mt-1">
                  Total Images: {existingImages.length + newImages.length}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4">
          <div className="w-full max-w-md bg-slate-100 border border-slate-200 rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-3xl mx-auto mb-5">
              🗑️
            </div>

            <h2 className="text-2xl font-bold text-slate-800 text-center">
              Delete Property?
            </h2>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setDeleteModal(false)}
                className="flex-1 px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-medium transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-medium shadow-md transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerAllProperties;