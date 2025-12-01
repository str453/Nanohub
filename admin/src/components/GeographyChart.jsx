import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import geoProgress from "../scenes/geography/fake_users_geo_progress.json";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to fit map bounds to markers
function MapBounds({ bounds }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
}

const GeographyChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Build marker list directly from precomputed geo JSON
  const markers = useMemo(() => {
    if (!geoProgress) return [];

    return Object.entries(geoProgress)
      .map(([key, value]) => {
        const idx = Number(key);
        const lat = value?.lat;
        const lon = value?.lon;
        if (lat == null || lon == null) return null;

        return {
          id: idx,
          lat,
          lng: lon,
        };
      })
      .filter(Boolean);
  }, []);

  // Calculate bounds from markers
  const bounds = useMemo(() => {
    if (markers.length === 0) return null;

    const lats = markers.map((m) => m.lat);
    const lngs = markers.map((m) => m.lng);

    return L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    );
  }, [markers]);

  // Default center (USA)
  const defaultCenter = [39.8283, -98.5795]; // Geographic center of USA
  const defaultZoom = isDashboard ? 4 : 5;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: "100%", width: "100%", minHeight: isDashboard ? "200px" : "600px" }}
      scrollWheelZoom={!isDashboard}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {bounds && <MapBounds bounds={bounds} />}
      
      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.lat, marker.lng]}>
          <Popup>
            <div>
              <strong>Location #{marker.id}</strong>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default GeographyChart;
