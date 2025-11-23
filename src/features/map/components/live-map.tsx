// src/features/map/components/live-map.tsx
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Truck } from "lucide-react";

import { cn } from "@/lib/utils";

// =========================================================================
// DINAMIK IMPORTLAR (Next.js SSR bilan muammo bo'lmasligi uchun)
// =========================================================================

// react-leaflet'ning asosiy komponentlarini bitta ob'ektga dinamik import qilamiz
const ReactLeaflet = dynamic(
  () =>
    import("react-leaflet").then((mod) => ({
      MapContainer: mod.MapContainer,
      TileLayer: mod.TileLayer,
      Marker: mod.Marker,
      Popup: mod.Popup,
      Polyline: mod.Polyline,
      FeatureGroup: mod.FeatureGroup,
      useMap: mod.useMap,
      LayersControl: mod.LayersControl,
      AttributionControl: mod.AttributionControl,
      ScaleControl: mod.ScaleControl,
    })),
  { ssr: false }
);

// Marker klasterlash
const MarkerClusterGroup = dynamic(
  () => import("react-leaflet-markercluster"),
  { ssr: false }
);

// L obyekti uchun global o'zgaruvchi. Uni faqat client-side da ishga tushiramiz.
let L: typeof import("leaflet") | undefined;

// =========================================================================
// LEAFLET IMG XATOSINI BARTARAF ETISH VA L NI YUKLASH
// =========================================================================
if (typeof window !== "undefined") {
  import("leaflet").then((leafletModule) => {
    L = leafletModule; // L ni yuklab olamiz
    // Leaflet default ikonka xatolarini tuzatish
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "leaflet/images/marker-icon-2x.png",
      iconUrl: "leaflet/images/marker-icon.png",
      shadowUrl: "leaflet/images/marker-shadow.png",
    });
  });
}

// =========================================================================
// DEVICE INTERFACE VA BOSHQA GLOBAL FUNKSIYALAR
// =========================================================================

export interface Device {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: "active" | "idle" | "offline";
  speed: number;
  battery: number;
  lastUpdate: string;
  targetLat: number;
  targetLng: number;
  rotation: number; // Avtomobil yo'nalishi uchun
  path: L.LatLngExpression[]; // Bosib o'tgan yo'l (marshrut)
}

// Statusga qarab rangni aniqlash (DeviceCard va boshqa joylar uchun)
const getStatusClasses = (status: Device["status"]) => {
  switch (status) {
    case "active":
      return {
        text: "text-green-500",
        dot: "bg-green-500",
        border: "border-green-500",
        shadow: "shadow-green-500/50",
      };
    case "idle":
      return {
        text: "text-yellow-500",
        dot: "bg-yellow-500",
        border: "border-yellow-500",
        shadow: "shadow-yellow-500/50",
      };
    case "offline":
      return {
        text: "text-gray-500",
        dot: "bg-gray-500",
        border: "border-gray-500",
        shadow: "shadow-gray-500/50",
      };
    default:
      return {
        text: "text-gray-500",
        dot: "bg-gray-500",
        border: "border-gray-500",
        shadow: "shadow-gray-500/50",
      };
  }
};

// =========================================================================
// CUSTOM MARKER ICONLAR
// =========================================================================

const createCustomCarIcon = (device: Device) => {
  // L yuklanmagan bo'lsa, xato bermaslik uchun oddiy div qaytaramiz yoki kutamiz
  if (!L) {
    // Agar L aniqlanmagan bo'lsa, uni window dan olishga harakat qilamiz, yoki dummy obyekt
    const DummyL = (
      typeof window !== "undefined" ? (window as any).L : { DivIcon: class {} }
    ) as typeof import("leaflet");
    return new DummyL.DivIcon({
      className: "",
      html: "<div></div>",
      iconSize: [0, 0],
    });
  }

  const { status, rotation } = device;
  const { text, border } = getStatusClasses(status);

  // Truck ikonkasining SVG kodi
  const truckSvg = `
    <svg class="h-6 w-6 ${text}" 
         xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 13 23 18 16 18 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
  `;

  return L.divIcon({
    className: "custom-car-icon",
    html: `
      <div class="relative flex items-center justify-center p-[4px] rounded-full bg-white dark:bg-gray-800 shadow-xl border-2 transition-colors duration-300 
                  ${border} 
                  ${status === "active" ? "animate-pulse-border" : ""}
                  " 
                  style="transform: rotate(${rotation}deg);">
          ${truckSvg}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Klasterlash ikonkasini yasash
const createClusterCustomIcon = function (cluster: any) {
  if (!L) {
    const DummyL = (
      typeof window !== "undefined"
        ? (window as any).L
        : { DivIcon: class {}, point: () => ({}) }
    ) as typeof import("leaflet");
    return new DummyL.DivIcon({
      className: "",
      html: "<div></div>",
      iconSize: [0, 0],
    });
  }

  const count = cluster.getChildCount();
  let sizeClass = "small";
  if (count > 9) sizeClass = "medium";
  if (count > 99) sizeClass = "large";

  return L.divIcon({
    html: `<div><span>${count}</span></div>`,
    className: `marker-cluster marker-cluster-${sizeClass}`,
    iconSize: L.point(40, 40),
  });
};

// =========================================================================
// MARKER KOMPONENTI (SMOOTH HARAKAT VA ROTATSIYA)
// =========================================================================

interface SmoothMarkerProps {
  device: Device;
  activeMarkerId: number | null;
  onMarkerClick: (id: number) => void;
}

function SmoothMarker({
  device,
  activeMarkerId,
  onMarkerClick,
}: SmoothMarkerProps) {
  // Dinamik import qilingan komponentlarni ReactLeaflet ob'ektidan olamiz
  const { useMap, Marker, Popup } = ReactLeaflet;
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  // Markerga fokuslanish va popupni ochish
  useEffect(() => {
    if (activeMarkerId === device.id && markerRef.current) {
      map.flyTo(
        [device.lat, device.lng],
        map.getZoom() < 10 ? 12 : map.getZoom(),
        {
          duration: 1.5,
        }
      );
      // Popupni ochish uchun biroz kechiktirish, flyTo tugashini kutish
      setTimeout(() => {
        if (markerRef.current) markerRef.current.openPopup();
      }, 1500);
    }
  }, [activeMarkerId, map, device.id, device.lat, device.lng]);

  // Marker click eventini tashqariga uzatish
  const handleMarkerClick = useCallback(() => {
    onMarkerClick(device.id);
  }, [device.id, onMarkerClick]);

  if (!L || !Marker || !Popup) return null; // L va komponentlar yuklanmaguncha markerlarni render qilmaymiz

  return (
    <Marker
      ref={markerRef}
      position={[device.lat, device.lng]}
      icon={createCustomCarIcon(device)} // Avtomobil ikonkasini ishlatamiz
      key={device.id}
      eventHandlers={{ click: handleMarkerClick }}
    >
      <Popup>
        <div className="text-sm dark:text-gray-900">
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

// =========================================================================
// XARITA KONTENTI (LAYERS, CLUSTERING)
// =========================================================================

interface MapContentProps {
  devices: Device[];
  activeMarkerId: number | null;
  showPaths: boolean; // Yangi: Yo'llarni ko'rsatish/yashirish
  onMarkerClick: (id: number) => void;
}

function MapContent({
  devices,
  activeMarkerId,
  showPaths,
  onMarkerClick,
}: MapContentProps) {
  // Dinamik import qilingan komponentlarni ReactLeaflet ob'ektidan olamiz
  const {
    LayersControl,
    TileLayer,
    FeatureGroup,
    Polyline,
    AttributionControl,
    ScaleControl,
  } = ReactLeaflet;

  if (
    !L ||
    !LayersControl ||
    !TileLayer ||
    !FeatureGroup ||
    !Polyline ||
    !AttributionControl ||
    !ScaleControl
  )
    return null; // L va komponentlar yuklanmaguncha xarita kontentini render qilmaymiz

  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer checked name="OpenStreetMap">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </LayersControl.BaseLayer>

      {/* Kelajakda boshqa turdagi xaritalarni qo'shish mumkin */}
      {/* <LayersControl.BaseLayer name="Satellite View">
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
      </LayersControl.BaseLayer> */}

      <LayersControl.Overlay checked name="Avtomobil Markerlari">
        {/* Klasterlashni ishlatamiz */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
        >
          {devices.map((device) => (
            <SmoothMarker
              device={device}
              key={device.id}
              activeMarkerId={activeMarkerId}
              onMarkerClick={onMarkerClick}
            />
          ))}
        </MarkerClusterGroup>
      </LayersControl.Overlay>

      {showPaths && (
        <LayersControl.Overlay name="Marshrutlar">
          <FeatureGroup>
            {devices.map(
              (device) =>
                device.path &&
                device.path.length > 1 && (
                  <Polyline
                    key={`path-${device.id}`}
                    positions={device.path}
                    color={
                      device.status === "active"
                        ? "#10b981"
                        : device.status === "idle"
                        ? "#f59e0b"
                        : "#6b7280"
                    }
                    weight={3}
                    opacity={0.7}
                  />
                )
            )}
          </FeatureGroup>
        </LayersControl.Overlay>
      )}

      {/* O'lchov shkalasi */}
      <ScaleControl position="bottomleft" imperial={false} />

      {/* Mualliflik huquqi */}
      <AttributionControl position="bottomright" prefix="UZ-NEXUS" />
    </LayersControl>
  );
}

// =========================================================================
// MA'LUMOT PANEL (INFO PANEL)
// =========================================================================

interface InfoPanelProps {
  activeDevice: Device | null;
  onClose: () => void;
}

function InfoPanel({ activeDevice, onClose }: InfoPanelProps) {
  if (!activeDevice) return null;

  const statusClasses = getStatusClasses(activeDevice.status);

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs w-full text-sm border dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-lg dark:text-white truncate">
          {activeDevice.name}
        </h4>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-2 dark:text-gray-300">
        <p className="flex items-center">
          <span className={`${statusClasses.dot} h-2 w-2 rounded-full mr-2`} />
          Status:{" "}
          <span className={cn("ml-1 font-semibold", statusClasses.text)}>
            {activeDevice.status.toUpperCase()}
          </span>
        </p>
        <p>
          Tezlik: <span className="font-medium">{activeDevice.speed} km/h</span>
        </p>
        <p>
          Batareya: <span className="font-medium">{activeDevice.battery}%</span>
        </p>
        <p>
          Joylashuv:{" "}
          <span className="font-medium">
            {activeDevice.lat.toFixed(4)}, {activeDevice.lng.toFixed(4)}
          </span>
        </p>
        <p>
          So'nggi yangilanish:{" "}
          <span className="font-medium">{activeDevice.lastUpdate}</span>
        </p>
      </div>
    </div>
  );
}

// =========================================================================
// ASOSIY LIVE MAP KOMPONENTI
// =========================================================================

interface LiveMapProps {
  devices: Device[];
  activeMarkerId: number | null;
  onDeviceFocus: (id: number) => void;
}

export function LiveMap({
  devices,
  activeMarkerId,
  onDeviceFocus,
}: LiveMapProps) {
  // Dinamik import qilingan MapContainer ni ReactLeaflet ob'ektidan olamiz
  const { MapContainer } = ReactLeaflet;
  const center = useMemo(() => [40.0, 66.9] as [number, number], []);
  const [showPaths, setShowPaths] = useState(true);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  useEffect(() => {
    if (activeMarkerId !== null) {
      setShowInfoPanel(true);
    } else {
      setShowInfoPanel(false);
    }
  }, [activeMarkerId]);

  const activeDevice = useMemo(() => {
    return devices.find((d) => d.id === activeMarkerId) || null;
  }, [devices, activeMarkerId]);

  const handleInfoPanelClose = useCallback(() => {
    onDeviceFocus(0);
    setShowInfoPanel(false);
  }, [onDeviceFocus]);

  // L va MapContainer yuklanmaguncha yuklanish holatini ko'rsatish
  if (!L || !MapContainer) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        Xarita yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-2xl relative">
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        maxZoom={18}
        minZoom={4}
      >
        <MapContent
          devices={devices}
          activeMarkerId={activeMarkerId}
          showPaths={showPaths}
          onMarkerClick={onDeviceFocus}
        />
      </MapContainer>

      {showInfoPanel && (
        <InfoPanel activeDevice={activeDevice} onClose={handleInfoPanelClose} />
      )}
    </div>
  );
}
