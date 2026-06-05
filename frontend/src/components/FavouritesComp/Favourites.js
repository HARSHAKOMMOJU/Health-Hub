import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ArrowLeft,
  Building2,
  Star,
  IndianRupee,
  Search,
  User
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Favourites.module.css";

const Favourites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [favourites, setFavourites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const userId = user?._id || user?.id;
if (!userId) return;
const saved = localStorage.getItem(`likedDoctors_${userId}`);
if (saved) {
  setFavourites(JSON.parse(saved));
}
  }, [user]);

  const removeFavourite = (doctorId) => {
    const updated = favourites.filter(
      (doc) => doc.id !== doctorId
    );

    setFavourites(updated);

    const userId = user?._id || user?.id;
    if (userId) {
      localStorage.setItem(`likedDoctors_${userId}`, JSON.stringify(updated));
    }
  };

  const filteredDoctors = favourites.filter(
    (doctor) =>
      doctor.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doctor.specialty
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doctor.hospital
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const uniqueHospitals = new Set(
    favourites.map((d) => d.hospital)
  ).size;


  return (
    <div className={styles.favouritesPage}>
      <div className={styles.container}>
        {/* HEADER */}

        <div className={styles.pageHeader}>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className={styles.headerTitle}>
            <h1>Favourite Doctors</h1>
            <p>
              Your saved healthcare specialists
            </p>
          </div>
        </div>

        {/* STATS */}

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Heart size={24} />
            <h3>{favourites.length}</h3>
            <p>Saved Doctors</p>
          </div>

          <div className={styles.statCard}>
            <Building2 size={24} />
            <h3>{uniqueHospitals}</h3>
            <p>Hospitals</p>
          </div>

          <div className={styles.statCard}>
            <Star size={24} />
            <h3>
              {favourites.length
                ? (
                    favourites.reduce(
                      (a, b) =>
                        a + Number(b.rating || 0),
                      0
                    ) / favourites.length
                  ).toFixed(1)
                : "0"}
            </h3>
            <p>Average Rating</p>
          </div>
        </div>

        {/* SEARCH */}

        <div className={styles.searchWrapper}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search favourite doctors..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        {/* EMPTY */}

        {filteredDoctors.length === 0 ? (
          <div className={styles.emptyState}>
            <Heart size={70} />
            <h2>No Favourite Doctors Yet</h2>
            <p>
              Save your favourite doctors
              to access them quickly later.
            </p>

            <button
              onClick={() =>
                navigate("/hospitals")
              }
            >
              Browse Hospitals
            </button>
          </div>
        ) : (
          <div className={styles.doctorsGrid}>
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className={styles.doctorCard}
              >
                <div className={styles.cardActions}>

  <button
    className={styles.removeBtn}
    onClick={() =>
      removeFavourite(doctor.id)
    }
  >
    ❤️
  </button>

  <div className={styles.ratingBadge}>
    ⭐ {doctor.rating}
  </div>

</div>

                <div className={styles.doctorHeader}>
  <div className={styles.avatar}>
    <User size={24} />
  </div>

  <div>
    <h3 className={styles.doctorName}>
      {doctor.name}
    </h3>

    <span className={styles.specialty}>
      {doctor.specialty}
    </span>
  </div>
</div>
                <p className={styles.experience}>
  {doctor.experience || 10} Years Experience
</p>

                <div className={styles.hospitalInfo}>
  <Building2 size={16} />
  <span>{doctor.hospital}</span>
</div>
<div className={styles.consultationFee}>
  ₹{doctor.fees} consultation fee
</div>
<p className={styles.bio}>
  {doctor.specialty} specialist with
  {doctor.experience || 10} years of experience.
</p>
                <button
  className={styles.bookBtn}
  onClick={() =>
    navigate("/hospitals", {
      state: {
        selectedDoctor: doctor,
        openBooking: true
      }
    })
  }
>
  Book Appointment
</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favourites;