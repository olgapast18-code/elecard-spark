import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useApp, DEPARTMENTS } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, Save, UserCircle, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({ component: ProfilePage });

function ProfilePage() {
  const { currentUser, updateUser, departments } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const deptList = departments.length ? departments : DEPARTMENTS;
  const [preview, setPreview] = useState(false);

  const [draft, setDraft] = useState(() => ({
    name: currentUser?.name ?? "",
    position: currentUser?.position ?? "",
    department: currentUser?.department ?? deptList[0],
    email: currentUser?.email ?? "",
    telegram: currentUser?.telegram ?? "",
    bio: currentUser?.bio ?? "",
    responsibilities: (currentUser?.responsibilities ?? []).join(", "),
    avatar: currentUser?.avatar ?? "",
    startDate: currentUser?.startDate ?? "",
    birthday: currentUser?.birthday ?? "",
    notifyEmail: currentUser?.notifyEmail ?? false,
  }));

  if (!currentUser) return null;

  const onFile = (f: File) => {
    if (f.size > 4 * 1024 * 1024) return toast.error("Файл больше 4МБ");
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, avatar: String(r.result) }));
    r.readAsDataURL(f);
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <UserCircle className="h-7 w-7 text-brand" /> Моя карточка
        </h1>
        <p className="text-muted-foreground text-sm">Обновите фото и информацию о себе</p>
      </header>

      <Card>
        <CardHeader><CardTitle>Профиль</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-5 flex-wrap">
            <button type="button" onClick={() => setPreview(true)} className="shrink-0">
              <img src={draft.avatar} className="h-24 w-24 rounded-full ring-4 ring-accent object-cover hover:opacity-90 transition" alt="" />
            </button>
            <div className="space-y-2">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  <Camera className="h-4 w-4 mr-2" /> Загрузить фото
                </Button>
                <Button variant="ghost" onClick={() => setPreview(true)}>Просмотр</Button>
              </div>
              <p className="text-xs text-muted-foreground">PNG / JPG, до 4МБ</p>
            </div>
          </div>

          <Dialog open={preview} onOpenChange={setPreview}>
            <DialogContent className="max-w-md p-2">
              <img src={draft.avatar} alt="" className="w-full rounded-lg" />
            </DialogContent>
          </Dialog>

          <div className="grid sm:grid-cols-2 gap-4">
            <Row label="ФИО"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Row>
            <Row label="Должность"><Input value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })} /></Row>
            <Row label="Отдел">
              <Select value={draft.department} onValueChange={(v) => setDraft({ ...draft, department: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{deptList.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </Row>
            <Row label="Email"><Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Row>
            <Row label="Telegram"><Input value={draft.telegram} onChange={(e) => setDraft({ ...draft, telegram: e.target.value })} /></Row>
            <Row label="Дата начала работы"><Input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} /></Row>
            <Row label="День рождения"><Input type="date" value={draft.birthday} onChange={(e) => setDraft({ ...draft, birthday: e.target.value })} /></Row>
          </div>

          <Row label="О себе">
            <Textarea rows={3} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
          </Row>
          <Row label="Обязанности (через запятую)">
            <Textarea rows={2} value={draft.responsibilities} onChange={(e) => setDraft({ ...draft, responsibilities: e.target.value })} />
          </Row>

          <div className="flex items-start gap-3 rounded-lg border p-3 bg-muted/30">
            <Bell className="h-5 w-5 text-brand mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium">Email-уведомления</div>
              <div className="text-xs text-muted-foreground">Получать письма о новых сообщениях и событиях на {draft.email}</div>
            </div>
            <Switch checked={draft.notifyEmail} onCheckedChange={(v) => setDraft({ ...draft, notifyEmail: v })} />
          </div>

          <Button
            onClick={() => {
              if (!draft.name.trim()) return toast.error("ФИО обязательно");
              updateUser(currentUser.id, {
                name: draft.name.trim(),
                position: draft.position.trim(),
                department: draft.department,
                email: draft.email.trim(),
                telegram: draft.telegram.trim() || undefined,
                bio: draft.bio,
                responsibilities: draft.responsibilities.split(",").map((s) => s.trim()).filter(Boolean),
                avatar: draft.avatar,
                startDate: draft.startDate,
                birthday: draft.birthday || undefined,
                notifyEmail: draft.notifyEmail,
              });
              toast.success("Профиль обновлён");
            }}
          >
            <Save className="h-4 w-4 mr-2" /> Сохранить
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

