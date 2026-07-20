import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useApp, DEPARTMENTS, type Product, type Job, type User, type Announcement, type UsefulLink, type BonusRule } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Coins, UserPlus, Pencil, PackagePlus, Sparkles, Trash2, Network, Megaphone, Plus, Camera, Target, Link2, ExternalLink, Cake, Building2, ImagePlus, X, ClipboardList, Download, Upload, RefreshCw, Database } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin")({
  component: AdminPage,
});

function AdminPage() {
  const app = useApp();
  const { isAdmin } = app;
  const navigate = useNavigate();

  useEffect(() => { if (!isAdmin) navigate({ to: "/dashboard" }); }, [isAdmin, navigate]);
  if (!isAdmin) return null;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-brand" /> Админ-панель
        </h1>
        <p className="text-muted-foreground text-sm">Сотрудники, структура, бонусы, новости, задачи, должности, магазин, ссылки</p>
      </header>

      <Tabs defaultValue="employees">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="employees">Сотрудники</TabsTrigger>
          <TabsTrigger value="structure">Структура</TabsTrigger>
          <TabsTrigger value="departments">Отделы</TabsTrigger>
          <TabsTrigger value="news">Новости</TabsTrigger>
          <TabsTrigger value="birthdays">Дни рождения</TabsTrigger>
          <TabsTrigger value="tasks">Задачи</TabsTrigger>
          <TabsTrigger value="grant">Бонусы</TabsTrigger>
          <TabsTrigger value="bonusrules">Как заработать</TabsTrigger>
          <TabsTrigger value="shop">Магазин</TabsTrigger>
          <TabsTrigger value="jobs">Должности</TabsTrigger>
          <TabsTrigger value="links">Ссылки</TabsTrigger>
          <TabsTrigger value="polls">Опросы</TabsTrigger>
          <TabsTrigger value="data">Данные</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4 pt-4"><EmployeesPanel /></TabsContent>
        <TabsContent value="structure" className="pt-4"><StructurePanel /></TabsContent>
        <TabsContent value="departments" className="pt-4"><DepartmentsPanel /></TabsContent>
        <TabsContent value="news" className="pt-4"><NewsPanel /></TabsContent>
        <TabsContent value="birthdays" className="pt-4"><BirthdaysPanel /></TabsContent>
        <TabsContent value="tasks" className="pt-4"><TasksPanel /></TabsContent>
        <TabsContent value="grant" className="pt-4">
          <GrantPanel users={app.users.filter((u) => u.role !== "admin")} onGrant={(uid, amt, reason) => {
            app.grantBonus(uid, amt, reason);
            const u = app.users.find((x) => x.id === uid);
            toast.success(`Начислено ${amt} бонусов`, { description: `${u?.name} · ${reason}` });
          }} />
        </TabsContent>
        <TabsContent value="bonusrules" className="pt-4"><BonusRulesPanel /></TabsContent>
        <TabsContent value="shop" className="pt-4"><ShopAdmin /></TabsContent>
        <TabsContent value="jobs" className="pt-4"><JobsAdmin /></TabsContent>
        <TabsContent value="links" className="pt-4"><LinksAdmin /></TabsContent>
        <TabsContent value="polls" className="pt-4"><PollsAdmin /></TabsContent>
        <TabsContent value="data" className="pt-4"><DataPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- Employees ---------- */
function EmployeesPanel() {
  const { users, updateUser, addUser, deleteUser, departments } = useApp();
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const empty = { name: "", email: "", password: "", department: departments[0] ?? "", position: "", balance: 100, avatar: "" };
  const [newU, setNewU] = useState(empty);

  const onFile = (f: File) => {
    if (f.size > 4 * 1024 * 1024) return toast.error("Файл больше 4МБ");
    const r = new FileReader();
    r.onload = () => setNewU((d) => ({ ...d, avatar: String(r.result) }));
    r.readAsDataURL(f);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Список сотрудников ({users.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><UserPlus className="h-4 w-4 mr-2" /> Добавить</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новый сотрудник</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {newU.avatar ? <img src={newU.avatar} className="h-14 w-14 rounded-full object-cover" alt="" /> : <div className="h-14 w-14 rounded-full bg-muted" />}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Camera className="h-4 w-4 mr-2" />Фото</Button>
              </div>
              <Field label="ФИО"><Input value={newU.name} onChange={(e) => setNewU({ ...newU, name: e.target.value })} /></Field>
              <Field label="Email"><Input value={newU.email} onChange={(e) => setNewU({ ...newU, email: e.target.value })} /></Field>
              <Field label="Пароль"><Input value={newU.password} onChange={(e) => setNewU({ ...newU, password: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Отдел">
                  <Select value={newU.department} onValueChange={(v) => setNewU({ ...newU, department: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Должность"><Input value={newU.position} onChange={(e) => setNewU({ ...newU, position: e.target.value })} /></Field>
              </div>
              <Field label="Начальный баланс"><Input type="number" value={newU.balance} onChange={(e) => setNewU({ ...newU, balance: +e.target.value })} /></Field>
              <Button className="w-full" onClick={() => {
                if (!newU.name || !newU.email) return toast.error("ФИО и Email обязательны");
                addUser({ ...newU, startDate: new Date().toISOString().slice(0, 10) });
                toast.success("Сотрудник добавлен");
                setOpen(false);
                setNewU(empty);
              }}>Создать</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b">
              <tr><th className="py-2 pr-4">Сотрудник</th><th className="pr-4">Отдел</th><th className="pr-4">Должность</th><th className="pr-4">Баланс</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <EmployeeRow
                  key={u.id}
                  user={u}
                  onSave={(patch) => { updateUser(u.id, patch); toast.success("Сохранено"); }}
                  onDelete={() => {
                    if (u.role === "admin") return toast.error("Нельзя удалить администратора");
                    if (!confirm(`Удалить сотрудника ${u.name}?`)) return;
                    deleteUser(u.id);
                    toast.success("Сотрудник удалён");
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function EmployeeRow({ user, onSave, onDelete }: { user: User; onSave: (p: Partial<User>) => void; onDelete: () => void }) {
  const { users } = useApp();
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fresh = () => ({
    name: user.name, position: user.position, department: user.department, balance: user.balance,
    bio: user.bio ?? "", responsibilities: (user.responsibilities ?? []).join(", "),
    managerId: user.managerId ?? "", avatar: user.avatar,
    startDate: user.startDate ?? "", birthday: user.birthday ?? "",
  });
  const [draft, setDraft] = useState(fresh());
  const managers = users.filter((u) => u.id !== user.id);

  const onFile = (f: File) => {
    if (f.size > 4 * 1024 * 1024) return toast.error("Файл больше 4МБ");
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, avatar: String(r.result) }));
    r.readAsDataURL(f);
  };

  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-4 flex items-center gap-3"><img src={user.avatar} className="h-8 w-8 rounded-full object-cover" alt="" />{user.name}</td>
      <td className="pr-4"><Badge variant="secondary">{user.department}</Badge></td>
      <td className="pr-4">{user.position}</td>
      <td className="pr-4 font-semibold flex items-center gap-1"><Coins className="h-4 w-4 text-coin" />{user.balance}</td>
      <td className="text-right whitespace-nowrap">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(fresh()); }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Редактировать сотрудника</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex items-center gap-3">
                <img src={draft.avatar} className="h-14 w-14 rounded-full object-cover" alt="" />
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Camera className="h-4 w-4 mr-2" />Сменить фото</Button>
              </div>
              <Field label="ФИО"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
              <Field label="Должность"><Input value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })} /></Field>
              <Field label="Отдел">
                <Select value={draft.department} onValueChange={(v) => setDraft({ ...draft, department: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Руководитель">
                <Select value={draft.managerId || "none"} onValueChange={(v) => setDraft({ ...draft, managerId: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Без руководителя —</SelectItem>
                    {managers.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} — {m.position}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="О себе"><Textarea rows={3} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} /></Field>
              <Field label="Обязанности (через запятую)"><Textarea rows={2} value={draft.responsibilities} onChange={(e) => setDraft({ ...draft, responsibilities: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Дата начала работы"><Input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} /></Field>
                <Field label="День рождения"><Input type="date" value={draft.birthday} onChange={(e) => setDraft({ ...draft, birthday: e.target.value })} /></Field>
              </div>
              <Field label="Баланс"><Input type="number" value={draft.balance} onChange={(e) => setDraft({ ...draft, balance: +e.target.value })} /></Field>
              <Button className="w-full" onClick={() => {
                onSave({
                  name: draft.name, position: draft.position, department: draft.department, balance: draft.balance,
                  bio: draft.bio,
                  responsibilities: draft.responsibilities.split(",").map((s) => s.trim()).filter(Boolean),
                  managerId: draft.managerId || null,
                  avatar: draft.avatar,
                  startDate: draft.startDate,
                  birthday: draft.birthday || undefined,
                });
                setOpen(false);
              }}>Сохранить</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-rose-600 hover:text-rose-700"><Trash2 className="h-4 w-4" /></Button>
      </td>
    </tr>
  );
}

/* ---------- Structure ---------- */
function StructurePanel() {
  const { users, updateUser } = useApp();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Network className="h-5 w-5 text-brand" /> Структура подчинения</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">Назначьте руководителя каждому сотруднику, чтобы выстроить дерево компании.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b">
              <tr><th className="py-2 pr-4">Сотрудник</th><th className="pr-4">Отдел</th><th className="pr-4">Руководитель</th></tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const candidates = users.filter((m) => m.id !== u.id);
                return (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 flex items-center gap-3"><img src={u.avatar} className="h-8 w-8 rounded-full object-cover" alt="" /><div><div className="font-medium">{u.name}</div><div className="text-xs text-muted-foreground">{u.position}</div></div></td>
                    <td className="pr-4"><Badge variant="secondary">{u.department}</Badge></td>
                    <td className="pr-4 min-w-[260px]">
                      <Select
                        value={u.managerId ?? "none"}
                        onValueChange={(v) => {
                          updateUser(u.id, { managerId: v === "none" ? null : v });
                          toast.success("Связь обновлена");
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— Корень / без руководителя —</SelectItem>
                          {candidates.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} — {m.position}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- News ---------- */
function NewsPanel() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useApp();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File) => {
    if (f.size > 4 * 1024 * 1024) return toast.error("Файл больше 4МБ");
    const r = new FileReader();
    r.onload = () => setImage(String(r.result));
    r.readAsDataURL(f);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-brand" /> Новости и объявления</CardTitle></CardHeader>
        <CardContent>
          {announcements.length === 0 && <p className="text-sm text-muted-foreground">Пока нет новостей</p>}
          <ul className="space-y-4">
            {announcements.map((a) => (
              <NewsItem key={a.id} a={a} onSave={(p) => { updateAnnouncement(a.id, p); toast.success("Новость обновлена"); }} onDelete={() => { if (confirm("Удалить новость?")) { deleteAnnouncement(a.id); toast.success("Удалено"); } }} />
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-brand" /> Новая публикация</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Field label="Заголовок"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <Field label="Текст"><Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Поддерживаются эмодзи 🎉✨" /></Field>
          <div>
            <Label className="text-xs">Картинка (необязательно)</Label>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            {image ? (
              <div className="relative mt-2">
                <img src={image} alt="" className="rounded-lg max-h-40 w-full object-cover" />
                <Button size="icon" variant="ghost" className="absolute top-1 right-1 bg-background/80" onClick={() => setImage("")}><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="mt-1" onClick={() => fileRef.current?.click()}><ImagePlus className="h-4 w-4 mr-2" />Загрузить фото</Button>
            )}
          </div>
          <Button className="w-full" onClick={() => {
            if (!title.trim() || !body.trim()) return toast.error("Заполните заголовок и текст");
            addAnnouncement({ title: title.trim(), body: body.trim(), image: image || undefined });
            toast.success("Опубликовано");
            setTitle(""); setBody(""); setImage("");
          }}>Опубликовать</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function NewsItem({ a, onSave, onDelete }: { a: Announcement; onSave: (p: { title: string; body: string; image?: string }) => void; onDelete: () => void }) {
  const [edit, setEdit] = useState(false);
  const [t, setT] = useState(a.title);
  const [b, setB] = useState(a.body);
  const [img, setImg] = useState(a.image ?? "");
  const fileRef = useRef<HTMLInputElement>(null);
  const onFile = (f: File) => {
    if (f.size > 4 * 1024 * 1024) return toast.error("Файл больше 4МБ");
    const r = new FileReader(); r.onload = () => setImg(String(r.result)); r.readAsDataURL(f);
  };
  if (edit) {
    return (
      <li className="border rounded-lg p-3 space-y-2">
        <Input value={t} onChange={(e) => setT(e.target.value)} />
        <Textarea rows={3} value={b} onChange={(e) => setB(e.target.value)} />
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        {img ? (
          <div className="relative">
            <img src={img} alt="" className="rounded-lg max-h-40 w-full object-cover" />
            <Button size="icon" variant="ghost" className="absolute top-1 right-1 bg-background/80" onClick={() => setImg("")}><X className="h-4 w-4" /></Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><ImagePlus className="h-4 w-4 mr-2" />Добавить фото</Button>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { onSave({ title: t, body: b, image: img || undefined }); setEdit(false); }}>Сохранить</Button>
          <Button size="sm" variant="ghost" onClick={() => { setT(a.title); setB(a.body); setImg(a.image ?? ""); setEdit(false); }}>Отмена</Button>
        </div>
      </li>
    );
  }
  return (
    <li className="border-l-2 border-brand pl-4 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{a.title}</div>
        <div className="text-xs text-muted-foreground mb-1">{new Date(a.date).toLocaleDateString("ru-RU")} · {a.comments.length} комм.</div>
        {a.image && <img src={a.image} alt="" className="my-1 rounded max-h-32 object-cover" />}
        <div className="text-sm text-foreground/80 whitespace-pre-wrap">{a.body}</div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button size="sm" variant="ghost" onClick={() => setEdit(true)}><Pencil className="h-4 w-4" /></Button>
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-rose-600 hover:text-rose-700"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </li>
  );
}

/* ---------- Grant ---------- */
function GrantPanel({ users, onGrant }: { users: User[]; onGrant: (uid: string, amt: number, reason: string) => void }) {
  const [uid, setUid] = useState<string>(users[0]?.id ?? "");
  const [amount, setAmount] = useState(50);
  const [reason, setReason] = useState("Успешное закрытие спринта");
  const presets = ["Успешное закрытие спринта", "За помощь в организации мероприятия", "Менторинг", "Инициатива квартала"];

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-brand" /> Начислить ElecardBonus</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Сотрудник">
            <Select value={uid} onValueChange={setUid}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} — {u.position}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Сумма"><Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} /></Field>
          <Field label="Причина"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} /></Field>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button key={p} onClick={() => setReason(p)} className="text-xs rounded-full border bg-card hover:bg-accent px-3 py-1">{p}</button>
            ))}
          </div>
          <Button className="w-full" onClick={() => {
            if (!uid || amount <= 0 || !reason) return toast.error("Заполните все поля");
            onGrant(uid, amount, reason);
          }}>Начислить</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Текущие балансы</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3">
                <img src={u.avatar} className="h-9 w-9 rounded-full object-cover" alt="" />
                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{u.name}</div><div className="text-xs text-muted-foreground truncate">{u.position}</div></div>
                <div className="font-bold flex items-center gap-1"><Coins className="h-4 w-4 text-coin" />{u.balance}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Shop admin ---------- */
function ShopAdmin() {
  const { products, updateProduct, addProduct, deleteProduct } = useApp();
  const [open, setOpen] = useState(false);
  const [n, setN] = useState<Omit<Product, "id">>({ name: "", description: "", price: 100, category: "Брендированный мерч", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=70" });
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Витрина магазина</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><PackagePlus className="h-4 w-4 mr-2" />Новый товар</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новый товар</DialogTitle></DialogHeader>
            <ProductForm value={n} onChange={setN} />
            <Button className="w-full" onClick={() => { if (!n.name) return toast.error("Название обязательно"); addProduct(n); toast.success("Товар добавлен"); setOpen(false); }}>Создать</Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductAdminCard
              key={p.id}
              product={p}
              onSave={(patch) => { updateProduct(p.id, patch); toast.success("Сохранено"); }}
              onDelete={() => { if (confirm(`Удалить «${p.name}»?`)) { deleteProduct(p.id); toast.success("Товар удалён"); } }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductAdminCard({ product, onSave, onDelete }: { product: Product; onSave: (p: Partial<Product>) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState<Omit<Product, "id">>({ name: product.name, description: product.description, price: product.price, category: product.category, image: product.image });
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <img src={product.image} alt="" className="aspect-video object-cover w-full" />
      <div className="p-3 space-y-1">
        <div className="text-sm font-semibold">{product.name}</div>
        <div className="text-xs text-muted-foreground line-clamp-2">{product.description}</div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-bold flex items-center gap-1"><Coins className="h-4 w-4 text-coin" />{product.price}</span>
          <div className="flex gap-1">
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setD({ name: product.name, description: product.description, price: product.price, category: product.category, image: product.image }); }}>
              <DialogTrigger asChild><Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Редактировать товар</DialogTitle></DialogHeader>
                <ProductForm value={d} onChange={setD} />
                <Button className="w-full" onClick={() => { onSave(d); setOpen(false); }}>Сохранить</Button>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-rose-600 hover:text-rose-700"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductForm({ value, onChange }: { value: Omit<Product, "id">; onChange: (v: Omit<Product, "id">) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Название"><Input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} /></Field>
      <Field label="Описание"><Textarea rows={2} value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Цена"><Input type="number" value={value.price} onChange={(e) => onChange({ ...value, price: +e.target.value })} /></Field>
        <Field label="Категория">
          <Select value={value.category} onValueChange={(v) => onChange({ ...value, category: v as Product["category"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Брендированный мерч">Брендированный мерч</SelectItem>
              <SelectItem value="Обучение">Обучение</SelectItem>
              <SelectItem value="Дни отдыха">Дни отдыха</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="URL картинки"><Input value={value.image} onChange={(e) => onChange({ ...value, image: e.target.value })} /></Field>
    </div>
  );
}

/* ---------- Jobs admin ---------- */
function JobsAdmin() {
  const { jobs, addJob, updateJob, deleteJob } = useApp();
  const empty = { title: "", department: DEPARTMENTS[0], mission: "", responsibilities: "", skills: "", kpi: "", careerTrack: "" };
  const [open, setOpen] = useState(false);
  const [j, setJ] = useState(empty);
  const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Должности ({jobs.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><PackagePlus className="h-4 w-4 mr-2" />Новая должность</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Новая должность</DialogTitle></DialogHeader>
            <JobForm value={j} onChange={setJ} />
            <Button className="w-full" onClick={() => {
              if (!j.title) return toast.error("Название обязательно");
              addJob({ title: j.title, department: j.department, mission: j.mission, responsibilities: split(j.responsibilities), skills: split(j.skills), kpi: split(j.kpi), careerTrack: split(j.careerTrack) });
              toast.success("Должность создана"); setOpen(false); setJ(empty);
            }}>Создать</Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((it) => (
            <JobCard key={it.id} job={it}
              onSave={(patch) => { updateJob(it.id, patch); toast.success("Сохранено"); }}
              onDelete={() => { if (confirm(`Удалить «${it.title}»?`)) { deleteJob(it.id); toast.success("Удалено"); } }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function JobCard({ job, onSave, onDelete }: { job: Job; onSave: (p: Partial<Job>) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState({
    title: job.title, department: job.department, mission: job.mission,
    responsibilities: job.responsibilities.join(", "),
    skills: job.skills.join(", "),
    kpi: job.kpi.join(", "),
    careerTrack: job.careerTrack.join(", "),
  });
  const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col">
      <Badge variant="secondary">{job.department}</Badge>
      <div className="font-semibold mt-2">{job.title}</div>
      <div className="text-xs text-muted-foreground line-clamp-3 mt-1 flex-1">{job.mission}</div>
      <div className="flex justify-end gap-1 mt-3">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setD({ title: job.title, department: job.department, mission: job.mission, responsibilities: job.responsibilities.join(", "), skills: job.skills.join(", "), kpi: job.kpi.join(", "), careerTrack: job.careerTrack.join(", ") }); }}>
          <DialogTrigger asChild><Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Редактировать должность</DialogTitle></DialogHeader>
            <JobForm value={d} onChange={setD} />
            <Button className="w-full" onClick={() => {
              onSave({ title: d.title, department: d.department, mission: d.mission, responsibilities: split(d.responsibilities), skills: split(d.skills), kpi: split(d.kpi), careerTrack: split(d.careerTrack) });
              setOpen(false);
            }}>Сохранить</Button>
          </DialogContent>
        </Dialog>
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-rose-600 hover:text-rose-700"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function JobForm({ value, onChange }: { value: { title: string; department: string; mission: string; responsibilities: string; skills: string; kpi: string; careerTrack: string }; onChange: (v: typeof value) => void }) {
  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
      <Field label="Название"><Input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} /></Field>
      <Field label="Отдел">
        <Select value={value.department} onValueChange={(v) => onChange({ ...value, department: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label="Миссия"><Textarea rows={2} value={value.mission} onChange={(e) => onChange({ ...value, mission: e.target.value })} /></Field>
      <Field label="Обязанности (через запятую)"><Input value={value.responsibilities} onChange={(e) => onChange({ ...value, responsibilities: e.target.value })} /></Field>
      <Field label="Навыки (через запятую)"><Input value={value.skills} onChange={(e) => onChange({ ...value, skills: e.target.value })} /></Field>
      <Field label="KPI (через запятую)"><Input value={value.kpi} onChange={(e) => onChange({ ...value, kpi: e.target.value })} /></Field>
      <Field label="Карьерный трек (через запятую)"><Input value={value.careerTrack} onChange={(e) => onChange({ ...value, careerTrack: e.target.value })} /></Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

/* ---------- Tasks (KPI) admin ---------- */
function TasksPanel() {
  const { users, updateUser } = useApp();
  const [uid, setUid] = useState<string>(users[0]?.id ?? "");
  const user = users.find((u) => u.id === uid);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);

  const setKpi = (kpi: { title: string; progress: number }[]) => {
    if (!user) return;
    updateUser(user.id, { kpi });
  };

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Выберите сотрудника</CardTitle></CardHeader>
        <CardContent>
          <Select value={uid} onValueChange={setUid}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} — {u.position}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-brand" /> Задачи / KPI {user && <span className="text-sm text-muted-foreground font-normal">— {user.name}</span>}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {!user && <p className="text-sm text-muted-foreground">Сначала выберите сотрудника</p>}
          {user && (
            <>
              <div className="space-y-4">
                {user.kpi.length === 0 && <p className="text-sm text-muted-foreground">Задач пока нет</p>}
                {user.kpi.map((k, i) => (
                  <div key={i} className="grid grid-cols-[1fr_120px_80px_auto] gap-2 items-center">
                    <Input
                      value={k.title}
                      onChange={(e) => setKpi(user.kpi.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                    />
                    <Input
                      type="number" min={0} max={100}
                      value={k.progress}
                      onChange={(e) => setKpi(user.kpi.map((x, j) => j === i ? { ...x, progress: Math.max(0, Math.min(100, +e.target.value)) } : x))}
                    />
                    <Progress value={k.progress} className="h-2" />
                    <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => setKpi(user.kpi.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 grid grid-cols-[1fr_120px_auto] gap-2 items-end">
                <Field label="Новая задача"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Релиз v3.3" /></Field>
                <Field label="Прогресс %"><Input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(+e.target.value)} /></Field>
                <Button onClick={() => {
                  if (!title.trim()) return toast.error("Введите название задачи");
                  setKpi([...user.kpi, { title: title.trim(), progress: Math.max(0, Math.min(100, progress)) }]);
                  setTitle(""); setProgress(0);
                  toast.success("Задача добавлена");
                }}>
                  <Plus className="h-4 w-4 mr-1" /> Добавить
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Useful Links admin ---------- */
function LinksAdmin() {
  const { links, addLink, updateLink, deleteLink } = useApp();
  const empty = { title: "", url: "", description: "", category: "Сервисы" };
  const [n, setN] = useState(empty);
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-brand" /> Полезные ссылки ({links.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Добавить</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новая ссылка</DialogTitle></DialogHeader>
            <LinkForm value={n} onChange={setN} />
            <Button className="w-full" onClick={() => {
              if (!n.title.trim() || !n.url.trim()) return toast.error("Название и URL обязательны");
              addLink(n);
              toast.success("Ссылка добавлена");
              setN(empty); setOpen(false);
            }}>Создать</Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {links.map((l) => (
            <LinkRow key={l.id} link={l}
              onSave={(patch) => { updateLink(l.id, patch); toast.success("Сохранено"); }}
              onDelete={() => { if (confirm(`Удалить «${l.title}»?`)) { deleteLink(l.id); toast.success("Удалено"); } }} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function LinkRow({ link, onSave, onDelete }: { link: UsefulLink; onSave: (p: Partial<UsefulLink>) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState({ title: link.title, url: link.url, description: link.description ?? "", category: link.category ?? "Сервисы" });
  return (
    <li className="flex items-center gap-3 border rounded-lg p-3">
      <div className="h-9 w-9 rounded-lg bg-accent text-brand grid place-items-center shrink-0"><ExternalLink className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate">{link.title}</div>
        <div className="text-xs text-muted-foreground truncate">{link.url}</div>
      </div>
      {link.category && <Badge variant="secondary" className="hidden sm:inline-flex">{link.category}</Badge>}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setD({ title: link.title, url: link.url, description: link.description ?? "", category: link.category ?? "Сервисы" }); }}>
        <DialogTrigger asChild><Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Редактировать ссылку</DialogTitle></DialogHeader>
          <LinkForm value={d} onChange={setD} />
          <Button className="w-full" onClick={() => { onSave(d); setOpen(false); }}>Сохранить</Button>
        </DialogContent>
      </Dialog>
      <Button size="sm" variant="ghost" className="text-rose-600" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
    </li>
  );
}

function LinkForm({ value, onChange }: { value: { title: string; url: string; description: string; category: string }; onChange: (v: typeof value) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Название"><Input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} /></Field>
      <Field label="URL"><Input value={value.url} onChange={(e) => onChange({ ...value, url: e.target.value })} placeholder="https://..." /></Field>
      <Field label="Описание"><Input value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} /></Field>
      <Field label="Категория"><Input value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })} /></Field>
    </div>
  );
}


/* ---------- Departments ---------- */
function DepartmentsPanel() {
  const { departments, users, addDepartment, renameDepartment, deleteDepartment } = useApp();
  const [n, setN] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-brand" /> Отделы ({departments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={n} onChange={(e) => setN(e.target.value)} placeholder="Название нового отдела" />
          <Button onClick={() => { if (!n.trim()) return; addDepartment(n); setN(""); toast.success("Отдел добавлен"); }}><Plus className="h-4 w-4 mr-1" />Добавить</Button>
        </div>
        <ul className="space-y-2">
          {departments.map((d) => {
            const count = users.filter((u) => u.department === d).length;
            return <DeptRow key={d} name={d} count={count} onRename={(nn) => { renameDepartment(d, nn); toast.success("Отдел переименован"); }} onDelete={() => { if (count > 0) return toast.error(`Сначала переведите ${count} сотр.`); deleteDepartment(d); toast.success("Удалено"); }} />;
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function DeptRow({ name, count, onRename, onDelete }: { name: string; count: number; onRename: (n: string) => void; onDelete: () => void }) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(name);
  return (
    <li className="flex items-center gap-3 border rounded-lg p-3">
      {edit ? (
        <>
          <Input value={v} onChange={(e) => setV(e.target.value)} className="flex-1" />
          <Button size="sm" onClick={() => { if (v.trim()) { onRename(v.trim()); setEdit(false); } }}>OK</Button>
          <Button size="sm" variant="ghost" onClick={() => { setV(name); setEdit(false); }}>Отмена</Button>
        </>
      ) : (
        <>
          <div className="flex-1 font-medium">{name}</div>
          <Badge variant="secondary">{count} сотр.</Badge>
          <Button size="sm" variant="ghost" onClick={() => setEdit(true)}><Pencil className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" className="text-rose-600" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </>
      )}
    </li>
  );
}

/* ---------- Birthdays edit ---------- */
function BirthdaysPanel() {
  const { users, updateUser } = useApp();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Cake className="h-5 w-5 text-coin" /> Дни рождения сотрудников</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 border rounded-lg p-3">
              <img src={u.avatar} className="h-9 w-9 rounded-full object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{u.name}</div>
                <div className="text-xs text-muted-foreground truncate">{u.position}</div>
              </div>
              <Input
                type="date"
                className="w-44"
                value={u.birthday ?? ""}
                onChange={(e) => { updateUser(u.id, { birthday: e.target.value || undefined }); }}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ---------- Bonus Rules ---------- */
function BonusRulesPanel() {
  const { bonusRules, addBonusRule, updateBonusRule, deleteBonusRule } = useApp();
  const empty = { title: "", amount: 100, description: "" };
  const [n, setN] = useState(empty);
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-coin" /> Как заработать бонусы ({bonusRules.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Добавить</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новое правило</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Field label="Название"><Input value={n.title} onChange={(e) => setN({ ...n, title: e.target.value })} /></Field>
              <Field label="Сумма бонусов"><Input type="number" value={n.amount} onChange={(e) => setN({ ...n, amount: +e.target.value })} /></Field>
              <Field label="Описание"><Textarea rows={3} value={n.description} onChange={(e) => setN({ ...n, description: e.target.value })} /></Field>
              <Button className="w-full" onClick={() => { if (!n.title.trim()) return toast.error("Название обязательно"); addBonusRule(n); setN(empty); setOpen(false); toast.success("Добавлено"); }}>Создать</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {bonusRules.map((b) => (
            <BonusRuleRow key={b.id} rule={b} onSave={(p) => { updateBonusRule(b.id, p); toast.success("Сохранено"); }} onDelete={() => { if (confirm(`Удалить «${b.title}»?`)) { deleteBonusRule(b.id); toast.success("Удалено"); } }} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function BonusRuleRow({ rule, onSave, onDelete }: { rule: BonusRule; onSave: (p: Partial<BonusRule>) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState({ title: rule.title, amount: rule.amount, description: rule.description });
  return (
    <li className="flex items-start gap-3 border rounded-lg p-3">
      <div className="flex items-center gap-1 text-coin font-bold shrink-0"><Coins className="h-4 w-4" />+{rule.amount}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{rule.title}</div>
        <div className="text-xs text-muted-foreground">{rule.description}</div>
      </div>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setD({ title: rule.title, amount: rule.amount, description: rule.description }); }}>
        <DialogTrigger asChild><Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Редактировать правило</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Название"><Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></Field>
            <Field label="Сумма"><Input type="number" value={d.amount} onChange={(e) => setD({ ...d, amount: +e.target.value })} /></Field>
            <Field label="Описание"><Textarea rows={3} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} /></Field>
            <Button className="w-full" onClick={() => { onSave(d); setOpen(false); }}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button size="sm" variant="ghost" className="text-rose-600" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
    </li>
  );
}

/* ---------- Polls ---------- */
function PollsAdmin() {
  const { polls, addPoll, updatePoll, deletePoll, users } = useApp();
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [opts, setOpts] = useState<string[]>(["", ""]);

  const submit = () => {
    if (!question.trim()) return toast.error("Введите вопрос");
    const cleaned = opts.map((o) => o.trim()).filter(Boolean);
    if (cleaned.length < 2) return toast.error("Минимум 2 варианта ответа");
    addPoll({ question: question.trim(), description: description.trim() || undefined, options: cleaned });
    setQuestion(""); setDescription(""); setOpts(["", ""]);
    toast.success("Опрос создан");
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-brand" /> Опросы и результаты</CardTitle></CardHeader>
        <CardContent>
          {polls.length === 0 && <p className="text-sm text-muted-foreground">Опросов пока нет</p>}
          <ul className="space-y-4">
            {polls.map((p) => {
              const total = p.options.reduce((s, o) => s + o.votes.length, 0);
              return (
                <li key={p.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{p.question}</div>
                      {p.description && <div className="text-xs text-muted-foreground">{p.description}</div>}
                      <div className="text-xs text-muted-foreground mt-1">Создан: {p.createdAt} · Всего голосов: {total}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => { updatePoll(p.id, { closed: !p.closed }); toast.success(p.closed ? "Опрос открыт" : "Опрос закрыт"); }}>
                        {p.closed ? "Открыть" : "Закрыть"}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => { if (confirm("Удалить опрос?")) { deletePoll(p.id); toast.success("Удалено"); } }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {p.options.map((o) => {
                      const pct = total ? Math.round((o.votes.length / total) * 100) : 0;
                      const voters = o.votes.map((v) => users.find((u) => u.id === v)?.name).filter(Boolean).join(", ");
                      return (
                        <li key={o.id} className="text-sm">
                          <div className="flex justify-between mb-1"><span>{o.text}</span><span className="text-muted-foreground">{o.votes.length} · {pct}%</span></div>
                          <Progress value={pct} className="h-1.5" />
                          {voters && <div className="text-[11px] text-muted-foreground mt-1">Проголосовали: {voters}</div>}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-brand" /> Новый опрос</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Field label="Вопрос"><Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Например, куда поедем на тимбилдинг?" /></Field>
          <Field label="Описание (необязательно)"><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
          <div>
            <Label className="text-sm mb-1.5 block">Варианты ответа</Label>
            <div className="space-y-2">
              {opts.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={o} onChange={(e) => setOpts(opts.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Вариант ${i + 1}`} />
                  {opts.length > 2 && (
                    <Button size="icon" variant="ghost" onClick={() => setOpts(opts.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>
                  )}
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => setOpts([...opts, ""])}>
              <Plus className="h-4 w-4 mr-1" /> Добавить вариант
            </Button>
          </div>
          <Button className="w-full" onClick={submit}>Создать опрос</Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Data export/import ---------- */
function DataPanel() {
  const app = useApp();
  const { exportData, importData, resetData, users, products, jobs, announcements } = app;
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const download = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elecard-space-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Резервная копия скачана");
  };

  const onFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => {
      const res = importData(String(r.result));
      if (res.ok) toast.success(res.message); else toast.error(res.message);
    };
    r.readAsText(f);
  };

  const applyText = () => {
    const res = importData(text);
    if (res.ok) { toast.success(res.message); setText(""); } else toast.error(res.message);
  };

  const pushSnap = async () => {
    setBusy("snapshot");
    try {
      const { pushSnapshot } = await import("@/lib/cloudSync");
      await pushSnapshot(exportData(), `manual @ ${new Date().toLocaleString("ru-RU")}`);
      toast.success("Снапшот сохранён в облачной БД");
    } catch (e) { toast.error("Ошибка: " + (e as Error).message); }
    finally { setBusy(null); }
  };

  const pullSnap = async () => {
    setBusy("pull");
    try {
      const { fetchLatestSnapshot } = await import("@/lib/cloudSync");
      const snap = await fetchLatestSnapshot();
      if (!snap) { toast.info("В облачной БД пока нет снапшотов"); return; }
      const res = importData(snap);
      if (res.ok) toast.success("Данные загружены из облака"); else toast.error(res.message);
    } catch (e) { toast.error("Ошибка: " + (e as Error).message); }
    finally { setBusy(null); }
  };

  const syncTables = async () => {
    setBusy("tables");
    try {
      const { syncNormalizedTables } = await import("@/lib/cloudSync");
      const r = await syncNormalizedTables({ users, products, jobs, announcements });
      toast.success(`Синхронизировано: ${r.employees} сотр., ${r.products} тов., ${r.transactions} тр., ${r.announcements} нов., ${r.positions} должн.`);
    } catch (e) { toast.error("Ошибка: " + (e as Error).message); }
    finally { setBusy(null); }
  };

  const syncIncr = async () => {
    setBusy("incr");
    try {
      const { syncIncremental } = await import("@/lib/cloudSync");
      const r = await syncIncremental({ users, products, jobs, announcements });
      if (r.totalChanges === 0) toast.info("Изменений с прошлой синхронизации нет");
      else toast.success(
        `Изменений: ${r.totalChanges} · сотр. +${r.employees.upserted}/-${r.employees.deleted}, тов. +${r.products.upserted}/-${r.products.deleted}, тр. +${r.transactions.upserted}/-${r.transactions.deleted}, нов. +${r.announcements.upserted}/-${r.announcements.deleted}, должн. +${r.positions.upserted}/-${r.positions.deleted}`,
      );
    } catch (e) { toast.error("Ошибка: " + (e as Error).message); }
    finally { setBusy(null); }
  };

  const resetIncr = async () => {
    const { resetIncrementalState } = await import("@/lib/cloudSync");
    resetIncrementalState();
    toast.success("Состояние инкрементальной синхронизации сброшено — следующая синхронизация выгрузит все записи");
  };

  const downloadFile = (name: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSchemaSql = async () => {
    const { SCHEMA_SQL } = await import("@/lib/cloudSync");
    downloadFile(`elecard-schema-${new Date().toISOString().slice(0, 10)}.sql`, SCHEMA_SQL, "application/sql");
    toast.success("Схема таблиц (SQL) скачана");
  };

  const downloadSchemaJson = async () => {
    const { SCHEMA_JSON } = await import("@/lib/cloudSync");
    downloadFile(`elecard-schema-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(SCHEMA_JSON, null, 2), "application/json");
    toast.success("Схема таблиц (JSON) скачана");
  };


  const restUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Скопировано"); };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-brand" /> Локальная резервная копия</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Все изменения автосохраняются в браузере. Для переноса скачайте JSON или используйте
            облачную базу ниже.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={download}><Download className="h-4 w-4 mr-2" /> Скачать JSON</Button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> Загрузить JSON</Button>
            <Button variant="ghost" className="text-rose-600" onClick={() => { if (confirm("Сбросить все данные к демо-значениям?")) resetData(); }}>
              <RefreshCw className="h-4 w-4 mr-2" /> Сброс
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-brand/40">
        <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-brand" /> Облачная база данных</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Портал подключён к облачной БД. Сохраняйте состояние целиком (снапшот) или
            выгружайте в нормализованные таблицы для сторонних сервисов (BI, HRIS, дашборды).
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={pushSnap} disabled={!!busy}>
              <Upload className="h-4 w-4 mr-2" /> {busy === "snapshot" ? "Сохраняю…" : "Отправить снапшот"}
            </Button>
            <Button variant="outline" onClick={pullSnap} disabled={!!busy}>
              <Download className="h-4 w-4 mr-2" /> {busy === "pull" ? "Загружаю…" : "Загрузить из облака"}
            </Button>
            <Button variant="secondary" onClick={syncTables} disabled={!!busy}>
              <RefreshCw className="h-4 w-4 mr-2" /> {busy === "tables" ? "Синхронизирую…" : "Полная синхронизация"}
            </Button>
            <Button variant="default" className="bg-brand hover:bg-brand/90" onClick={syncIncr} disabled={!!busy}>
              <RefreshCw className="h-4 w-4 mr-2" /> {busy === "incr" ? "Синхронизирую…" : "Инкрементальная синхронизация"}
            </Button>
            <Button variant="ghost" size="sm" onClick={resetIncr} disabled={!!busy}>
              Сбросить состояние
            </Button>
          </div>
          <div className="border-t pt-3">
            <div className="text-sm font-semibold mb-2">Экспорт схемы таблиц</div>
            <p className="text-xs text-muted-foreground mb-2">
              Готовые DDL-скрипты для быстрого разворачивания копии базы в стороннем хранилище.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={downloadSchemaSql}>
                <Download className="h-4 w-4 mr-2" /> Скачать SQL (DDL)
              </Button>
              <Button size="sm" variant="outline" onClick={downloadSchemaJson}>
                <Download className="h-4 w-4 mr-2" /> Скачать JSON-схему
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-2">
            <div className="font-semibold">Интеграция со сторонними сервисами</div>
            <p className="text-muted-foreground">REST API endpoint:</p>
            <div className="flex gap-2 items-center">
              <code className="flex-1 truncate bg-background px-2 py-1 rounded border text-[11px]">{restUrl}/rest/v1/employees</code>
              <Button size="sm" variant="ghost" onClick={() => copy(`${restUrl}/rest/v1/employees`)}>Copy</Button>
            </div>
            <p className="text-muted-foreground pt-1">Публичный ключ (заголовок <code>apikey</code>):</p>
            <div className="flex gap-2 items-center">
              <code className="flex-1 truncate bg-background px-2 py-1 rounded border text-[11px]">{apiKey?.slice(0, 40)}…</code>
              <Button size="sm" variant="ghost" onClick={() => copy(apiKey)}>Copy</Button>
            </div>
            <div className="pt-2 font-semibold">Таблицы:</div>
            <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
              <li><code>employees</code> — сотрудники и баланс</li>
              <li><code>products</code> — товары магазина</li>
              <li><code>transactions</code> — история бонусов</li>
              <li><code>announcements</code> — новости</li>
              <li><code>positions</code> — карта должностей</li>
              <li><code>app_snapshots</code> — полные JSON-снимки</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Импорт JSON напрямую</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder='{"users": [...], "products": [...]}' className="font-mono text-xs" />
          <Button className="w-full" onClick={applyText} disabled={!text.trim()}>Применить</Button>
        </CardContent>
      </Card>
    </div>
  );
}
