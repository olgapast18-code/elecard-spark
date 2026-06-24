import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake, Home, Megaphone, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/home")({ component: HomePage });

function daysUntilBirthday(b?: string) {
  if (!b) return Infinity;
  const d = new Date(b);
  const now = new Date();
  const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(now.getFullYear() + 1);
  return Math.round((next.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000);
}

function HomePage() {
  const { announcements, users, currentUser } = useApp();
  if (!currentUser) return null;

  const upcoming = [...users]
    .filter((u) => u.birthday)
    .map((u) => ({ u, in: daysUntilBirthday(u.birthday) }))
    .sort((a, b) => a.in - b.in)
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Home className="h-7 w-7 text-brand" /> Главная страница</h1>
        <p className="text-muted-foreground text-sm">Свежие новости и ближайшие праздники</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-brand" /> Новости компании</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-5">
              {announcements.slice(0, 4).map((a) => (
                <li key={a.id} className="border-l-2 border-brand pl-4">
                  <div className="text-sm font-semibold">{a.title}</div>
                  <div className="text-xs text-muted-foreground mb-1">{new Date(a.date).toLocaleDateString("ru-RU")}</div>
                  {a.image && <img src={a.image} alt="" className="my-2 rounded-lg max-h-56 w-full object-cover" />}
                  <div className="text-sm text-foreground/80 whitespace-pre-wrap">{a.body}</div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard" className="mt-4 inline-flex items-center gap-1 text-sm text-brand hover:underline">Все новости и обсуждения <ArrowRight className="h-3.5 w-3.5" /></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Cake className="h-5 w-5 text-coin" /> Ближайшие дни рождения</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcoming.length === 0 && <li className="text-sm text-muted-foreground">Нет данных о ДР</li>}
              {upcoming.map(({ u, in: d }) => (
                <li key={u.id} className="flex items-center gap-3">
                  <img src={u.avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(u.birthday!).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</div>
                  </div>
                  <Badge variant={d === 0 ? "default" : "secondary"}>{d === 0 ? "Сегодня!" : d === 1 ? "Завтра" : `через ${d} дн.`}</Badge>
                </li>
              ))}
            </ul>
            <Link to="/birthdays" className="mt-4 inline-flex items-center gap-1 text-sm text-brand hover:underline">Календарь именинников <ArrowRight className="h-3.5 w-3.5" /></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
