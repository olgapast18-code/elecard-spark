import { useApp, type User } from "@/context/AppContext";
import { ChevronDown } from "lucide-react";

export function OrgChart({ onSelect }: { onSelect: (u: User) => void }) {
  const { users } = useApp();
  const root = users.find((u) => !u.managerId) ?? users[0];
  if (!root) return null;
  const childrenOf = (id: string) => users.filter((u) => u.managerId === id);

  const Node = ({ user }: { user: User }) => {
    const kids = childrenOf(user.id);
    return (
      <div className="flex flex-col items-center">
        <button
          onClick={() => onSelect(user)}
          className="group rounded-xl border bg-card hover:border-brand hover:shadow-md transition-all px-4 py-3 flex items-center gap-3 text-left min-w-[220px]"
        >
          <img src={user.avatar} alt="" className="h-10 w-10 rounded-full" />
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate group-hover:text-brand">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user.position}</div>
          </div>
        </button>
        {kids.length > 0 && (
          <>
            <ChevronDown className="h-4 w-4 text-muted-foreground my-1" />
            <div className="flex flex-wrap justify-center gap-6 pt-2 border-t-2 border-dashed border-border pt-4">
              {kids.map((k) => <Node key={k.id} user={k} />)}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-fit mx-auto">
        <Node user={root} />
      </div>
    </div>
  );
}
