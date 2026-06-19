import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Calendar, ListChecks, User as UserIcon } from "lucide-react";
import type { User } from "@/context/AppContext";

export function EmployeeCard({ user, open, onOpenChange }: { user: User | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!user) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">{user.name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-start gap-4">
          <img src={user.avatar} alt="" className="h-20 w-20 rounded-full ring-4 ring-accent" />
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.position}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{user.department}</Badge>
              {user.role === "admin" && <Badge>Администратор</Badge>}
            </div>
          </div>
        </div>

        {user.bio && (
          <p className="text-sm text-foreground/80 border-l-2 border-brand pl-3">{user.bio}</p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {user.email}</div>
          {user.telegram && (
            <div className="flex items-center gap-2 text-muted-foreground"><Send className="h-4 w-4" /> {user.telegram}</div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" /> В компании с {new Date(user.startDate).toLocaleDateString("ru-RU")}
          </div>
        </div>

        {user.responsibilities && user.responsibilities.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
              <ListChecks className="h-4 w-4" /> Обязанности
            </div>
            <ul className="space-y-1 text-sm">
              {user.responsibilities.map((r) => (
                <li key={r} className="flex gap-2"><UserIcon className="h-4 w-4 text-brand shrink-0 mt-0.5" /> {r}</li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
