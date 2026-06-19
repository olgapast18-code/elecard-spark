import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp, DEPARTMENTS, type Product } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShieldCheck, Coins, UserPlus, Pencil, PackagePlus, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, users, products, jobs, grantBonus, addUser, updateUser, addJob, addProduct, updateProduct } = useApp();
  const navigate = useNavigate();

  useEffect(() => { if (!isAdmin) navigate({ to: "/dashboard" }); }, [isAdmin, navigate]);
  if (!isAdmin) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-brand" /> Админ-панель
        </h1>
        <p className="text-muted-foreground text-sm">Управление сотрудниками, бонусами, должностями и магазином</p>
      </header>

      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Сотрудники</TabsTrigger>
          <TabsTrigger value="grant">Начисление бонусов</TabsTrigger>
          <TabsTrigger value="shop">Магазин</TabsTrigger>
          <TabsTrigger value="jobs">Должности</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4 pt-4">
          <EmployeesPanel users={users} updateUser={updateUser} addUser={addUser} />
        </TabsContent>

        <TabsContent value="grant" className="pt-4">
          <GrantPanel users={users.filter((u) => u.role !== "admin")} onGrant={(uid, amt, reason) => {
            grantBonus(uid, amt, reason);
            const u = users.find((x) => x.id === uid);
            toast.success(`Начислено ${amt} бонусов`, { description: `${u?.name} · ${reason}` });
          }} />
        </TabsContent>

        <TabsContent value="shop" className="pt-4">
          <ShopAdmin products={products} updateProduct={updateProduct} addProduct={addProduct} />
        </TabsContent>

        <TabsContent value="jobs" className="pt-4">
          <JobsAdmin jobs={jobs} addJob={addJob} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- Employees ---------- */
function EmployeesPanel({ users, updateUser, addUser }: { users: ReturnType<typeof useApp>["users"]; updateUser: ReturnType<typeof useApp>["updateUser"]; addUser: ReturnType<typeof useApp>["addUser"] }) {
  const [newU, setNewU] = useState({ name: "", email: "", password: "", department: DEPARTMENTS[0], position: "", balance: 100 });
  const [open, setOpen] = useState(false);

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
                setNewU({ name: "", email: "", password: "", department: DEPARTMENTS[0], position: "", balance: 100 });
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
                <EmployeeRow key={u.id} user={u} onSave={(patch) => { updateUser(u.id, patch); toast.success("Сохранено"); }} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function EmployeeRow({ user, onSave }: { user: ReturnType<typeof useApp>["users"][number]; onSave: (p: Partial<ReturnType<typeof useApp>["users"][number]>) => void }) {
  const { users } = useApp();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: user.name,
    position: user.position,
    department: user.department,
    balance: user.balance,
    bio: user.bio ?? "",
    responsibilities: (user.responsibilities ?? []).join(", "),
    managerId: user.managerId ?? "",
  });
  const managers = users.filter((u) => u.id !== user.id);
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-4 flex items-center gap-3"><img src={user.avatar} className="h-8 w-8 rounded-full" alt="" />{user.name}</td>
      <td className="pr-4"><Badge variant="secondary">{user.department}</Badge></td>
      <td className="pr-4">{user.position}</td>
      <td className="pr-4 font-semibold flex items-center gap-1"><Coins className="h-4 w-4 text-coin" />{user.balance}</td>
      <td>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft({ name: user.name, position: user.position, department: user.department, balance: user.balance, bio: user.bio ?? "", responsibilities: (user.responsibilities ?? []).join(", "), managerId: user.managerId ?? "" }); }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Редактировать сотрудника</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
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
              <Field label="Баланс"><Input type="number" value={draft.balance} onChange={(e) => setDraft({ ...draft, balance: +e.target.value })} /></Field>
              <Button className="w-full" onClick={() => {
                onSave({
                  name: draft.name,
                  position: draft.position,
                  department: draft.department,
                  balance: draft.balance,
                  bio: draft.bio,
                  responsibilities: draft.responsibilities.split(",").map((s) => s.trim()).filter(Boolean),
                  managerId: draft.managerId || null,
                });
                setOpen(false);
              }}>Сохранить</Button>
            </div>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}

/* ---------- Grant ---------- */
function GrantPanel({ users, onGrant }: { users: ReturnType<typeof useApp>["users"]; onGrant: (uid: string, amt: number, reason: string) => void }) {
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
          <Field label="Сумма">
            <Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} />
          </Field>
          <Field label="Причина">
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
          </Field>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button key={p} onClick={() => setReason(p)} className="text-xs rounded-full border bg-card hover:bg-accent px-3 py-1">
                {p}
              </button>
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
                <img src={u.avatar} className="h-9 w-9 rounded-full" alt="" />
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
function ShopAdmin({ products, updateProduct, addProduct }: { products: Product[]; updateProduct: (id: string, p: Partial<Product>) => void; addProduct: (p: Omit<Product, "id">) => void }) {
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
          {products.map((p) => <ProductAdminCard key={p.id} product={p} onSave={(patch) => { updateProduct(p.id, patch); toast.success("Сохранено"); }} />)}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductAdminCard({ product, onSave }: { product: Product; onSave: (p: Partial<Product>) => void }) {
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
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setD({ name: product.name, description: product.description, price: product.price, category: product.category, image: product.image }); }}>
            <DialogTrigger asChild><Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Редактировать товар</DialogTitle></DialogHeader>
              <ProductForm value={d} onChange={setD} />
              <Button className="w-full" onClick={() => { onSave(d); setOpen(false); }}>Сохранить</Button>
            </DialogContent>
          </Dialog>
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
function JobsAdmin({ jobs, addJob }: { jobs: ReturnType<typeof useApp>["jobs"]; addJob: ReturnType<typeof useApp>["addJob"] }) {
  const [open, setOpen] = useState(false);
  const [j, setJ] = useState({ title: "", department: DEPARTMENTS[0], mission: "", responsibilities: "", skills: "", kpi: "", careerTrack: "" });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Должности ({jobs.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><PackagePlus className="h-4 w-4 mr-2" />Новая должность</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Новая должность</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Field label="Название"><Input value={j.title} onChange={(e) => setJ({ ...j, title: e.target.value })} /></Field>
              <Field label="Отдел">
                <Select value={j.department} onValueChange={(v) => setJ({ ...j, department: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Миссия"><Textarea rows={2} value={j.mission} onChange={(e) => setJ({ ...j, mission: e.target.value })} /></Field>
              <Field label="Обязанности (через запятую)"><Input value={j.responsibilities} onChange={(e) => setJ({ ...j, responsibilities: e.target.value })} /></Field>
              <Field label="Навыки (через запятую)"><Input value={j.skills} onChange={(e) => setJ({ ...j, skills: e.target.value })} /></Field>
              <Field label="KPI (через запятую)"><Input value={j.kpi} onChange={(e) => setJ({ ...j, kpi: e.target.value })} /></Field>
              <Field label="Карьерный трек (через запятую)"><Input value={j.careerTrack} onChange={(e) => setJ({ ...j, careerTrack: e.target.value })} /></Field>
              <Button className="w-full" onClick={() => {
                if (!j.title) return toast.error("Название обязательно");
                const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
                addJob({
                  title: j.title, department: j.department, mission: j.mission,
                  responsibilities: split(j.responsibilities),
                  skills: split(j.skills),
                  kpi: split(j.kpi),
                  careerTrack: split(j.careerTrack),
                });
                toast.success("Должность создана");
                setOpen(false);
                setJ({ title: "", department: DEPARTMENTS[0], mission: "", responsibilities: "", skills: "", kpi: "", careerTrack: "" });
              }}>Создать</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((it) => (
            <div key={it.id} className="rounded-xl border bg-card p-4">
              <Badge variant="secondary">{it.department}</Badge>
              <div className="font-semibold mt-2">{it.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-3 mt-1">{it.mission}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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
