// src/app/analytics/page.tsx
"use client";

import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Filter,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// =========================================================================
// SIMULATSIYA QILINGAN MA'LUMOTLAR
// =========================================================================

interface DailyData {
  date: string;
  active: number;
  idle: number;
  offline: number;
  totalDistance: number; // KM
  fuelConsumption: number; // Litr
}

const generateDailyData = (startDate: Date, days: number): DailyData[] => {
  const data: DailyData[] = [];
  for (let i = 0; i < days; i++) {
    const currentDate = subDays(startDate, days - 1 - i);
    data.push({
      date: format(currentDate, "MMM dd"),
      active: Math.floor(Math.random() * 20) + 10, // 10-30 faol
      idle: Math.floor(Math.random() * 10) + 5, // 5-15 bekor
      offline: Math.floor(Math.random() * 5) + 2, // 2-7 o'chirilgan
      totalDistance: Math.floor(Math.random() * 500) + 100, // 100-600 km
      fuelConsumption: Math.floor(Math.random() * 50) + 20, // 20-70 litr
    });
  }
  return data;
};

// =========================================================================
// ANALITIKA SAHIFASI KOMPONENTI
// =========================================================================

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedDays, setSelectedDays] = useState<number>(30); // Default 30 kun

  const simulatedData = useMemo(() => {
    if (dateRange.from && dateRange.to) {
      const diffTime = Math.abs(
        dateRange.to.getTime() - dateRange.from.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 kun o'zini ham qo'shish uchun
      return generateDailyData(dateRange.to, diffDays);
    }
    return generateDailyData(new Date(), selectedDays);
  }, [dateRange, selectedDays]);

  // Umumiy hisobotlar
  const totalReport = useMemo(() => {
    return simulatedData.reduce(
      (acc, curr) => ({
        active: acc.active + curr.active,
        idle: acc.idle + curr.idle,
        offline: acc.offline + curr.offline,
        totalDistance: acc.totalDistance + curr.totalDistance,
        fuelConsumption: acc.fuelConsumption + curr.fuelConsumption,
      }),
      { active: 0, idle: 0, offline: 0, totalDistance: 0, fuelConsumption: 0 }
    );
  }, [simulatedData]);

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
      setSelectedDays(
        Math.ceil(
          Math.abs(range.to.getTime() - range.from.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      );
    } else {
      // DatePicker dan to'liq diapazon tanlanmaganda selectedDays ga qaytaramiz
      setDateRange({
        from: subDays(new Date(), selectedDays - 1),
        to: new Date(),
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold dark:text-gray-100 flex items-center">
        <LineChartIcon className="h-6 w-6 mr-3 text-primary" />
        Analitika Paneli (Analytics Dashboard)
      </h1>

      {/* Filtrlar va Sana Tanlash */}
      <div className="flex flex-wrap items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Sanani tanlang</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Button
          variant={selectedDays === 7 ? "default" : "outline"}
          onClick={() => {
            setSelectedDays(7);
            setDateRange({ from: subDays(new Date(), 6), to: new Date() });
          }}
        >
          Oxirgi 7 kun
        </Button>
        <Button
          variant={selectedDays === 30 ? "default" : "outline"}
          onClick={() => {
            setSelectedDays(30);
            setDateRange({ from: subDays(new Date(), 29), to: new Date() });
          }}
        >
          Oxirgi 30 kun
        </Button>
        <Button
          variant={selectedDays === 90 ? "default" : "outline"}
          onClick={() => {
            setSelectedDays(90);
            setDateRange({ from: subDays(new Date(), 89), to: new Date() });
          }}
        >
          Oxirgi 90 kun
        </Button>
        <Button
          variant={selectedDays === 365 ? "default" : "outline"}
          onClick={() => {
            setSelectedDays(365);
            setDateRange({ from: subDays(new Date(), 364), to: new Date() });
          }}
        >
          Oxirgi 1 yil
        </Button>
      </div>

      {/* Umumiy Ko'rsatkichlar */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faol Qurilmalar
            </CardTitle>
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalReport.active}
            </div>
            <p className="text-xs text-muted-foreground">Jami davr bo'yicha</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bosib o'tilgan masofa (km)
            </CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReport.totalDistance.toFixed(0)} km
            </div>
            <p className="text-xs text-muted-foreground">Jami davr bo'yicha</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Yoqilg'i sarfi (litr)
            </CardTitle>
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReport.fuelConsumption.toFixed(0)} L
            </div>
            <p className="text-xs text-muted-foreground">Jami davr bo'yicha</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              O'chirilgan Qurilmalar
            </CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {totalReport.offline}
            </div>
            <p className="text-xs text-muted-foreground">Jami davr bo'yicha</p>
          </CardContent>
        </Card>
      </div>

      {/* Diagrammalar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Qurilma Statuslari (Faol/Bekor/O'chirilgan)</CardTitle>
            <CardDescription>
              Belgilangan davr bo'yicha qurilma statuslari
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={simulatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    format(
                      new Date(value + " " + new Date().getFullYear()),
                      "MMM dd"
                    )
                  }
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#22c55e"
                  name="Faol"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="idle"
                  stroke="#facc15"
                  name="Bekor"
                />
                <Line
                  type="monotone"
                  dataKey="offline"
                  stroke="#6b7280"
                  name="O'chirilgan"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Masofa va Yoqilg'i sarfi</CardTitle>
            <CardDescription>
              Belgilangan davr bo'yicha umumiy masofa va yoqilg'i sarfi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={simulatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    format(
                      new Date(value + " " + new Date().getFullYear()),
                      "MMM dd"
                    )
                  }
                />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="totalDistance"
                  fill="#8884d8"
                  name="Masofa (km)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="fuelConsumption"
                  fill="#82ca9d"
                  name="Yoqilg'i (L)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Qo'shimcha tahlillar (Masalan, jadval) */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Umumiy ko'rinish</TabsTrigger>
          <TabsTrigger value="details">Batafsil ma'lumot</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Umumiy tahlil</CardTitle>
              <CardDescription>
                Qurilmalarning umumiy holati va harakatlari
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm dark:text-gray-300">
                Bu sahifa sizning kuzatuv tizimingizdan olingan ma'lumotlar
                asosida avtomobillar parkining umumiy holati va
                ko'rsatkichlarini tahlil qilish imkonini beradi. Yuqoridagi
                diagrammalar va hisobotlar orqali siz faoliyat, masofa va
                yoqilg'i sarfi bo'yicha tendensiyalarni kuzatishingiz mumkin.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batafsil Ma'lumotlar Jadvali</CardTitle>
              <CardDescription>
                Har bir kun bo'yicha batafsil ma'lumotlar jadvali kelajakda
                qo'shiladi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Jadval komponenti bu yerga qo'shilishi mumkin */}
              <p className="text-sm dark:text-gray-300">
                Hozircha batafsil ma'lumotlar jadvali bo'sh. Uni keyinroq
                qo'shamiz.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
