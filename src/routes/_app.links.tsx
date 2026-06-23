import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_app/links")({
  component: LinksPage,
});

function LinksPage() {
  const { links } = useApp();
  const grouped = links.reduce<Record<string, typeof links>>((acc, l) => {
    const k = l.category ?? "Прочее";
    (acc[k] ||= []).push(l);
    return acc;
  }, {});

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Link2 className="h-7 w-7 text-brand" /> Полезные ссылки
        </h1>
        <p className="text-muted-foreground text-sm">Сервисы, документация и инструменты для сотрудников</p>
      </header>

      {Object.entries(grouped).map(([cat, items]) => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Badge variant="secondary">{cat}</Badge>
              <span className="text-muted-foreground text-xs font-normal">{items.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border bg-card hover:border-brand hover:shadow-md transition-all p-4 flex items-start gap-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-accent text-brand grid place-items-center shrink-0">
                    <ExternalLink className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm group-hover:text-brand truncate">{l.title}</div>
                    {l.description && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{l.description}</div>}
                    <div className="text-[11px] text-muted-foreground/70 truncate mt-1">{l.url}</div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
