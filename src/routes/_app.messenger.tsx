import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Paperclip, Send, X, Search, FileIcon } from "lucide-react";
import { EmojiPicker } from "@/components/EmojiPicker";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/messenger")({ component: Messenger });

const SYSTEM = {
  id: "system",
  name: "Системные уведомления",
  position: "ElecardSpace",
  avatar: "https://ui-avatars.com/api/?name=SY&background=1e3a5f&color=fff&bold=true",
};

function Messenger() {
  const { users, currentUser, messages, sendMessage, markThreadRead } = useApp();
  const [peerId, setPeerId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; dataUrl: string; type: string }[]>([]);
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  const peers = useMemo(() => {
    const list = users.filter((u) => u.id !== currentUser.id).map((u) => ({ id: u.id, name: u.name, position: u.position, avatar: u.avatar }));
    list.push(SYSTEM);
    return list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  }, [users, currentUser.id, q]);

  const thread = messages
    .filter((m) => (m.fromId === peerId && m.toId === currentUser.id) || (m.toId === peerId && m.fromId === currentUser.id))
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));

  const unreadByPeer = useMemo(() => {
    const map: Record<string, number> = {};
    messages.filter((m) => m.toId === currentUser.id && !m.read).forEach((m) => { map[m.fromId] = (map[m.fromId] ?? 0) + 1; });
    return map;
  }, [messages, currentUser.id]);

  useEffect(() => { if (peerId) markThreadRead(peerId); }, [peerId, messages.length]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [thread.length, peerId]);

  const onFiles = (fl: FileList | null) => {
    if (!fl) return;
    Array.from(fl).forEach((f) => {
      if (f.size > 4 * 1024 * 1024) return;
      const r = new FileReader();
      r.onload = () => setAttachments((a) => [...a, { name: f.name, dataUrl: String(r.result), type: f.type }]);
      r.readAsDataURL(f);
    });
  };

  const send = () => {
    if (!peerId || peerId === "system") return;
    if (!draft.trim() && attachments.length === 0) return;
    sendMessage(peerId, draft.trim(), attachments);
    setDraft(""); setAttachments([]);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2"><MessageSquare className="h-7 w-7 text-brand" /> Мессенджер</h1>
        <p className="text-muted-foreground text-sm">Общение между сотрудниками с эмодзи и файлами</p>
      </header>

      <Card className="overflow-hidden">
        <CardContent className="p-0 grid md:grid-cols-[280px_1fr] h-[70vh] min-h-[500px]">
          <aside className="border-r bg-muted/30 flex flex-col min-h-0">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск..." className="pl-8 h-9" />
              </div>
            </div>
            <ul className="overflow-y-auto flex-1">
              {peers.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setPeerId(p.id)}
                    className={cn("w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent text-left", peerId === p.id && "bg-accent")}
                  >
                    <img src={p.avatar} className="h-9 w-9 rounded-full object-cover shrink-0" alt="" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.position}</div>
                    </div>
                    {unreadByPeer[p.id] > 0 && <Badge className="bg-brand text-primary-foreground">{unreadByPeer[p.id]}</Badge>}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="flex flex-col min-h-0">
            {!peerId ? (
              <div className="flex-1 grid place-items-center text-sm text-muted-foreground">Выберите собеседника</div>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                  {thread.length === 0 && <p className="text-sm text-muted-foreground text-center">Сообщений пока нет</p>}
                  {thread.map((m) => {
                    const mine = m.fromId === currentUser.id;
                    return (
                      <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words", mine ? "bg-brand text-primary-foreground" : m.system ? "bg-amber-100 text-amber-900" : "bg-muted")}>
                          {m.body}
                          {m.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {m.attachments.map((a, i) => a.type.startsWith("image/") ? (
                                <img key={i} src={a.dataUrl} alt={a.name} className="rounded max-h-48 object-contain" />
                              ) : (
                                <a key={i} href={a.dataUrl} download={a.name} className="flex items-center gap-2 text-xs underline">
                                  <FileIcon className="h-3.5 w-3.5" /> {a.name}
                                </a>
                              ))}
                            </div>
                          )}
                          <div className={cn("text-[10px] mt-1 opacity-70")}>{new Date(m.date).toLocaleString("ru-RU")}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {peerId !== "system" ? (
                  <div className="border-t p-3 space-y-2 bg-card">
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((a, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs bg-muted rounded px-2 py-1">
                            <FileIcon className="h-3 w-3" />{a.name}
                            <button onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      <input ref={fileRef} type="file" multiple hidden onChange={(e) => onFiles(e.target.files)} />
                      <Button size="icon" variant="ghost" onClick={() => fileRef.current?.click()}><Paperclip className="h-4 w-4" /></Button>
                      <EmojiPicker onPick={(e) => setDraft((d) => d + e)} />
                      <Textarea
                        rows={1}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                        placeholder="Введите сообщение..."
                        className="resize-none min-h-[40px] max-h-32"
                      />
                      <Button onClick={send}><Send className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t p-3 text-xs text-muted-foreground text-center bg-card">Системный канал — отвечать нельзя</div>
                )}
              </>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
