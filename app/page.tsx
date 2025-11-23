// src/app/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
// `Device` interfeysini `live-map` komponentidan to'g'ri import qilamiz
import { LiveMap, Device } from "@/features/map/components/live-map";
import { DeviceCard } from "@/features/map/components/device-card";
import { Button } from "@/components/ui/button";
import {
  ListFilter,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Asosiy shaharlar/hududlarga mos keladigan koordinatalar
const CITY_COORDS = [
  { lat: 41.3111, lng: 69.2797, name: "Toshkent" },
  { lat: 39.654, lng: 66.972, name: "Samarqand" },
  { lat: 39.77, lng: 64.43, name: "Buxoro" },
  { lat: 40.7831, lng: 72.3333, name: "Andijon" },
  { lat: 41.5582, lng: 60.6389, name: "Urganch" },
  { lat: 38.86, lng: 65.78, name: "Qarshi" },
  { lat: 41.05, lng: 71.65, name: "Namangan" },
  { lat: 41.05, lng: 71.65, name: "Fergana" },
  { lat: 37.2283, lng: 67.2792, name: "Termiz" },
  { lat: 40.85, lng: 68.78, name: "Jizzax" },
  { lat: 40.5, lng: 68.3, name: "Guliston" },
  { lat: 40.1, lng: 69.9, name: "Angren" },
  { lat: 39.1, lng: 67.5, name: "Shahrisabz" },
  { lat: 42.45, lng: 59.6, name: "Nukus" },
  { lat: 40.09, lng: 65.37, name: "Navoiy" },
];

// Device obyektini yaratish funksiyasi. Bu faqat mijozda ishga tushishi kerak.
const createDevice = (id: number): Device => {
  const randomCity =
    CITY_COORDS[Math.floor(Math.random() * CITY_COORDS.length)];
  const statusArray: Device["status"][] = [
    "active",
    "active",
    "idle",
    "offline",
  ];
  const status = statusArray[Math.floor(Math.random() * statusArray.length)];

  const initialLat = randomCity.lat + (Math.random() - 0.5) * 0.05;
  const initialLng = randomCity.lng + (Math.random() - 0.5) * 0.05;

  const initialPath: [number, number][] = [[initialLat, initialLng]];

  return {
    id,
    name: `${randomCity.name} Avtomobili #${id}`,
    lat: initialLat,
    lng: initialLng,
    status: status,
    speed: status === "active" ? Math.floor(Math.random() * 60) + 40 : 0,
    battery: Math.floor(Math.random() * 80) + 20,
    lastUpdate: `Endi`, // Boshlang'ich qiymat aniq bo'lishi uchun
    targetLat: initialLat + (Math.random() - 0.5) * 0.1, // `Device` interfeysiga qo'shilgan
    targetLng: initialLng + (Math.random() - 0.5) * 0.1, // `Device` interfeysiga qo'shilgan
    rotation: Math.floor(Math.random() * 360), // `Device` interfeysiga qo'shilgan
    path: initialPath, // `Device` interfeysiga qo'shilgan
  };
};

const ITEMS_PER_PAGE = 3;
export default function LiveMonitoringPage() {
  const [devices, setDevices] = useState<Device[]>([]); // Dastlab bo'sh array
  const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false); // Mijoz tomonida yuklanganini aniqlash uchun

  // Komponent mijoz tomonida yuklanganda INITIAL_DEVICES ni yaratamiz
  useEffect(() => {
    setIsClient(true);
    // Faqat mijozda ishga tushishi kerak bo'lgan kod
    setDevices(Array.from({ length: 40 }, (_, i) => createDevice(i + 1)));
  }, []); // Faqat bir marta ishga tushadi

  const totalPages = useMemo(
    () => Math.ceil(devices.length / ITEMS_PER_PAGE),
    [devices.length]
  );

  const currentDevices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return devices.slice(startIndex, endIndex);
  }, [devices, currentPage]);

  useEffect(() => {
    // Faqat mijozda ishga tushsin
    if (!isClient) return;

    const interval = setInterval(() => {
      setDevices((currentDevices) =>
        currentDevices.map((device) => {
          if (device.status !== "active") return device;

          let newDevice = { ...device };

          const distance = Math.sqrt(
            (newDevice.lat - newDevice.targetLat) ** 2 +
              (newDevice.lng - newDevice.targetLng) ** 2
          );

          if (distance < 0.005) {
            newDevice.targetLat = newDevice.lat + (Math.random() - 0.5) * 0.1;
            newDevice.targetLng = newDevice.lng + (Math.random() - 0.5) * 0.1;

            if (Math.random() < 0.2) {
              newDevice.status = "idle";
              newDevice.speed = 0;
              newDevice.lastUpdate =
                new Date().toLocaleTimeString("uz-UZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) + " (idle)";
            } else {
              newDevice.status = "active";
              newDevice.speed = Math.floor(Math.random() * 20) + 60;
              newDevice.lastUpdate = new Date().toLocaleTimeString("uz-UZ", {
                hour: "2-digit",
                minute: "2-digit",
              });
            }
          } else {
            const moveSpeed = 0.002;
            const latDiff = newDevice.targetLat - newDevice.lat;
            const lngDiff = newDevice.targetLng - newDevice.lng;

            const totalDiff = Math.sqrt(latDiff ** 2 + lngDiff ** 2);

            const angleRad = Math.atan2(latDiff, lngDiff);
            newDevice.rotation = (angleRad * 180) / Math.PI + 90;

            newDevice.lat += (latDiff / totalDiff) * moveSpeed;
            newDevice.lng += (lngDiff / totalDiff) * moveSpeed;
            newDevice.lastUpdate = new Date().toLocaleTimeString("uz-UZ", {
              hour: "2-digit",
              minute: "2-digit",
            });
            newDevice.speed = Math.floor(Math.random() * 20) + 60;

            if (typeof window !== "undefined" && (window as any).L) {
              if (
                newDevice.path.length === 0 ||
                newDevice.path.length % 20 === 0
              ) {
                newDevice.path = [
                  ...newDevice.path,
                  (window as any).L.latLng(newDevice.lat, newDevice.lng),
                ];
              } else {
                newDevice.path[newDevice.path.length - 1] = (
                  window as any
                ).L.latLng(newDevice.lat, newDevice.lng);
              }
            } else {
              // Agar L hali yuklanmagan bo'lsa, oddiy massiv sifatida saqlash
              if (
                newDevice.path.length === 0 ||
                newDevice.path.length % 20 === 0
              ) {
                newDevice.path = [
                  ...newDevice.path,
                  [newDevice.lat, newDevice.lng],
                ];
              } else {
                newDevice.path[newDevice.path.length - 1] = [
                  newDevice.lat,
                  newDevice.lng,
                ];
              }
            }
          }
          return newDevice;
        })
      );
    }, 2000); // Har 2 soniyada harakatni yangilash

    return () => clearInterval(interval);
  }, [isClient]); // isClient o'zgarganda effekni qayta ishga tushirish

  const handleFocus = useCallback(
    (id: number) => {
      setActiveMarkerId(id === activeMarkerId ? null : id);
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1500);
    },
    [activeMarkerId]
  );

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, [totalPages]);

  // Agar mijozda hali yuklanmagan bo'lsa, yuklanish holatini ko'rsatish
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-600 dark:text-gray-300">
        <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
        Sahifa yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold dark:text-gray-100 flex items-center">
        <MapPin className="h-6 w-6 mr-3 text-primary" />
        Jonli Kuzatuv (Live Monitoring)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        <div className="lg:col-span-2 h-full relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
          <LiveMap
            devices={devices}
            onDeviceFocus={handleFocus}
            activeMarkerId={activeMarkerId}
          />
        </div>

        <div className="lg:col-span-1 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold dark:text-gray-200">
              Kuzatuv Ob'ektlari ({devices.length})
            </h2>
            <Button variant="outline" size="sm" className="space-x-1">
              <ListFilter className="h-4 w-4" />
              <span>Filtr</span>
            </Button>
          </div>

          <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {currentDevices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onFocus={handleFocus}
                isActive={activeMarkerId === device.id}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium dark:text-gray-300">
                Sahifa {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
