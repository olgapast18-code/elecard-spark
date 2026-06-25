import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ClipboardList, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/polls")({ component: PollsPage });

function PollsPage() {
  const { polls, currentUser, isAdmin, votePoll } = useApp();
  if (!currentUser) return null;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardList className="h-7 w-7 text-brand" /> Опросы
        </h1>
        <p className="text-muted-foreground text-sm">Ваше мнение помогает развивать компанию</p>
      </header>

      {polls.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Пока нет активных опросов</CardContent></Card>
      )}

      <div className="grid gap-5">
        {polls.map((p) => {
          const totalVotes = p.options.reduce((s, o) => s + o.votes.length, 0);
          const myVote = p.options.find((o) => o.votes.includes(currentUser.id));
          const canSeeResults = isAdmin || !!myVote || p.closed;

          return (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2">
                  <span>{p.question}</span>
                  {p.closed && <Badge variant="outline" className="shrink-0"><Lock className="h-3 w-3 mr-1" /> Закрыт</Badge>}
                </CardTitle>
                {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
              </CardHeader>
              <CardContent className="space-y-3">
                {p.options.map((o) => {
                  const isMine = o.id === myVote?.id;
                  const pct = totalVotes ? Math.round((o.votes.length / totalVotes) * 100) : 0;
                  return (
                    <div key={o.id} className="space-y-1.5">
                      <Button
                        variant={isMine ? "default" : "outline"}
                        className="w-full justify-between"
                        disabled={p.closed}
                        onClick={() => {
                          if (p.closed) return;
                          votePoll(p.id, o.id);
                          toast.success("Голос учтён");
                        }}
                      >
                        <span className="flex items-center gap-2">
                          {isMine && <CheckCircle2 className="h-4 w-4" />}
                          {o.text}
                        </span>
                        {canSeeResults && <span className="text-xs opacity-80">{o.votes.length} · {pct}%</span>}
                      </Button>
                      {canSeeResults && <Progress value={pct} className="h-1.5" />}
                    </div>
                  );
                })}

                <div className="text-xs text-muted-foreground pt-2 flex items-center justify-between">
                  <span>Всего голосов: {totalVotes}</span>
                  {!canSeeResults && <span>Результаты появятся после вашего голоса</span>}
                  {isAdmin && <span className="text-brand">👑 Результаты видны администратору</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
