import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/bonuses")({ component: BonusRulesPage });

function BonusRulesPage() {
  const { bonusRules } = useApp();
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Sparkles className="h-7 w-7 text-coin" /> Как заработать ElecardBonus</h1>
        <p className="text-muted-foreground text-sm">Список активностей, за которые начисляются бонусы</p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {bonusRules.map((b) => (
          <Card key={b.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between gap-3">
                <span>{b.title}</span>
                <span className="flex items-center gap-1 text-coin font-bold text-lg shrink-0"><Coins className="h-5 w-5" />+{b.amount}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{b.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
