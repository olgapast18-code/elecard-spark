import { supabase } from "@/integrations/supabase/client";
import type { User, Product, Job, Announcement } from "@/context/AppContext";

export type SyncPayload = {
  users: User[];
  products: Product[];
  jobs: Job[];
  announcements: Announcement[];
};

// Push a full JSON snapshot of the app state to the `app_snapshots` table.
// This is the simplest integration point: any external service can read the
// latest row via the Supabase Data API and reconstruct portal state.
export async function pushSnapshot(json: string, note?: string) {
  const data = JSON.parse(json);
  const { error } = await supabase.from("app_snapshots").insert({ data, note: note ?? null });
  if (error) throw error;
}

export async function fetchLatestSnapshot(): Promise<string | null> {
  const { data, error } = await supabase
    .from("app_snapshots")
    .select("data,created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? JSON.stringify(data.data) : null;
}

// Sync normalized tables so third-party BI / HR systems can query them directly.
export async function syncNormalizedTables(p: SyncPayload) {
  const employees = p.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    position: u.position,
    telegram: u.telegram ?? null,
    start_date: u.startDate || null,
    birthday: u.birthday || null,
    avatar: u.avatar,
    balance: u.balance,
    bio: u.bio ?? null,
    responsibilities: u.responsibilities ?? [],
    manager_id: u.managerId ?? null,
    updated_at: new Date().toISOString(),
  }));

  const products = p.products.map((x) => ({
    id: x.id,
    name: x.name,
    description: x.description,
    price: x.price,
    category: x.category,
    image: x.image,
    updated_at: new Date().toISOString(),
  }));

  const transactions = p.users.flatMap((u) =>
    u.transactions.map((t) => ({
      id: `${u.id}:${t.id}`,
      user_id: u.id,
      type: t.type,
      amount: t.amount,
      reason: t.reason,
      from_user: t.from ?? null,
      occurred_at: t.date,
    })),
  );

  const announcements = p.announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    image: a.image ?? null,
    published_at: a.date,
  }));

  const positions = p.jobs.map((j) => ({
    id: j.id,
    title: j.title,
    department: j.department,
    mission: j.mission,
    responsibilities: j.responsibilities,
    skills: j.skills,
    kpi: j.kpi,
    career_track: j.careerTrack,
    updated_at: new Date().toISOString(),
  }));

  const results = await Promise.all([
    supabase.from("employees").upsert(employees),
    supabase.from("products").upsert(products),
    supabase.from("transactions").upsert(transactions),
    supabase.from("announcements").upsert(announcements),
    supabase.from("positions").upsert(positions),
  ]);
  const errors = results.map((r) => r.error).filter(Boolean);
  if (errors.length) throw new Error(errors.map((e) => e!.message).join("; "));
  return {
    employees: employees.length,
    products: products.length,
    transactions: transactions.length,
    announcements: announcements.length,
    positions: positions.length,
  };
}
