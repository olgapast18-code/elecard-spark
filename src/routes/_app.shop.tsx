import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp, type Product } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/shop")({
  component: Shop,
});

const CATEGORIES = ["Все", "Брендированный мерч", "Обучение", "Дни отдыха"] as const;

function Shop() {
  const { products, currentUser, buyProduct } = useApp();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("Все");

  const filtered = cat === "Все" ? products : products.filter((p) => p.category === cat);

  const handleBuy = (p: Product) => {
    const res = buyProduct(p.id);
    if (res.ok) toast.success(res.message, { description: `Списано ${p.price} ElecardBonus` });
    else toast.error(res.message);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-brand" /> Магазин бонусов
          </h1>
          <p className="text-muted-foreground text-sm">Тратьте ElecardBonus на полезные вещи</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-card border px-4 py-2">
          <Coins className="h-5 w-5 text-coin" />
          <span className="font-bold text-lg">{currentUser?.balance}</span>
          <span className="text-xs text-muted-foreground">bonus</span>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm border transition-colors",
              cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => {
          const enough = (currentUser?.balance ?? 0) >= p.price;
          return (
            <Card key={p.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow pt-0">
              <div className="aspect-[16/10] bg-muted overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-5 flex flex-col flex-1">
                <Badge variant="secondary" className="self-start mb-2">{p.category}</Badge>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex-1">{p.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-lg font-bold">
                    <Coins className="h-5 w-5 text-coin" />
                    {p.price}
                  </div>
                  <Button onClick={() => handleBuy(p)} disabled={!enough} size="sm">
                    {enough ? "Купить" : "Недостаточно"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
