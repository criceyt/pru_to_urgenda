"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { provinces } from "../Data/provinces";
import { bilbaoPueblos } from "../Data/bilbaoPueblos";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);
  const [stateInfo, setStateInfo] = useState({ name: "", info: "" });
  const [hoverInfo, setHoverInfo] = useState({ name: "", info: "" });
  const [hasHoverInfo, setHasHoverInfo] = useState(false);

  const closeModal = () => setModalVisible(false);

  const getStatus = (area: typeof provinces[0]) => {
    const airAvg = (area.air.pm25 + area.air.pm10 + area.air.no2) / 3;
    const airNorm = (airAvg / 250) * 100;

    const waterAvg = (area.water.nitrates + area.water.coliforms) / 2;
    const waterNorm = waterAvg;

    const noiseNorm = ((area.noise.avg - 30) / 90) * 100;

    const overall = (airNorm + waterNorm + noiseNorm) / 3;

    if (overall <= 33) return "Good";
    if (overall <= 66) return "Regular";
    return "Bad";
  };

  const totalAreas = [...provinces, ...bilbaoPueblos];

  // Count statuses
  const statusCounts = totalAreas.reduce(
    (acc, area) => {
      const status = getStatus(area);
      if (status === "Bad") acc.bad++;
      else if (status === "Regular") acc.regular++;
      else acc.good++;
      return acc;
    },
    { bad: 0, regular: 0, good: 0 }
  );

  const doughnutData = {
    labels: ["Bad (red)", "Regular (yellow)", "Good (green)"],
    datasets: [
      {
        data: [statusCounts.bad, statusCounts.regular, statusCounts.good],
        backgroundColor: ["#e74c3c", "#f1c40f", "#2ecc71"],
      },
    ],
  };

  const barData = {
    labels: provinces.map((p) => p.name),
    datasets: [
      {
        label: "PM2.5 (µg/m³)",
        data: provinces.map((p) => p.air.pm25),
        backgroundColor: provinces.map((p) =>
          getStatus(p) === "Bad" ? "#e74c3c" : "#36A2EB"
        ),
      },
      {
        label: "PM10 (µg/m³)",
        data: provinces.map((p) => p.air.pm10),
        backgroundColor: provinces.map((p) =>
          getStatus(p) === "Bad" ? "#c0392b" : "#4bc0c0"
        ),
      },
      {
        label: "NO2 (µg/m³)",
        data: provinces.map((p) => p.air.no2),
        backgroundColor: provinces.map((p) =>
          getStatus(p) === "Bad" ? "#d35400" : "#ffce56"
        ),
      },
    ],
  };

  return (
    <div className="page-container">
      <Sidebar />
      <main className="main-content">
        <h1>Province Pollution Levels</h1>

        <div className="charts-container">
          <div className="chart-card">
            <h3>Proportion of Provinces by Status</h3>
            <Doughnut data={doughnutData} />
          </div>
          <div className="chart-card">
            <h3>Air Quality Indicators by Province</h3>
            <Bar
              data={barData}
              options={{ responsive: true, plugins: { legend: { position: "top" } } }}
            />
          </div>
        </div>

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
              <p>Hover over a point to see its information</p>
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
                <p>{stateInfo.info}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .page-container {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }
        .main-content {
          flex: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-y: auto;
        }
        .charts-container {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        .chart-card {
          width: 400px;
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}
