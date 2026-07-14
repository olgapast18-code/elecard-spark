import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp, DEPARTMENTS } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import elecardLogo from "@/assets/elecard-logo.jpg.asset.json";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { login, register } = useApp();
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "", department: DEPARTMENTS[0], position: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = login(loginEmail, loginPass);
    if (!u) return toast.error("Неверные email или пароль");
    toast.success(`Добро пожаловать, ${u.name}!`);
    navigate({ to: "/home" });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.position) return toast.error("Заполните все поля");
    const u = register(form);
    toast.success(`Аккаунт создан. +100 ElecardBonus 🎉`);
    void u;
    navigate({ to: "/home" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/40 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block space-y-6 pr-6">
          <div className="flex items-center gap-3">
            <div className="h-14 w-24 rounded-xl bg-white grid place-items-center shadow-lg p-2">
              <img src={elecardLogo.url} alt="Elecard" className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">ElecardSpace</div>
              <div className="text-sm text-muted-foreground">Корпоративный портал сотрудников</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Один портал для всей команды
          </h1>
          <p className="text-muted-foreground">
            Профиль, бонусы за достижения, магазин мерча и обучения, карта должностей — всё в одном месте.
          </p>
        </div>

        <Card className="shadow-xl border-border/60">
          <CardContent className="p-6">
            <Tabs defaultValue="login">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="signup">Регистрация</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 pt-4">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <Label>Email</Label>
                    <Input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@elecard.ru" />
                  </div>
                  <div>
                    <Label>Пароль</Label>
                    <Input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="••••••" />
                  </div>
                  <Button type="submit" className="w-full">Войти</Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-3 pt-4">
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <Label>ФИО</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Иван Иванов" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ivan@elecard.ru" />
                  </div>
                  <div>
                    <Label>Пароль</Label>
                    <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Отдел</Label>
                      <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Должность</Label>
                      <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Designer" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Создать аккаунт</Button>
                  <p className="text-xs text-muted-foreground text-center">При регистрации вы получите 100 ElecardBonus</p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
