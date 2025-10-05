"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { provinces } from "../Data/provinces";
import { bilbaoPueblos } from "../Data/bilbaoPueblos";

interface Area {
  name: string;
  lat: number;
  lng: number;
  radius?: number;
  air: { pm25: number; pm10: number; no2: number };
  water: { ph: number; nitrates: number; coliforms: number };
  noise: { avg: number; max: number };
}

export default function Home() {
  const mapRef = useRef<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stateInfo, setStateInfo] = useState({ name: "", info: "" });
  const [hoverInfo, setHoverInfo] = useState({ name: "", info: "" });
  const [hasHoverInfo, setHasHoverInfo] = useState(false);

  const closeModal = () => setModalVisible(false);

  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current) {
        mapRef.current = L.map("map").setView([40.4168, -3.7038], 6);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapRef.current);
      }

      const getColor = (overall: number) => {
        if (overall <= 33) return "#2ecc71"; // green
        if (overall <= 66) return "#f1c40f"; // yellow
        return "#e74c3c"; // red
      };

      const getStatus = (overall: number) => {
        if (overall <= 33) return "Good";
        if (overall <= 66) return "Regular";
        return "Bad";
      };

      const allAreas: Area[] = [...provinces, ...bilbaoPueblos];

      allAreas.forEach((area) => {
        const radius = area.radius || 20000;

        const airAvg = (area.air.pm25 + area.air.pm10 + area.air.no2) / 3;
        const airNorm = (airAvg / 250) * 100;

        const waterAvg = (area.water.nitrates + area.water.coliforms) / 2;
        const waterNorm = waterAvg;

        const noiseNorm = ((area.noise.avg - 30) / 90) * 100;

        const overall = (airNorm + waterNorm + noiseNorm) / 3;

        const circle = L.circle([area.lat, area.lng], {
          color: "white",
          fillColor: getColor(overall),
          fillOpacity: 0.7,
          radius,
          weight: 2,
        }).addTo(mapRef.current);

        const infoText = `Air (PM2.5/PM10/NO2): ${area.air.pm25}/${area.air.pm10}/${area.air.no2} µg/m³ | Water (pH/Nitrates/Coliforms): ${area.water.ph}/${area.water.nitrates}/${area.water.coliforms} | Noise: ${area.noise.avg} dB | Status: ${getStatus(overall)}`;

        circle.on({
          mouseover: () => {
            circle.setStyle({ weight: 5 });
            setHoverInfo({ name: area.name, info: infoText });
            setHasHoverInfo(true);
          },
          mouseout: () => {
            circle.setStyle({ weight: 2 });
            setHasHoverInfo(false);
          },
          click: () => {
            setStateInfo({ name: area.name, info: infoText });
            setModalVisible(true);
          },
        });
      });
    })();
  }, []);

  return (
    <div className="page-container">
      <Sidebar />
      <main className="main-content">
        <h1>Spain Provinces Map</h1>
        <div id="map" style={{ height: "600px", width: "100%" }}></div>

        <section className={`state-info ${hasHoverInfo ? "active" : ""}`}>
          {hasHoverInfo ? (
            <>
              <div className="state-info-header">
                <h2>Province / City: {hoverInfo.name}</h2>
              </div>
              <div className="state-info-content">
                <div className="state-info-card">
                  <h3>Pollution Indicators</h3>
                  <p>{hoverInfo.info}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="state-info-placeholder">
              <p>Hover over a point to view information</p>
            </div>
          )}
        </section>

        {modalVisible && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{stateInfo.name}</h2>
                <button className="close-button" onClick={closeModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <h3>Pollution Indicators</h3>
                <p>{stateInfo.info}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
