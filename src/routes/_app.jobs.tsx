import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp, DEPARTMENTS } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BriefcaseBusiness, Search, Target, ListChecks, Wrench, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/jobs")({
  component: Jobs,
});

function Jobs() {
  const { jobs } = useApp();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(jobs[0]?.id ?? null);

  const filtered = jobs.filter((j) => {
    const matchQ = j.title.toLowerCase().includes(q.toLowerCase());
    const matchD = dept === "all" || j.department === dept;
    return matchQ && matchD;
  });

  const selected = jobs.find((j) => j.id === selectedId) ?? filtered[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BriefcaseBusiness className="h-7 w-7 text-brand" /> Карта должностей и грейды
        </h1>
        <p className="text-muted-foreground text-sm">Все роли, миссии, KPI и карьерные треки в компании</p>
      </header>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <div className="space-y-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск должности…" className="pl-9" />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все отделы</SelectItem>
              {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((j) => (
              <button
                key={j.id}
                onClick={() => setSelectedId(j.id)}
                className={`w-full text-left rounded-xl border bg-card p-4 hover:border-brand transition-colors ${selected?.id === j.id ? "border-brand ring-2 ring-brand/20" : ""}`}
              >
                <div className="font-semibold">{j.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{j.department}</div>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">Ничего не найдено</p>}
          </div>
        </div>

        {selected && (
          <Card>
            <CardContent className="p-8 space-y-6">
              <div>
                <Badge variant="secondary">{selected.department}</Badge>
                <h2 className="text-2xl font-bold mt-2">{selected.title}</h2>
                <p className="text-muted-foreground mt-2">{selected.mission}</p>
              </div>

              <Section icon={ListChecks} title="Обязанности" items={selected.responsibilities} />
              <Section icon={Wrench} title="Навыки" items={selected.skills} pill />
              <Section icon={Target} title="KPI" items={selected.kpi} />

              <div>
                <div className="flex items-center gap-2 font-semibold mb-3"><ArrowRight className="h-4 w-4 text-brand" /> Карьерный трек</div>
                <div className="flex flex-wrap items-center gap-2">
                  {selected.careerTrack.map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="rounded-lg bg-accent text-accent-foreground px-3 py-1.5 text-sm font-medium">{step}</span>
                      {i < selected.careerTrack.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, items, pill }: { icon: React.ComponentType<{ className?: string }>; title: string; items: string[]; pill?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-2 font-semibold mb-3"><Icon className="h-4 w-4 text-brand" /> {title}</div>
      {pill ? (
        <div className="flex flex-wrap gap-2">
          {items.map((i) => <Badge key={i} variant="outline">{i}</Badge>)}
        </div>
      ) : (
        <ul className="space-y-1.5 text-sm text-foreground/80">
          {items.map((i) => <li key={i} className="flex gap-2"><span className="text-brand">•</span>{i}</li>)}
        </ul>
      )}
    </div>
  );
}
