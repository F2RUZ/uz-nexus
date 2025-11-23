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
}

// Boshlang'ich ma'lumotlar
const INITIAL_DEVICES: Device[] = [
  {
    id: 1,
    name: "Toshkent Kuryeri #1",
    lat: 41.3,
    lng: 69.2401,
    status: "active",
    speed: 55,
    battery: 85,
    lastUpdate: "1 min old",
  },
  {
    id: 2,
    name: "Samarqand Yoki #2",
    lat: 39.654,
    lng: 66.972,
    status: "idle",
    speed: 0,
    battery: 92,
    lastUpdate: "10 min old",
  },
  {
    id: 3,
    name: "Buxoro Avtobusi #3",
    lat: 39.77,
    lng: 64.43,
    status: "offline",
    speed: 0,
    battery: 10,
    lastUpdate: "1 soat old",
  },
  {
    id: 4,
    name: "Qashqadaryo YK #4",
    lat: 38.86,
    lng: 65.78,
    status: "active",
    speed: 80,
    battery: 70,
    lastUpdate: "10 sec old",
  },
];

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
        map.getZoom() < 10 ? 12 : map.getZoom(),
        {
          duration: 1.5,
        }
      );
      markerRef.current.openPopup();
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
          Tezlik: {device.speed} km/h
        </div>
      </Popup>
    </Marker>
  );
}

// Statusga qarab rangni aniqlash
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
  onDeviceFocus: (id: number) => void;
  activeMarkerId: number | null;
}

export function LiveMap({
  devices,
  onDeviceFocus,
  activeMarkerId,
}: LiveMapProps) {
  const center = useMemo(() => [40.0, 66.9] as [number, number], []);

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
