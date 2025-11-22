// src/features/map/components/device-card.tsx
// ❌ Eskisi: import { MapPin, Speedometer, BatteryCharging, Clock } from 'lucide-react';
// ✅ Yangisi:
import { MapPin, Gauge, BatteryCharging, Clock } from "lucide-react"; // Speedometer o'rniga Gauge
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Button komponentimiz

interface Device {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: "active" | "idle" | "offline";
  speed: number;
  battery: number;
  lastUpdate: string;
}

interface DeviceCardProps {
  device: Device;
  onFocus: (id: number) => void;
  isActive: boolean;
}

// Statusga qarab rangni aniqlash funksiyasi
const getStatusClasses = (status: Device["status"]) => {
  switch (status) {
    case "active":
      return { text: "text-green-500", dot: "bg-green-500" };
    case "idle":
      return { text: "text-yellow-500", dot: "bg-yellow-500" };
    case "offline":
      return { text: "text-gray-500", dot: "bg-gray-500" };
  }
};

export function DeviceCard({ device, onFocus, isActive }: DeviceCardProps) {
  const statusClasses = getStatusClasses(device.status);

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border-2 transition-all duration-300 cursor-pointer hover:shadow-lg",
        isActive
          ? "border-primary dark:border-primary-foreground scale-[1.02]"
          : "border-transparent hover:border-gray-300 dark:hover:border-gray-700"
      )}
      onClick={() => onFocus(device.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold truncate dark:text-white">
          {device.name}
        </h3>
        <div className="flex items-center space-x-2 text-sm">
          <span
            className={cn(
              statusClasses.dot,
              "h-2 w-2 rounded-full animate-pulse",
              device.status === "active" ? "animate-pulse" : "animate-none"
            )}
          />
          <span className={statusClasses.text}>
            {device.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span>
            {device.lat.toFixed(4)}, {device.lng.toFixed(4)}
          </span>
        </div>
        <div className="flex items-center">
          {/* ❌ Eskisi: <Speedometer className="h-4 w-4 mr-2 text-blue-500" /> */}
          {/* ✅ Yangisi: */}
          <Gauge className="h-4 w-4 mr-2 text-blue-500" />
          <span>Tezlik: {device.speed} km/h</span>
        </div>
        <div className="flex items-center">
          <BatteryCharging className="h-4 w-4 mr-2 text-yellow-500" />
          <span>Batareya: {device.battery}%</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>{device.lastUpdate}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-primary dark:text-primary-foreground hover:bg-primary/10"
        >
          Batafsil
        </Button>
      </div>
    </div>
  );
}
