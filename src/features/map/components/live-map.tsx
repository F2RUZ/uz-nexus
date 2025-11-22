// src/features/map/components/live-map.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useMap, Marker, Popup, TileLayer, MapContainer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Next.js da Leaflet rasmlari xatosini bartaraf etish
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "leaflet/images/marker-icon-2x.png",
  iconUrl: "leaflet/images/marker-icon.png",
  shadowUrl: "leaflet/images/marker-shadow.png",
});

export interface Device {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: "active" | "idle" | "offline";
  speed: number;
  battery: number;
  lastUpdate: string;
  // ✅ Yangi xususiyatlar: harakatni simulyatsiya qilish uchun
  targetLat: number; // Endi majburiy
  targetLng: number; // Endi majburiy
}

// Custom marker ikonkalari
const createCustomIcon = (status: Device["status"]) => {
  let colorClass = "";
  if (status === "active") colorClass = "bg-green-500";
  else if (status === "idle") colorClass = "bg-yellow-500";
  else colorClass = "bg-gray-500";

  return L.divIcon({
    className: "custom-div-icon",
    html: `<div class="${colorClass} w-3 h-3 rounded-full border-2 border-white shadow-lg"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

// Statusga qarab rangni aniqlash (DeviceCard dan olingan)
const getStatusClasses = (status: Device["status"]) => {
  switch (status) {
    case "active":
      return { text: "text-green-500", dot: "bg-green-500" };
    case "idle":
      return { text: "text-yellow-500", dot: "bg-yellow-500" };
    case "offline":
      return { text: "text-gray-500", dot: "bg-gray-500" };
    default:
      return { text: "text-gray-500", dot: "bg-gray-500" };
  }
};

// Marker harakatini boshqaruvchi komponent
function SmoothMarker({
  device,
  activeMarkerId,
}: {
  device: Device;
  activeMarkerId: number | null;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  // Markerga fokuslanish
  useEffect(() => {
    if (activeMarkerId === device.id && markerRef.current) {
      map.flyTo(
        [device.lat, device.lng],
        map.getZoom() < 10 ? 12 : map.getZoom(), // Zoom darajasini sozlash
        {
          duration: 1.5, // Silliq animatsiya davomiyligi
        }
      );
      markerRef.current.openPopup(); // Fokuslanganda popupni ochish
    }
  }, [activeMarkerId, map, device.id, device.lat, device.lng]);

  return (
    <Marker
      ref={markerRef}
      position={[device.lat, device.lng]}
      icon={createCustomIcon(device.status)}
      key={device.id}
    >
      <Popup>
        <div className="text-sm">
          <strong className="text-primary">{device.name}</strong> <br />
          Status:{" "}
          <span className={getStatusClasses(device.status).text}>
            {device.status.toUpperCase()}
          </span>{" "}
          <br />
          Tezlik: {device.speed} km/h <br />
          Batareya: {device.battery}% <br />
          So'nggi yangilanish: {device.lastUpdate}
        </div>
      </Popup>
    </Marker>
  );
}

interface LiveMapContentProps {
  devices: Device[];
  activeMarkerId: number | null;
}

// MapContainer ichidagi kontent
function MapContent({ devices, activeMarkerId }: LiveMapContentProps) {
  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {devices.map((device) => (
        <SmoothMarker
          device={device}
          key={device.id}
          activeMarkerId={activeMarkerId}
        />
      ))}
    </>
  );
}

interface LiveMapProps {
  devices: Device[];
  onDeviceFocus: (id: number) => void; // Bu prop hozircha LiveMap ichida ishlatilmaydi, lekin tashqaridan keladi
  activeMarkerId: number | null;
}

export function LiveMap({ devices, activeMarkerId }: LiveMapProps) {
  const center = useMemo(() => [40.0, 66.9] as [number, number], []); // O'zbekiston markazi

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-2xl">
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <MapContent devices={devices} activeMarkerId={activeMarkerId} />
      </MapContainer>
    </div>
  );
}
