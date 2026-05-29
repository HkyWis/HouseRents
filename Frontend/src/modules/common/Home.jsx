import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import p1 from "../../images/p1.jpg";
import p2 from "../../images/p2.jpg";
import p3 from "../../images/p3.jpg";
import p4 from "../../images/p4.jpg";
import Navbar from "../../components/nav";
import Footer from "../../components/footer";
import AllPropertiesCards from "../user/AllPropertiesCards";
import { UserContext } from "../../App";

const images = [p1, p2, p3, p4];

const Home = () => {
  const { userLoggedIn } = useContext(UserContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalProperties, setTotalProperties] = useState(null);

  // Fetch total property count from API
  useEffect(() => {
    axios
      .get("http://localhost:8001/api/user/getAllProperties", {
        withCredentials: true,
      })
      .then((res) => {
        setTotalProperties(res.data.data?.length ?? 0);
      })
      .catch(() => {
        setTotalProperties(0);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const STATS = [
    {
      num: totalProperties !== null ? `${totalProperties}` : "...",
      label: "All Properties",
    },
    { num: "18,000+", label: "Active Users" },
    { num: "5+", label: "Cities in Indonesia" },
    { num: "4.9★", label: "User Rating" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="">
        <div className="relative min-h-[600px] overflow-hidden">
          {/* Slides */}
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Slide ${idx}`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${currentIndex === idx ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,40,100,0.35)] to-[rgba(15,40,100,0.7)]" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-5 py-2 backdrop-blur-md">
              <span className="text-base">🏠</span>
              <span className="text-sm font-bold text-white">
                #1 Property Platform in Indonesia
              </span>
            </div>

            {/* Heading */}
            <h1 className="mb-5 max-w-[760px] text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg md:text-6xl">
              Find the Best <br /> Property for You
            </h1>

            {/* Description */}
            <p className="mb-9 max-w-[520px] text-[17px] leading-7 text-white/85">
              Thousands of comfortable homes across Indonesia, easy to find
              and fully trusted.
            </p>

            {/* Buttons */}
            {!userLoggedIn && (
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/register"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/40 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/50"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-white/40 bg-white/15 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/25"
                >
                  Already have an account?
                </Link>
              </div>
            )}

            {/* Slide Dots */}
            <div className="absolute bottom-6 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "w-7 bg-white" : "w-2 bg-white/45"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="border-b border-slate-200 bg-white shadow-lg shadow-blue-500/5">
          <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className={`px-4 py-6 text-center ${i < 3 ? "md:border-r md:border-slate-200" : ""
                  }`}
              >
                <div className="text-2xl font-extrabold tracking-tight text-blue-600">
                  {stat.num}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROPERTIES SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <AllPropertiesCards loggedIn={userLoggedIn} />
      </section>

      <Footer />
    </div>
  );
};

export default Home;