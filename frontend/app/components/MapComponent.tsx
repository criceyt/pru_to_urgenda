"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { provinces } from "../Data/provinces";
import { bilbaoPueblos } from "../Data/bilbaoPueblos";

interface Area {
  name: string;
  lat: number;
  lng: number;
  density: number;
  radius?: number;
}

export default function MapComponent() {
  const [hoverInfo, setHoverInfo] = useState({ name: "", density: "" });
  const [modalVisible, setModalVisible] = useState(false);
  const [stateInfo, setStateInfo] = useState({ name: "", density: "" });

  const closeModal = () => setModalVisible(false);

  useEffect(() => {
    if (typeof window === "undefined") return; // proteger SSR

    const map = L.map("map").setView([40.4168, -3.7038], 6);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const getColor = (pm: number) => {
      if (pm <= 20) return "#2ecc71";
      if (pm <= 40) return "#f1c40f";
      if (pm <= 80) return "#e67e22";
      if (pm <= 120) return "#e74c3c";
      if (pm <= 160) return "#8e44ad";
      return "#7f0000";
    };

    const allAreas: Area[] = [...provinces, ...bilbaoPueblos];

    allAreas.forEach((area) => {
      const radius = area.radius || (bilbaoPueblos.includes(area) ? 8000 : 20000);
      const circle = L.circle([area.lat, area.lng], {
        color: "white",
        fillColor: getColor(area.density),
        fillOpacity: 0.7,
        radius,
        weight: 2,
      }).addTo(map);

      circle.on({
        mouseover: () => {
          circle.setStyle({ weight: 5 });
          setHoverInfo({ name: area.name, density: `${area.density} µg/m³` });
        },
        mouseout: () => circle.setStyle({ weight: 2 }),
        click: () => {
          setStateInfo({ name: area.name, density: `${area.density} µg/m³` });
          setModalVisible(true);
        },
      });
    });

    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      const grades = [0, 20, 40, 80, 120, 160];
      const labels: string[] = [];
      for (let i = 0; i < grades.length; i++) {
        const from = grades[i];
        const to = grades[i + 1];
        labels.push(
          `<i style="background:${getColor(from + 1)}"></i> ${from}${to ? `–${to}` : "+"} µg/m³`
        );
      }
      div.innerHTML = labels.join("<br>");
      return div;
    };
    legend.addTo(map);

    return () => map.remove();
  }, []);

  return (
    <>
      <div id="map" style={{ height: "600px", width: "100%" }}></div>

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
              <p>
                <strong>Concentración:</strong> {stateInfo.density}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
