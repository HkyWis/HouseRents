import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/nav";
import Toast from "../common/Toast";
import {
  FaMapMarkerAlt,
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaArrowRight
} from "react-icons/fa";
import {
  MdApartment,
  MdLandscape,
  MdBusiness,
  MdRealEstateAgent,
} from "react-icons/md";
import { RiCommunityFill } from "react-icons/ri";

axios.defaults.withCredentials = true;

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbStartIndex, setThumbStartIndex] = useState(0);
  const visibleThumbs = 8;
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [userDetails, setUserDetails] = useState({
    fullName: currentUser?.name || "",
    phone: "",
  });

  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", {
        state: { message: "Please login to view property details" },
      });
      return;
    }

    const fetchProperty = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8001/api/user/getproperty/${id}`
        );
        if (res.data.success) {
          setProperty(res.data.data);
        } else {
          showToast("error", "Property not found");
        }
      } catch (error) {
        console.error(error);
        showToast("error", "Failed to fetch property details");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const handleBooking = async (e) => {
    if (e) e.preventDefault();

    if (!userDetails.phone) {
      showToast("error", "Please enter your phone number");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8001/api/user/bookinghandle/${property._id}`,
        {
          userDetails,
          status: "pending",
          ownerId: property.ownerId,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        showToast("success", res.data.message);

        setUserDetails((prev) => ({
          ...prev,
          phone: "",
        }));

        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.log(error);
      if (
        error.response &&
        error.response.data.message ===
        "You have already booked this property"
      ) {
        showToast("error", "You already booked this property. Please Check Your Booking History");
      } else {
        showToast("error", "Booking failed");
      }
    }
  };

  const triggerBookingConfirmation = (e) => {
    e.preventDefault();
    if (!userDetails.phone) {
      showToast("error", "Please enter your phone number");
      return;
    }
    setShowConfirmModal(true);
  };

  const getPropertyTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "residential":
        return <MdApartment className="inline text-xl" />;
      case "commercial":
        return <MdBusiness className="inline text-xl" />;
      case "land/plot":
        return <MdLandscape className="inline text-xl" />;
      default:
        return <FaHome className="inline text-xl" />;
    }
  };

  const handleNextThumbs = () => {
    if (thumbStartIndex + visibleThumbs < property.propertyImage.length) {
      setThumbStartIndex((prev) => prev + visibleThumbs);
    }
  };

  const handlePrevThumbs = () => {
    if (thumbStartIndex > 0) {
      setThumbStartIndex((prev) => prev - visibleThumbs);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading property details...</p>
        </div>
      </div>
    );
  }

  let imageUrl =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000";
  if (property.propertyImage && property.propertyImage.length > 0) {
    const filename = property.propertyImage[currentImageIndex].path
      .split("/")
      .pop()
      .split("\\")
      .pop();
    imageUrl = `http://localhost:8001/uploads/${filename}`;
  }

  const isOwnerProperty = currentUser?._id === property.ownerId;

  return (
    <div className="min-h-screen bg-slate-50">
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4">
          <div className="w-full max-w-md bg-slate-100 border border-slate-200 rounded-3xl shadow-2xl p-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-3xl mx-auto mb-4">
                🏠
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Confirm Booking
              </h2>

              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to book this property?
              </p>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 text-left mb-6 space-y-3 shadow-sm">
                <div>
                  <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Property Type</span>
                  <span className="text-sm font-semibold text-slate-700">{property.propertyType}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Address</span>
                  <span className="text-sm font-semibold text-slate-700">{property.propertyAddress}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Price</span>
                    <span className="text-sm font-semibold text-slate-700">
                      ${property.propertyPrice.toLocaleString()} {property.propertyAdType === "rent" ? "/month" : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Your Phone</span>
                    <span className="text-sm font-semibold text-slate-700">{userDetails.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-semibold transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleBooking();
                  }}
                  className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-md transition-all active:scale-[0.98]"
                >
                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-5">

            {/* Main Image */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 w-full h-[420px]">
              <img
                src={imageUrl}
                alt={property.propertyType}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {property.propertyImage?.length > 1 && (
              <div className="flex items-center gap-2">

                {/* Previous Button */}
                <button
                  onClick={handlePrevThumbs}
                  disabled={thumbStartIndex === 0}
                  className="flex-shrink-0 w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Sebelumnya"
                >
                  <FaArrowLeft />
                </button>

                {/* Thumbnail Viewport */}
                <div className="flex-1 overflow-hidden">
                  <div className="flex gap-3">
                    {property.propertyImage
                      .slice(thumbStartIndex, thumbStartIndex + visibleThumbs)
                      .map((img, idx) => {
                        const realIndex = thumbStartIndex + idx;
                        const thumbFilename = img.path.split("/").pop().split("\\").pop();
                        const thumbUrl = `http://localhost:8001/uploads/${thumbFilename}`;

                        return (
                          <button
                            key={realIndex}
                            onClick={() => setCurrentImageIndex(realIndex)}
                            className={`flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all ${realIndex === currentImageIndex
                              ? "border-blue-500 scale-105 shadow-sm"
                              : "border-transparent hover:border-slate-300"
                              }`}
                          >
                            <img
                              src={thumbUrl}
                              alt={`Thumbnail ${realIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextThumbs}
                  disabled={thumbStartIndex + visibleThumbs >= property.propertyImage.length}
                  className="flex-shrink-0 w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Berikutnya"
                >
                  <FaArrowRight />
                </button>

              </div>
            )}

            {/* Property Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {getPropertyTypeIcon(property.propertyType)}
                  {property.propertyType}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
                  <RiCommunityFill />
                  {property.propertyAmt} unit
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium capitalize">
                  For {property.propertyAdType}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${property.isAvailable === "Available"
                    ? "bg-green-50 text-green-700"
                    : "bg-rose-50 text-rose-700"
                    }`}
                >
                  {property.isAvailable === "Available" ? (
                    <FaCheckCircle />
                  ) : (
                    <FaTimesCircle />
                  )}
                  {property.isAvailable}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold text-slate-800">
                  ${property.propertyPrice.toLocaleString()}
                </span>
                {property.propertyAdType === "rent" && (
                  <span className="text-sm text-slate-400">/month</span>
                )}
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 mb-5">
                <FaMapMarkerAlt className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-500">{property.propertyAddress}</p>
              </div>

              {/* Additional Info */}
              {property.additionalInfo && (
                <div className="border-t border-slate-100 pt-5 mt-2">

                  {/* Section Header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-1 h-5 bg-blue-500 rounded-full" />
                    <p className="text-base font-semibold text-slate-800 tracking-tight">
                      Additional Information
                    </p>
                  </div>

                  {/* Text Content */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
                    <div
                      className="
                                text-slate-600 text-sm leading-relaxed prose prose-sm max-w-full
                                  [&_p]:mb-3 [&_p]:last:mb-0
                                  break-all

                                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 
                                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 
                                  [&_li]:mb-1

                                  [&_strong]:font-semibold [&_strong]:text-slate-700
                                  [&_em]:italic [&_em]:text-slate-500

                                  [&_a]:text-blue-500 [&_a]:underline [&_a]:underline-offset-2
                                  [&_a:hover]:text-blue-700

                                  [&_blockquote]:border-l-2 [&_blockquote]:border-blue-200
                                  [&_blockquote]:pl-3 [&_blockquote]:text-slate-400 [&_blockquote]:italic
                                  [&_blockquote]:my-3

                                  [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-800
                                  [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:first:mt-0

                                  [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-700
                                  [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:first:mt-0

                                  [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-slate-600
                                  [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:first:mt-0

                                  [&_hr]:border-slate-200 [&_hr]:my-3
                                "
                      dangerouslySetInnerHTML={{ __html: property.additionalInfo }}
                    />
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-5">
                Book this property
              </h3>

              {isOwnerProperty ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
                  <div className="text-4xl mb-2">🏠</div>
                  <p className="font-medium text-blue-800 mb-1">Your property</p>
                  <p className="text-xs text-blue-500">
                    You cannot book a property you own.
                  </p>
                </div>
              ) : property.isAvailable !== "Available" ||
                property.propertyAmt <= 0 ? (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 text-center">
                  <div className="text-4xl mb-2">🚫</div>
                  <p className="font-medium text-rose-800 mb-1">Not available</p>
                  <p className="text-xs text-rose-500">
                    This property is currently not accepting bookings.
                  </p>
                </div>
              ) : (
                <form onSubmit={triggerBookingConfirmation} className="flex flex-col gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={userDetails.fullName}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Phone number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={userDetails.phone}
                      onChange={(e) =>
                        setUserDetails({ ...userDetails, phone: e.target.value })
                      }
                      placeholder="Enter your phone number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    />
                  </div>

                  {/* Price Summary */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-400">Property price</span>
                      <span className="text-sm font-medium text-slate-700">
                        ${property.propertyPrice.toLocaleString()}
                      </span>
                    </div>
                    {property.propertyAdType === "rent" && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Billing cycle</span>
                        <span className="text-xs text-slate-400">Per month</span>
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium py-3 rounded-xl text-sm transition-all"
                  >
                    Confirm booking
                  </button>

                  <p className="text-xs text-slate-400 text-center leading-relaxed">
                    You won't be charged yet. The owner will contact you to
                    finalize the booking.
                  </p>
                </form>
              )}

              {/* Owner Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MdRealEstateAgent className="text-blue-500 text-xl" />
                  <span className="font-medium text-slate-800">Owner</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">Owner name</p>
                    <p className="text-sm font-medium text-slate-800">
                      {property.ownerName}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">Phone number</p>
                    <p className="text-sm font-medium text-slate-800">
                      {property.ownerContact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;