import axios from "axios";
import { useState, useEffect } from "react";
import Toast from "../common/Toast";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaSearch,
  FaMapMarkerAlt
} from "react-icons/fa";
import {
  MdApartment,
  MdLandscape,
  MdBusiness,
} from "react-icons/md";

// CATEGORY TABS
const baseCategories = [
  { id: "all", label: "All", icon: "🏠" },
  { id: "jakarta", label: "Jakarta", icon: "🏙️" },
  { id: "bandung", label: "Bandung", icon: "🌄" },
  { id: "surabaya", label: "Surabaya", icon: "🌊" },
  { id: "bali", label: "Bali", icon: "🏝️" },
  { id: "yogyakarta", label: "Yogyakarta", icon: "🏛️" },
  { id: "medan", label: "Medan", icon: "🌴" },
  { id: "favorite", label: "Favorites", icon: "❤️" },
];

const AllPropertiesCards = ({ loggedIn }) => {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const CATEGORIES =
    currentUser?.type === "Owner"
      ? [
        ...baseCategories,
        {
          id: "my-properties",
          label: "My Properties",
          icon: "🏢",
        },
      ]
      : baseCategories;

  const navigate = useNavigate();

  const [allProperties, setAllProperties] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [filterPropertyType, setPropertyType] = useState("");
  const [filterPropertyAdType, setPropertyAdType] = useState("");
  const [filterPropertyAddress, setPropertyAddress] = useState("");
  const [filterAvailability, setAvailability] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [sortPrice, setSortPrice] = useState("");

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  // GET ALL PROPERTIES 
  const getAllProperties = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8001/api/user/getAllProperties",
        {
          withCredentials: true,
        }
      );

      setAllProperties(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  // GET FAVORITES 
  const getFavorites = async () => {
    if (!loggedIn || !currentUser) return;

    try {
      const res = await axios.get(
        "http://localhost:8001/api/user/getfavorites",
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const favArray = res.data.data.map((fav) => fav._id);

        setFavorites(favArray);

        localStorage.setItem("favorites", JSON.stringify(favArray));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // TOGGLE FAVORITE
  const toggleFavorite = async (propertyId) => {
    if (!loggedIn) {
      setToast({
        show: true,
        type: "error",
        message: "Please login to save properties.",
      });

      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8001/api/user/togglefavorite/${propertyId}`,
        { userId: currentUser?._id },
        { withCredentials: true }
      );

      const favArray = res.data.favorites;

      setFavorites(favArray);

      localStorage.setItem("favorites", JSON.stringify(favArray));

      if (res.data.success) {
        setToast({
          show: true,
          type: "success",
          message: res.data.message,
        });
      }
    } catch (error) {
      console.log(error);

      setToast({
        show: true,
        type: "error",
        message: "Failed to update favorites.",
      });
    }
  };

  useEffect(() => {
    getAllProperties();
    getFavorites();
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) {
      localStorage.removeItem("favorites");
      setFavorites([]);
    }
  }, [loggedIn]);

  // FILTER & SORT
  const filteredProperties = allProperties
    .filter((p) => {

      // OWNER PROPERTIES
      if (filterCity === "my-properties") {
        return p.ownerId === currentUser?._id;
      }

      // FAVORITES FILTER
      if (filterCity === "favorite") {
        return favorites.includes(p._id);
      }

      // CITY FILTER
      if (filterCity !== "all") {
        return p.propertyAddress
          .toLowerCase()
          .includes(filterCity.toLowerCase());
      }

      return true;
    })
    .filter(
      (p) =>
        filterPropertyAddress === "" ||
        p.propertyAddress
          .toLowerCase()
          .includes(filterPropertyAddress.toLowerCase())
    )
    .filter(
      (p) =>
        filterPropertyAdType === "" ||
        p.propertyAdType
          .toLowerCase()
          .includes(filterPropertyAdType.toLowerCase())
    )
    .filter(
      (p) =>
        filterPropertyType === "" ||
        p.propertyType
          .toLowerCase()
          .includes(filterPropertyType.toLowerCase())
    )
    .filter(
      (p) =>
        filterAvailability === "" ||
        p.isAvailable.toLowerCase() ===
        filterAvailability.toLowerCase()
    )
    .sort((a, b) => {
      if (sortPrice === "asc")
        return a.propertyPrice - b.propertyPrice;

      if (sortPrice === "desc")
        return b.propertyPrice - a.propertyPrice;

      return 0;
    });

  const getPropertyTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "residential":
        return <MdApartment className="mr-1" />;

      case "commercial":
        return <MdBusiness className="mr-1" />;

      case "land/plot":
        return <MdLandscape className="mr-1" />;

      default:
        return null;
    }
  };

  return (
    <div>
      {/* TOAST */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() =>
            setToast({ ...toast, show: false })
          }
        />
      )}

      {/* CATEGORY TABS */}
      <div className="mb-7 flex overflow-x-auto border-b border-slate-200">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCity(cat.id)}
            className={`flex shrink-0 flex-col items-center gap-1 border-b-2 px-5 py-3 transition-all ${filterCity === cat.id
              ? "border-blue-600 opacity-100"
              : "border-transparent opacity-60 hover:opacity-90"
              }`}
          >
            <span className="text-2xl">{cat.icon}</span>

            <span
              className={`text-xs font-bold ${filterCity === cat.id
                ? "text-blue-600"
                : "text-slate-700"
                }`}
            >
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {/* PROPERTY TYPE */}
            <select
              value={filterPropertyType}
              onChange={(e) =>
                setPropertyType(e.target.value)
              }
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-600"
            >
              <option value="">All Types</option>
              <option value="commercial">
                🏢 Commercial
              </option>
              <option value="land/plot">
                🌳 Land / Plot
              </option>
              <option value="residential">
                🏠 Residential
              </option>
            </select>

            {/* SALE / RENT */}
            <select
              value={filterPropertyAdType}
              onChange={(e) =>
                setPropertyAdType(e.target.value)
              }
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-600"
            >
              <option value="">Buy or Rent</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            {/* AVAILABILITY */}
            <select
              value={filterAvailability}
              onChange={(e) =>
                setAvailability(e.target.value)
              }
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-600"
            >
              <option value="">All Status</option>
              <option value="Available">
                ✅ Available
              </option>
              <option value="Unavailable">
                ❌ Unavailable
              </option>
            </select>

            {/* SORT */}
            <select
              value={sortPrice}
              onChange={(e) =>
                setSortPrice(e.target.value)
              }
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-600"
            >
              <option value="">Sort Price</option>
              <option value="asc">
                💰 Lowest Price
              </option>
              <option value="desc">
                💎 Highest Price
              </option>
            </select>
          </div>

          <span className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600">
            {filteredProperties.length} properties
          </span>
        </div>

        {/* SEARCH */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <FaSearch className="text-slate-400" />

          <input
            type="text"
            placeholder="Search by address or location..."
            value={filterPropertyAddress}
            onChange={(e) =>
              setPropertyAddress(e.target.value)
            }
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>
      </div>

      {/* PROPERTY GRID */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-7">
          {filteredProperties.map((property) => {
            const isOwnerProperty =
              currentUser?.type === "Owner" &&
              currentUser?._id === property.ownerId;

            return (
              <div
                key={property._id}
                className="group cursor-pointer"
              >
                {/* IMAGE */}
                <div className="relative aspect-[4/3.2] overflow-hidden rounded-2xl bg-slate-200">
                  <img
                    src={`http://localhost:8001${property.propertyImage[0]?.path}`}
                    alt="Property"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {/* FAVORITE */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      if (!loggedIn) {
                        navigate("/login");
                      } else {
                        toggleFavorite(property._id);
                      }
                    }}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:scale-110"
                  >
                    {favorites.includes(property._id) ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart className="text-slate-700" />
                    )}
                  </button>

                  {/* STATUS */}
                  <div
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold text-white ${property.isAvailable === "Available"
                      ? "bg-emerald-500"
                      : "bg-red-500"
                      }`}
                  >
                    {property.isAvailable === "Available"
                      ? "Available"
                      : "Unavailable"}
                  </div>

                  {/* TYPE */}
                  <div className="absolute bottom-3 left-3 flex items-center rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold capitalize text-white">
                    {getPropertyTypeIcon(
                      property.propertyType
                    )}
                    {property.propertyType}
                  </div>
                </div>

                {/* CARD INFO */}
                <div className="px-1 pt-4">
                  {/* ADDRESS */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 text-sm font-bold leading-5 text-slate-800">
                      <FaMapMarkerAlt className="mr-1 inline text-[11px] text-slate-400" />
                      {property.propertyAddress}
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="capitalize">
                      {property.propertyAdType === "rent"
                        ? "For Rent"
                        : "For Sale"}
                    </span>

                    <span>•</span>

                    <span>
                      {property.propertyAmt} units
                    </span>
                  </div>

                  {/* PRICE */}
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-xl font-extrabold text-blue-600">
                      $
                      {property.propertyPrice.toLocaleString()}
                    </span>

                    {property.propertyAdType ===
                      "rent" && (
                        <span className="text-xs text-slate-500">
                          /month
                        </span>
                      )}
                  </div>

                  {/* BUTTON */}
                  <div className="mt-4">
                    {property.isAvailable ===
                      "Available" ? (
                      loggedIn ? (
                        <button
                          onClick={() =>
                            navigate(
                              `/property/${property._id}`
                            )
                          }
                          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          View Details
                        </button>
                      ) : (
                        <Link to="/login">
                          <button className="w-full rounded-xl border border-blue-600 bg-white px-4 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50">
                            Login to View
                          </button>
                        </Link>
                      )
                    ) : (
                      <button
                        disabled
                        className="w-full cursor-not-allowed rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-400"
                      >
                        Unavailable
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center">
          <div className="mb-4 text-6xl">🏘️</div>

          <p className="text-2xl font-bold text-slate-800">
            No properties found
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Try adjusting your filters or searching in
            another city
          </p>
        </div>
      )}
    </div>
  );
};

export default AllPropertiesCards;