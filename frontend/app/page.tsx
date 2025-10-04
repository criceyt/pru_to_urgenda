"use client";

import { useEffect, useState } from "react";

// Declaraciones globales para objetos cargados desde CDN
declare const L: any;
declare const statesData: any;

export default function Home() {
  // Estado para controlar el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [stateInfo, setStateInfo] = useState({ name: "", density: "" });
  // Estado para la información del hover
  const [hoverInfo, setHoverInfo] = useState({ name: "", density: "" });
  const [hasHoverInfo, setHasHoverInfo] = useState(false);

  // Función para cerrar el modal
  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    // Cargar CSS y JS de Leaflet desde CDN
    const cssHref = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    const jsSrc = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

    if (!document.querySelector(`link[href='${cssHref}']`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector(`script[src='${jsSrc}']`);
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = jsSrc;
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = () => {
        // Código del mapa (adaptado desde index.js)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const map = L.map("map").setView([37.8, -96], 4);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Eliminamos el control que muestra información al hacer hover dentro del mapa

        function getColor(d: number) {
          return d > 1000
            ? "#800026"
            : d > 500
              ? "#BD0026"
              : d > 200
                ? "#E31A1C"
                : d > 100
                  ? "#FC4E2A"
                  : d > 50
                    ? "#FD8D3C"
                    : d > 20
                      ? "#FEB24C"
                      : d > 10
                        ? "#FED976"
                        : "#FFEDA0";
        }

        function style(feature: any) {
          return {
            weight: 2,
            opacity: 1,
            color: "white",
            dashArray: "3",
            fillOpacity: 0.7,
            fillColor: getColor(feature.properties.density),
          };
        }

        function highlightFeature(e: any) {
          const layer = e.target;

          layer.setStyle({
            weight: 5,
            color: "#666",
            dashArray: "",
            fillOpacity: 0.7,
          });

          layer.bringToFront();

          // Actualizar información solo en la sección inferior
          const props = layer.feature.properties || {};

          // Actualizar la información en la sección inferior
          setHoverInfo({
            name: props.name || "Unknown",
            density: props.density ? `${props.density} people / mi²` : "N/A"
          });
          setHasHoverInfo(true);
        }

        // `statesData` no está definido localmente; cargamos el script de ejemplo de Leaflet
        const statesScript = document.createElement("script");
        statesScript.src = "https://leafletjs.com/examples/choropleth/us-states.js";
        statesScript.onload = () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const geojson = L.geoJson(statesData, { style, onEachFeature }).addTo(map);

          function resetHighlight(e: any) {
            geojson.resetStyle(e.target);
            // Limpiar la información de hover
            setHasHoverInfo(false);
          }

          function zoomToFeature(e: any) {
            map.fitBounds(e.target.getBounds());
          }

          function onEachFeature(feature: any, layer: any) {
            layer.on({
              mouseover: highlightFeature,
              mouseout: resetHighlight,
              click: (e: any) => {
                // Extraer información del estado
                const props = feature.properties || {};
                // Actualizar el estado para el modal
                setStateInfo({
                  name: props.name || "Unknown",
                  density: props.density ? `${props.density} people / mi²` : "N/A"
                });
                // Mostrar el modal
                setModalVisible(true);
              },
            });
          }

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          map.attributionControl.addAttribution(
            'Population data &copy; <a href="http://census.gov/">US Census Bureau</a>'
          );

          const legend = L.control({ position: "bottomright" });

          legend.onAdd = function (map: any) {
            const div = L.DomUtil.create("div", "info legend");
            const grades = [0, 10, 20, 50, 100, 200, 500, 1000];
            const labels: string[] = [];
            let from: number, to: number;

            for (let i = 0; i < grades.length; i++) {
              from = grades[i];
              to = grades[i + 1];

              labels.push(
                `<i style="background:${getColor(from + 1)}"></i> ${from}${to ? `&ndash;${to}` : "+"}
                `
              );
            }

            div.innerHTML = labels.join("<br>");
            return div;
          };

          legend.addTo(map);
        };

        document.body.appendChild(statesScript);
      };
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="page-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Panel de navegación</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><a href="#" className="sidebar-link active">Inicio</a></li>
            <li><a href="#" className="sidebar-link">Estados de EE.UU.</a></li>
            <li><a href="#" className="sidebar-link">Datos demográficos</a></li>
            <li><a href="#" className="sidebar-link">Estadísticas</a></li>
            <li><a href="#" className="sidebar-link">Configuración</a></li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <p>© 2025 Mapa Demo</p>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <h1>Mapa de Estados Unidos</h1>
        <div id="map"></div>

        {/* Sección de información del hover debajo del mapa */}
        <section className={`state-info ${hasHoverInfo ? 'active' : ''}`}>
          {hasHoverInfo ? (
            <>
              <div className="state-info-header">
                <h2>Estado: {hoverInfo.name}</h2>
              </div>
              <div className="state-info-content">
                <div className="state-info-card">
                  <h3>Información al pasar el ratón</h3>
                  <p><strong>Densidad de población:</strong> {hoverInfo.density}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="state-info-placeholder">
              <p>Pasa el ratón sobre un estado para ver su información</p>
            </div>
          )}
        </section>

        {/* Modal para mostrar información detallada al hacer click */}
        {modalVisible && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{stateInfo.name}</h2>
                <button className="close-button" onClick={closeModal}>×</button>
              </div>
              <div className="modal-body">
                <p><strong>Densidad de población:</strong> {stateInfo.density}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
