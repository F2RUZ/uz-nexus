// src/app/page.tsx
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        BOSQICH 3: UI Shell va Layout Muvaffaqiyatli O'rnatildi!
      </h1>
      <p className="text-muted-foreground">
        Sidebar, Header va Dark Mode funksionalligi asoslangan.
      </p>
      <div className="flex space-x-2">
        <Button>Asosiy Tugma</Button>
        <Button variant="secondary">Yordamchi Tugma</Button>
      </div>
    </div>
  );
}
