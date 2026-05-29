import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../common/Toast";
import { FaHeart } from "react-icons/fa";

const AllFavoriteList = ({ loggedIn }) => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  // GET FAVORITE PROPERTIES
  const getFavoriteProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8001/api/user/getfavorites",
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setFavoriteProperties(res.data.data);
      }
    } catch (error) {
      console.log(error);
      setToast({
        show: true,
        type: "error",
        message: "Failed to load favorites",
      });
    } finally {
      setLoading(false);
    }
  };

  // REMOVE FROM FAVORITES
  const removeFavorite = async (propertyId) => {
    try {
      const res = await axios.post(
        `http://localhost:8001/api/user/togglefavorite/${propertyId}`,
        { userId: currentUser?._id },
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setFavoriteProperties(
          favoriteProperties.filter((prop) => prop._id !== propertyId)
        );

        // Update localStorage
        const updatedFavs = res.data.favorites;
        localStorage.setItem("favorites", JSON.stringify(updatedFavs));

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
        message: "Failed to remove from favorites",
      });
    }
  };

  useEffect(() => {
    getFavoriteProperties();
  }, [loggedIn]);

  return (
    <div className="p-2">
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
            Favorite Properties
          </p>

          <h1 className="text-3xl font-bold text-slate-800">
            My Favorite Properties
          </h1>
        </div>

        {/* TOTAL */}
        <div className="bg-slate-100 border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">
            Total Favorites
          </p>

          <h2 className="text-2xl font-bold text-slate-800">
            {favoriteProperties.length}
          </h2>
        </div>
      </div>


      {/* LOADING STATE */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : favoriteProperties.length > 0 ? (
        /* PROPERTY CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProperties.map((property) => (
            <div
              key={property._id}
              className="bg-slate-100 border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden hover:-translate-y-1"
            >
              {/* IMAGE */}
              <div className="relative">
                <img
                  src={`http://localhost:8001${property.propertyImage[0]?.path}`}
                  alt="Property"
                  className="w-full h-52 object-cover"
                />
                <button
                  onClick={() => removeFavorite(property._id)}
                  className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-md transition"
                >
                  <FaHeart className="text-rose-500 text-xl" />
                </button>
              </div>

              {/* CONTENT */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-800">
                  {property.propertyAddress}
                </h3>

                <p className="text-slate-500 text-sm mt-1 capitalize">
                  {property.propertyType} • {property.propertyAdType}
                </p>

                <p className="mt-4 text-sm text-slate-600">
                  <b>Contact:</b> {property.ownerContact}
                </p>

                <p className="text-sm text-slate-600">
                  <b>Availability:</b> {property.isAvailable}
                </p>

                <p className="text-sm text-slate-600">
                  <b>Price:</b> ${property.propertyPrice}
                </p>

                <p className="text-sm text-slate-600">
                  <b>Amount:</b> {property.propertyAmt} unit
                </p>

                {/* BUTTON */}
                {property.isAvailable === "Available" ? (
                  <button
                    onClick={() => navigate(`/property/${property._id}`)}
                    className="mt-5 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl transition font-semibold"
                  >
                    Get Info / Book
                  </button>
                ) : (
                  <button
                    disabled
                    className="mt-5 w-full bg-red-200 text-red-700 py-3 rounded-2xl cursor-not-allowed font-semibold"
                  >
                    Not Available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="col-span-full py-20 text-center">
          <div className="text-6xl mb-4">💔</div>
          <p className="text-slate-500 text-lg font-medium">
            No favorite properties yet
          </p>

          <p className="text-slate-400 text-sm mt-2">
            Start adding properties to your favorites!
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold transition"
          >
            Browse Properties
          </button>
        </div>
      )}
    </div>
  );
};

export default AllFavoriteList;