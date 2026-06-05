import React from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// FIX LEAFLET MARKER ICONS
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});
const ChangeMapCenter = ({
  center
}) => {

  const map = useMap();

  map.setView(center, 11);

  return null;
};
const HospitalMap = ({
  hospitals = [],
  mapCenter
}) => {

  // ONLY HOSPITALS WITH COORDINATES
  const validHospitals =
    hospitals.filter(
      (hospital) =>

        hospital.coordinates?.lat &&

        hospital.coordinates?.lng
    );

  return (

    <MapContainer
  center={mapCenter}
  zoom={11}
  style={{
    height: "100%",
    width: "100%"
  }}
>
<ChangeMapCenter
  center={mapCenter}
/>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {validHospitals.map((hospital, index) => (

        <Marker
          key={hospital.hospitalId || index}

          position={[
            Number(
              hospital.coordinates.lat
            ),

            Number(
              hospital.coordinates.lng
            )
          ]}
        >

          <Popup>

            <div>

              <h3>
                {hospital.name}
              </h3>

              <p>
                {hospital.address.city},
                {" "}
                {hospital.address.state}
              </p>

              <p>
                ⭐
                {" "}
                {hospital.ratings?.overall}
              </p>

              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${hospital.coordinates.lat},${hospital.coordinates.lng}`,
                    "_blank"
                  )
                }
              >
                Get Directions
              </button>

            </div>

          </Popup>

        </Marker>

      ))}

    </MapContainer>
  );
};

export default HospitalMap;