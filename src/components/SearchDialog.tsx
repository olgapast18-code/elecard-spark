import { useState, useMemo, useEffect } from "react";
import { useApp, type User } from "@/context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, BriefcaseBusiness } from "lucide-react";
import { EmployeeCard } from "@/components/EmployeeCard";

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { users, jobs } = useApp();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<User | null>(null);

  useEffect(() => { if (!open) setQ(""); }, [open]);

  const query = q.trim().toLowerCase();

  const matchedUsers = useMemo(() => {
    if (!query) return [];
    return users.filter((u) => {
      const skills = (u.responsibilities ?? []).join(" ").toLowerCase();
      return (
        u.name.toLowerCase().includes(query) ||
        u.department.toLowerCase().includes(query) ||
        u.position.toLowerCase().includes(query) ||
        skills.includes(query)
      );
    }).slice(0, 12);
  }, [users, query]);

  const matchedJobs = useMemo(() => {
    if (!query) return [];
    return jobs.filter((j) =>
      j.title.toLowerCase().includes(query) ||
      j.department.toLowerCase().includes(query) ||
      j.skills.join(" ").toLowerCase().includes(query),
    ).slice(0, 8);
  }, [jobs, query]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-brand" /> Поиск по сайту</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ФИО, отдел, должность или навык…"
          />

          <div className="max-h-[60vh] overflow-y-auto space-y-4">
            {query && matchedUsers.length === 0 && matchedJobs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Ничего не найдено</p>
            )}

            {matchedUsers.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Сотрудники</div>
                <ul className="space-y-1">
                  {matchedUsers.map((u) => (
                    <li key={u.id}>
                      <button
                        onClick={() => { setPicked(u); onOpenChange(false); }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left"
                      >
                        <img src={u.avatar} className="h-9 w-9 rounded-full object-cover aspect-square" alt="" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{u.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.position}</div>
                        </div>
                        <Badge variant="secondary">{u.department}</Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {matchedJobs.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><BriefcaseBusiness className="h-3.5 w-3.5" /> Должности</div>
                <ul className="space-y-1">
                  {matchedJobs.map((j) => (
                    <li key={j.id} className="p-2 rounded-lg hover:bg-muted">
                      <div className="text-sm font-medium">{j.title}</div>
                      <div className="text-xs text-muted-foreground">{j.department} · {j.skills.slice(0, 4).join(", ")}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EmployeeCard user={picked} open={!!picked} onOpenChange={(o) => !o && setPicked(null)} />
    </>
  );
}
