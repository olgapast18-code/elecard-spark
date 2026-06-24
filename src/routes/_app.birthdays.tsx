import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake } from "lucide-react";

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

export const Route = createFileRoute("/_app/birthdays")({ component: Birthdays });

function Birthdays() {
  const { users } = useApp();
  const byMonth: Record<number, typeof users> = {};
  for (let m = 0; m < 12; m++) byMonth[m] = [];
  users.filter((u) => u.birthday).forEach((u) => {
    const d = new Date(u.birthday!);
    byMonth[d.getMonth()].push(u);
  });
  for (const m in byMonth) byMonth[m].sort((a, b) => new Date(a.birthday!).getDate() - new Date(b.birthday!).getDate());

  const todayM = new Date().getMonth();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Cake className="h-7 w-7 text-coin" /> Календарь именинников</h1>
        <p className="text-muted-foreground text-sm">Не забудьте поздравить коллег 🎉</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MONTHS.map((name, i) => (
          <Card key={i} className={i === todayM ? "ring-2 ring-brand" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{name}</span>
                <span className="text-xs font-normal text-muted-foreground">{byMonth[i].length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {byMonth[i].length === 0 ? (
                <p className="text-xs text-muted-foreground">Нет именинников</p>
              ) : (
                <ul className="space-y-2">
                  {byMonth[i].map((u) => (
                    <li key={u.id} className="flex items-center gap-2">
                      <img src={u.avatar} className="h-8 w-8 rounded-full object-cover" alt="" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.position}</div>
                      </div>
                      <div className="text-xs font-semibold text-brand">{new Date(u.birthday!).getDate()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
