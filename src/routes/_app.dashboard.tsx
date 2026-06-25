import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp, type User, type Announcement } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Coins, Mail, Send, Calendar, TrendingUp, TrendingDown, Megaphone, Users as UsersIcon, Target, Network, MessageSquare } from "lucide-react";
import { EmployeeCard } from "@/components/EmployeeCard";
import { OrgChart } from "@/components/OrgChart";
import { NewsDialog } from "@/components/NewsDialog";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { currentUser, users, announcements } = useApp();
  const [selected, setSelected] = useState<User | null>(null);
  const [openNews, setOpenNews] = useState<Announcement | null>(null);

  if (!currentUser) return null;

  const team = users.filter((u) => u.department === currentUser.department && u.id !== currentUser.id);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Привет, {currentUser.name.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground text-sm">Хорошего рабочего дня в ElecardSpace</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <img src={currentUser.avatar} alt="" className="h-24 w-24 rounded-full mx-auto ring-4 ring-accent" />
            <h2 className="mt-4 text-xl font-bold">{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground">{currentUser.position}</p>
            <Badge variant="secondary" className="mt-2">{currentUser.department}</Badge>
            <div className="mt-5 space-y-2 text-sm text-left">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {currentUser.email}</div>
              {currentUser.telegram && (
                <div className="flex items-center gap-2 text-muted-foreground"><Send className="h-4 w-4" /> {currentUser.telegram}</div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> с {new Date(currentUser.startDate).toLocaleDateString("ru-RU")}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-gradient-to-br from-brand to-primary text-primary-foreground overflow-hidden relative">
          <CardContent className="p-8">
            <div className="text-sm uppercase tracking-wider opacity-80">Мой баланс</div>
            <div className="flex items-end gap-3 mt-2">
              <Coins className="h-12 w-12 text-coin drop-shadow" />
              <div className="text-6xl font-extrabold leading-none">{currentUser.balance}</div>
              <div className="pb-2 text-lg opacity-90">ElecardBonus</div>
            </div>
            <p className="mt-4 text-sm opacity-80 max-w-md">
              Внутренняя валюта компании. Тратьте на мерч, обучение и дополнительные дни отдыха в магазине бонусов.
            </p>
            <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -right-2 -top-10 h-32 w-32 rounded-full bg-white/5" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Network className="h-5 w-5 text-brand" /> Наша компания</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">Кликните на сотрудника, чтобы открыть его карточку</p>
          <OrgChart onSelect={setSelected} />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5 text-coin" /> История транзакций</CardTitle>
          </CardHeader>
          <CardContent>
            {currentUser.transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Пока нет операций</p>
            ) : (
              <ul className="divide-y">
                {currentUser.transactions.map((t) => (
                  <li key={t.id} className="py-3 flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full grid place-items-center ${t.type === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {t.type === "credit" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{t.reason}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.from && `от ${t.from} · `}{new Date(t.date).toLocaleDateString("ru-RU")}
                      </div>
                    </div>
                    <div className={`font-bold ${t.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                      {t.type === "credit" ? "+" : "−"}{t.amount}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-brand" /> Мои задачи / KPI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentUser.kpi.length === 0 && <p className="text-sm text-muted-foreground">Нет активных задач</p>}
            {currentUser.kpi.map((k) => (
              <div key={k.title}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{k.title}</span>
                  <span className="font-medium">{k.progress}%</span>
                </div>
                <Progress value={k.progress} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UsersIcon className="h-5 w-5 text-brand" /> Моя команда — {currentUser.department}</CardTitle>
        </CardHeader>
        <CardContent>
          {team.length === 0 ? (
            <p className="text-sm text-muted-foreground">Вы пока единственный сотрудник отдела</p>
          ) : (
            <ul className="space-y-3">
              {team.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <img src={m.avatar} className="h-10 w-10 rounded-full" alt="" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.position}</div>
                  </div>
                  <Badge variant="outline">{m.balance} ⭐</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-brand" /> Объявления компании</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Нажмите на новость, чтобы открыть обсуждение</p>
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => setOpenNews(a)}
                  className="w-full text-left border rounded-lg p-3 hover:border-brand hover:shadow-sm transition flex gap-3 items-start"
                >
                  {a.image && <img src={a.image} alt="" className="h-14 w-14 rounded-lg object-cover aspect-square shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground mb-1">{new Date(a.date).toLocaleDateString("ru-RU")}</div>
                    <div className="text-sm text-foreground/80 line-clamp-2">{a.body}</div>
                    <div className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {a.comments.length} комм.
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <EmployeeCard user={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
      <NewsDialog announcement={openNews} open={!!openNews} onOpenChange={(o) => !o && setOpenNews(null)} />
    </div>
  );
}
