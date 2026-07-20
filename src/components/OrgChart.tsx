import { useState } from "react";
import { useApp, type User } from "@/context/AppContext";
import { ChevronRight, ChevronDown, Mail, Calendar, Briefcase, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function OrgChart({ onSelect }: { onSelect: (u: User) => void }) {
  const { users } = useApp();
  const roots = users.filter((u) => !u.managerId);
  if (roots.length === 0) return <p className="text-sm text-muted-foreground">Структура пуста</p>;

  return (
    <div className="space-y-1">
      {roots.map((r) => (
        <TreeNode key={r.id} user={r} onSelect={onSelect} depth={0} />
      ))}
    </div>
  );
}

function TreeNode({ user, onSelect, depth, defaultOpen = false }: { user: User; onSelect: (u: User) => void; depth: number; defaultOpen?: boolean }) {
  const { users } = useApp();
  const [open, setOpen] = useState(defaultOpen);
  const [details, setDetails] = useState(false);
  const kids = users.filter((u) => u.managerId === user.id);
  const hasKids = kids.length > 0;

  return (
    <div className="relative">
      <div
        className="group flex items-center gap-2 rounded-lg border bg-card hover:border-brand hover:shadow-sm transition px-2 py-2"
        style={{ marginLeft: depth * 18 }}
      >
        <button
          onClick={() => hasKids && setOpen((v) => !v)}
          className={`h-6 w-6 grid place-items-center rounded hover:bg-muted ${hasKids ? "" : "opacity-30 cursor-default"}`}
          aria-label="toggle"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <button onClick={() => setDetails((v) => !v)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
          <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover aspect-square shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate group-hover:text-brand">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user.position}</div>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex shrink-0">{user.department}</Badge>
          {hasKids && <Badge variant="outline" className="shrink-0">{kids.length}</Badge>}
        </button>

        <Button size="sm" variant="ghost" onClick={() => onSelect(user)} title="Открыть карточку">
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {details && (
        <div className="mt-1 ml-12 mr-2 rounded-lg bg-muted/40 p-3 text-xs space-y-1.5" style={{ marginLeft: depth * 18 + 48 }}>
          <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-brand" /> {user.position} · {user.department}</div>
          <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-brand" /> {user.email}</div>
          <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-brand" /> в компании с {new Date(user.startDate).toLocaleDateString("ru-RU")}</div>
          {user.bio && <div className="pt-1 text-foreground/80">{user.bio}</div>}
          {user.responsibilities && user.responsibilities.length > 0 && (
            <div className="pt-1">
              <div className="font-semibold text-foreground mb-1">Обязанности:</div>
              <ul className="list-disc pl-4 space-y-0.5">{user.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {open && hasKids && (
        <div className="mt-1 space-y-1 border-l-2 border-dashed border-border ml-3 pl-1">
          {kids.map((k) => <TreeNode key={k.id} user={k} onSelect={onSelect} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}
