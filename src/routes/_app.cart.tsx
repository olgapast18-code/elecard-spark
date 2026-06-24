import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/cart")({ component: CartPage });

function CartPage() {
  const { cart, products, currentUser, removeFromCart, updateCartQty, checkoutCart, clearCart } = useApp();
  const navigate = useNavigate();
  if (!currentUser) return null;

  const items = cart.map((c) => ({ c, p: products.find((x) => x.id === c.productId)! })).filter((x) => x.p);
  const total = items.reduce((s, i) => s + i.p.price * i.c.qty, 0);

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><ShoppingCart className="h-7 w-7 text-brand" /> Корзина</h1>
          <p className="text-muted-foreground text-sm">Проверьте и оформите заказ</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-card border px-4 py-2">
          <Coins className="h-5 w-5 text-coin" />
          <span className="font-bold">{currentUser.balance}</span>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Товары ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 && <p className="text-sm text-muted-foreground">Корзина пуста. Перейдите в магазин и добавьте товары.</p>}
          {items.map(({ c, p }) => (
            <div key={p.id} className="flex items-center gap-3 border rounded-lg p-3">
              <img src={p.image} alt="" className="h-14 w-14 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.category}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => updateCartQty(p.id, c.qty - 1)}><Minus className="h-3.5 w-3.5" /></Button>
                <span className="w-8 text-center text-sm font-medium">{c.qty}</span>
                <Button size="icon" variant="ghost" onClick={() => updateCartQty(p.id, c.qty + 1)}><Plus className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="w-24 text-right font-bold flex items-center justify-end gap-1"><Coins className="h-4 w-4 text-coin" />{p.price * c.qty}</div>
              <Button size="icon" variant="ghost" className="text-rose-600" onClick={() => removeFromCart(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}

          {items.length > 0 && (
            <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-lg">
                Итого: <span className="font-bold inline-flex items-center gap-1"><Coins className="h-5 w-5 text-coin" />{total}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearCart}>Очистить</Button>
                <Button onClick={() => {
                  const r = checkoutCart();
                  if (r.ok) { toast.success(r.message, { description: "Заказ отправлен администратору." }); navigate({ to: "/shop" }); }
                  else toast.error(r.message);
                }}>Оформить заказ</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
