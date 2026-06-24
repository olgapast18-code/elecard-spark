import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp, DEPARTMENTS, type User } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { EmployeeCard } from "@/components/EmployeeCard";
import { OrgChart } from "@/components/OrgChart";

export const Route = createFileRoute("/_app/team")({
  component: TeamPage,
});

function TeamPage() {
  const { users } = useApp();
  const [selected, setSelected] = useState<User | null>(null);

  const depts = DEPARTMENTS.filter((d) => users.some((u) => u.department === d));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-7 w-7 text-brand" /> Наша команда
        </h1>
        <p className="text-muted-foreground text-sm">Иерархия и состав отделов. Наведите курсор на сотрудника для подробностей.</p>
      </header>

      <Card>
        <CardHeader><CardTitle>Наша компания</CardTitle></CardHeader>
        <CardContent>
          <OrgChart onSelect={setSelected} />
        </CardContent>
      </Card>

      <div className="space-y-6">
        {depts.map((d) => {
          const members = users.filter((u) => u.department === d);
          return (
            <Card key={d}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {d} <Badge variant="secondary">{members.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {members.map((u) => (
                    <div key={u.id} className="group relative">
                      <button
                        onClick={() => setSelected(u)}
                        className="w-full rounded-xl border bg-card hover:border-brand hover:shadow-lg transition-all p-4 text-center"
                      >
                        <img src={u.avatar} alt="" className="h-16 w-16 rounded-full mx-auto ring-2 ring-accent" />
                        <div className="mt-3 text-sm font-semibold truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.position}</div>
                      </button>
                      <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute z-10 left-1/2 -translate-x-1/2 top-full mt-2 w-64 rounded-lg border bg-popover text-popover-foreground shadow-xl p-3 text-left">
                        {u.bio && <div className="text-xs text-foreground/80 mb-2">{u.bio}</div>}
                        <div className="text-[11px] text-muted-foreground">{u.email}</div>
                        <div className="text-[11px] text-muted-foreground">С {new Date(u.startDate).toLocaleDateString("ru-RU")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <EmployeeCard user={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
