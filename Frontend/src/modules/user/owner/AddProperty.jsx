import React, { useState, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
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

function AddProperty() {
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [currentImage, setCurrentImage] = useState(0);

  const [propertyDetails, setPropertyDetails] = useState({
    propertyType: "residential",
    propertyAdType: "rent",
    propertyAddress: "",
    propertyImages: "",
    ownerContact: "",
    propertyPrice: 0,
    propertyAmt: 0,
    additionalInfo: "",
  });

  const navigate = useNavigate();

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPropertyDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("propertyType", propertyDetails.propertyType);
    formData.append("propertyAdType", propertyDetails.propertyAdType);
    formData.append("propertyAddress", propertyDetails.propertyAddress);
    formData.append("ownerContact", propertyDetails.ownerContact);
    formData.append("propertyPrice", propertyDetails.propertyPrice);
    formData.append("propertyAmt", propertyDetails.propertyAmt);
    formData.append("additionalInfo", propertyDetails.additionalInfo);

    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        formData.append("propertyImages", images[i]);
      }
    }

    try {
      const res = await axios.post(
        "http://localhost:8001/api/owner/postproperty",
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        showToast("success", res.data.message);

        setPropertyDetails({
          propertyType: "residential",
          propertyAdType: "rent",
          propertyAddress: "",
          ownerContact: "",
          propertyPrice: 0,
          propertyAmt: 0,
          additionalInfo: "",
        });

        setImages([]);
        setPreviewUrls((prev) => {
          prev.forEach((url) => URL.revokeObjectURL(url));
          return [];
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        showToast("error", res.data.message || "Unauthorized access");
        navigate("/login");
      }
    } catch (error) {
      console.error(error);

      if (error.response && error.response.status === 401) {
        showToast("error", "Session expired, please login again");
        navigate("/login");
      } else {
        showToast("error", "Failed to add property");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {toast.show && <Toast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="bg-slate-100 border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-200 bg-slate-100/80 backdrop-blur-md">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-500 mb-2">
            Property Management
          </p>

          <h1 className="text-3xl font-bold text-slate-800">
            Add New Property
          </h1>

        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* ROW 1 */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Property Type
              </label>

              <select
                name="propertyType"
                value={propertyDetails.propertyType}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="land/plot">Land / Plot</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Property Ad Type
              </label>

              <select
                name="propertyAdType"
                value={propertyDetails.propertyAdType}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="rent">Rent</option>
                <option value="sale">Sale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Property Address
              </label>

              <input
                type="text"
                name="propertyAddress"
                value={propertyDetails.propertyAddress}
                onChange={handleChange}
                placeholder="Enter full property address"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* ROW 2 */}
          <div className="grid md:grid-cols-4 gap-2 items-start">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Property Images
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                required={images.length === 0}
                onChange={handleImageChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-slate-700 file:mr-4 file:px-4 file:py-1 file:rounded-xl file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition mb-2"
              />
              {previewUrls.length > 0 && (
                <div
                  id="image-slider"
                  className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide px-4"
                >
                  {previewUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0"
                    >
                      <img
                        src={url}
                        alt={`preview-${idx}`}
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[12px] shadow-sm hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Owner Contact
              </label>

              <input
                type="tel"
                name="ownerContact"
                value={propertyDetails.ownerContact}
                onChange={handleChange}
                placeholder="Enter contact number"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              {propertyDetails.propertyAdType === "rent" ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Monthly Rent Price
                  </label>

                  <input
                    type="number"
                    name="propertyPrice"
                    value={propertyDetails.propertyPrice}
                    onChange={handleChange}
                    placeholder="Enter property price"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Property Price
                  </label>

                  <input
                    type="number"
                    name="propertyPrice"
                    value={propertyDetails.propertyPrice}
                    onChange={handleChange}
                    placeholder="Enter property price"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 ">
                Property Amount
              </label>

              <input
                type="number"
                name="propertyAmt"
                value={propertyDetails.propertyAmt}
                onChange={handleChange}
                placeholder="Enter property amount"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* ROW 3 */}
          <div className="">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Additional Information
            </label>

            <ReactQuill
              theme="snow"
              value={propertyDetails.additionalInfo}
              onChange={(value) =>
                setPropertyDetails((prev) => ({
                  ...prev,
                  additionalInfo: value,
                }))
              }
              modules={modules}
              placeholder="Add more details about the property..."
              className="bg-white rounded-2xl w-full [&_.ql-editor]:min-h-30"
            />
          </div>

          {/* BUTTON */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-2xl shadow-md transition"
            >
              Submit Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProperty;