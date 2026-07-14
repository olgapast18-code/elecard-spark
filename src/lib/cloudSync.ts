import { supabase } from "@/integrations/supabase/client";
import type { User, Product, Job, Announcement } from "@/context/AppContext";

export type SyncPayload = {
  users: User[];
  products: Product[];
  jobs: Job[];
  announcements: Announcement[];
};

// Push a full JSON snapshot of the app state to the `app_snapshots` table.
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

// ---------- Row builders ----------
function buildEmployeeRows(users: User[]) {
  return users.map((u) => ({
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
}

function buildProductRows(products: Product[]) {
  return products.map((x) => ({
    id: x.id,
    name: x.name,
    description: x.description,
    price: x.price,
    category: x.category,
    image: x.image,
    updated_at: new Date().toISOString(),
  }));
}

function buildTransactionRows(users: User[]) {
  return users.flatMap((u) =>
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
}

function buildAnnouncementRows(items: Announcement[]) {
  return items.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    image: a.image ?? null,
    published_at: a.date,
  }));
}

function buildPositionRows(jobs: Job[]) {
  return jobs.map((j) => ({
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
}

// Sync ALL normalized tables (full upsert).
export async function syncNormalizedTables(p: SyncPayload) {
  const employees = buildEmployeeRows(p.users);
  const products = buildProductRows(p.products);
  const transactions = buildTransactionRows(p.users);
  const announcements = buildAnnouncementRows(p.announcements);
  const positions = buildPositionRows(p.jobs);

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

// ---------- Incremental sync ----------
// Uses per-row content hashes stored in localStorage. Only rows whose payload
// differs from the previous sync (new or changed) are pushed. Rows that were
// present before and are now missing are deleted on the server.

const HASH_STORE_KEY = "elecard_incremental_sync_v1";

type HashMap = Record<string, Record<string, string>>; // table -> id -> hash

function loadHashes(): HashMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HASH_STORE_KEY);
    return raw ? (JSON.parse(raw) as HashMap) : {};
  } catch {
    return {};
  }
}

function saveHashes(h: HashMap) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(HASH_STORE_KEY, JSON.stringify(h)); } catch { /* ignore */ }
}

// Fast, deterministic non-crypto hash (FNV-1a 32-bit hex).
function hashRow(row: unknown): string {
  const s = JSON.stringify(row);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16);
}

type Diff<T extends { id: string }> = { upserts: T[]; deletes: string[]; nextHashes: Record<string, string> };

function diffTable<T extends { id: string }>(table: string, rows: T[], prev: HashMap): Diff<T> {
  const prevMap = prev[table] ?? {};
  const nextHashes: Record<string, string> = {};
  const upserts: T[] = [];
  // Build content hashes excluding volatile fields (updated_at) so a re-sync
  // without changes is a no-op.
  for (const row of rows) {
    const { updated_at: _u, ...stable } = row as T & { updated_at?: string };
    const h = hashRow(stable);
    nextHashes[row.id] = h;
    if (prevMap[row.id] !== h) upserts.push(row);
  }
  const currentIds = new Set(rows.map((r) => r.id));
  const deletes = Object.keys(prevMap).filter((id) => !currentIds.has(id));
  return { upserts, deletes, nextHashes };
}

export type IncrementalResult = {
  employees: { upserted: number; deleted: number };
  products: { upserted: number; deleted: number };
  transactions: { upserted: number; deleted: number };
  announcements: { upserted: number; deleted: number };
  positions: { upserted: number; deleted: number };
  totalChanges: number;
};

export async function syncIncremental(p: SyncPayload): Promise<IncrementalResult> {
  const prev = loadHashes();
  const next: HashMap = { ...prev };

  const employeeDiff = diffTable("employees", buildEmployeeRows(p.users), prev);
  const productDiff = diffTable("products", buildProductRows(p.products), prev);
  const transactionDiff = diffTable("transactions", buildTransactionRows(p.users), prev);
  const announcementDiff = diffTable("announcements", buildAnnouncementRows(p.announcements), prev);
  const positionDiff = diffTable("positions", buildPositionRows(p.jobs), prev);

  const errors: string[] = [];

  if (employeeDiff.upserts.length) {
    const { error } = await supabase.from("employees").upsert(employeeDiff.upserts);
    if (error) errors.push(`employees upsert: ${error.message}`);
  }
  if (employeeDiff.deletes.length) {
    const { error } = await supabase.from("employees").delete().in("id", employeeDiff.deletes);
    if (error) errors.push(`employees delete: ${error.message}`);
  }

  if (productDiff.upserts.length) {
    const { error } = await supabase.from("products").upsert(productDiff.upserts);
    if (error) errors.push(`products upsert: ${error.message}`);
  }
  if (productDiff.deletes.length) {
    const { error } = await supabase.from("products").delete().in("id", productDiff.deletes);
    if (error) errors.push(`products delete: ${error.message}`);
  }

  if (transactionDiff.upserts.length) {
    const { error } = await supabase.from("transactions").upsert(transactionDiff.upserts);
    if (error) errors.push(`transactions upsert: ${error.message}`);
  }
  if (transactionDiff.deletes.length) {
    const { error } = await supabase.from("transactions").delete().in("id", transactionDiff.deletes);
    if (error) errors.push(`transactions delete: ${error.message}`);
  }

  if (announcementDiff.upserts.length) {
    const { error } = await supabase.from("announcements").upsert(announcementDiff.upserts);
    if (error) errors.push(`announcements upsert: ${error.message}`);
  }
  if (announcementDiff.deletes.length) {
    const { error } = await supabase.from("announcements").delete().in("id", announcementDiff.deletes);
    if (error) errors.push(`announcements delete: ${error.message}`);
  }

  if (positionDiff.upserts.length) {
    const { error } = await supabase.from("positions").upsert(positionDiff.upserts);
    if (error) errors.push(`positions upsert: ${error.message}`);
  }
  if (positionDiff.deletes.length) {
    const { error } = await supabase.from("positions").delete().in("id", positionDiff.deletes);
    if (error) errors.push(`positions delete: ${error.message}`);
  }

  next.employees = employeeDiff.nextHashes;
  next.products = productDiff.nextHashes;
  next.transactions = transactionDiff.nextHashes;
  next.announcements = announcementDiff.nextHashes;
  next.positions = positionDiff.nextHashes;

  if (errors.length) throw new Error(errors.join("; "));
  saveHashes(next);

  const summary = {
    employees: { upserted: employeeDiff.upserts.length, deleted: employeeDiff.deletes.length },
    products: { upserted: productDiff.upserts.length, deleted: productDiff.deletes.length },
    transactions: { upserted: transactionDiff.upserts.length, deleted: transactionDiff.deletes.length },
    announcements: { upserted: announcementDiff.upserts.length, deleted: announcementDiff.deletes.length },
    positions: { upserted: positionDiff.upserts.length, deleted: positionDiff.deletes.length },
  };
  const totalChanges = Object.values(summary).reduce((s, x) => s + x.upserted + x.deleted, 0);
  return { ...summary, totalChanges };
}

export function resetIncrementalState() {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(HASH_STORE_KEY); } catch { /* ignore */ }
}

// ---------- Schema export ----------
// DDL that mirrors the tables provisioned in Lovable Cloud. Useful for
// bootstrapping an external BI / warehouse copy.
export const SCHEMA_SQL = `-- ElecardSpace schema export
-- Generated by portal admin panel

CREATE TABLE IF NOT EXISTS employees (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL,
  role          text NOT NULL,
  department    text,
  position      text,
  telegram      text,
  start_date    date,
  birthday      date,
  avatar        text,
  balance       integer NOT NULL DEFAULT 0,
  bio           text,
  responsibilities jsonb DEFAULT '[]'::jsonb,
  manager_id    text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  description   text,
  price         integer NOT NULL,
  category      text,
  image         text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id            text PRIMARY KEY,
  user_id       text NOT NULL,
  type          text NOT NULL,
  amount        integer NOT NULL,
  reason        text,
  from_user     text,
  occurred_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id            text PRIMARY KEY,
  title         text NOT NULL,
  body          text,
  image         text,
  published_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS positions (
  id            text PRIMARY KEY,
  title         text NOT NULL,
  department    text,
  mission       text,
  responsibilities jsonb DEFAULT '[]'::jsonb,
  skills        jsonb DEFAULT '[]'::jsonb,
  kpi           jsonb DEFAULT '[]'::jsonb,
  career_track  jsonb DEFAULT '[]'::jsonb,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_snapshots (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data       jsonb NOT NULL,
  version    integer NOT NULL DEFAULT 1,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

export const SCHEMA_JSON = {
  version: 1,
  generated_by: "ElecardSpace portal",
  tables: [
    {
      name: "employees",
      primary_key: "id",
      columns: [
        { name: "id", type: "text", nullable: false },
        { name: "name", type: "text", nullable: false },
        { name: "email", type: "text", nullable: false },
        { name: "role", type: "text", nullable: false },
        { name: "department", type: "text" },
        { name: "position", type: "text" },
        { name: "telegram", type: "text" },
        { name: "start_date", type: "date" },
        { name: "birthday", type: "date" },
        { name: "avatar", type: "text" },
        { name: "balance", type: "integer", nullable: false, default: 0 },
        { name: "bio", type: "text" },
        { name: "responsibilities", type: "jsonb", default: "[]" },
        { name: "manager_id", type: "text" },
        { name: "updated_at", type: "timestamptz", nullable: false },
      ],
    },
    {
      name: "products",
      primary_key: "id",
      columns: [
        { name: "id", type: "text", nullable: false },
        { name: "name", type: "text", nullable: false },
        { name: "description", type: "text" },
        { name: "price", type: "integer", nullable: false },
        { name: "category", type: "text" },
        { name: "image", type: "text" },
        { name: "updated_at", type: "timestamptz", nullable: false },
      ],
    },
    {
      name: "transactions",
      primary_key: "id",
      columns: [
        { name: "id", type: "text", nullable: false },
        { name: "user_id", type: "text", nullable: false },
        { name: "type", type: "text", nullable: false },
        { name: "amount", type: "integer", nullable: false },
        { name: "reason", type: "text" },
        { name: "from_user", type: "text" },
        { name: "occurred_at", type: "timestamptz", nullable: false },
      ],
    },
    {
      name: "announcements",
      primary_key: "id",
      columns: [
        { name: "id", type: "text", nullable: false },
        { name: "title", type: "text", nullable: false },
        { name: "body", type: "text" },
        { name: "image", type: "text" },
        { name: "published_at", type: "timestamptz", nullable: false },
      ],
    },
    {
      name: "positions",
      primary_key: "id",
      columns: [
        { name: "id", type: "text", nullable: false },
        { name: "title", type: "text", nullable: false },
        { name: "department", type: "text" },
        { name: "mission", type: "text" },
        { name: "responsibilities", type: "jsonb", default: "[]" },
        { name: "skills", type: "jsonb", default: "[]" },
        { name: "kpi", type: "jsonb", default: "[]" },
        { name: "career_track", type: "jsonb", default: "[]" },
        { name: "updated_at", type: "timestamptz", nullable: false },
      ],
    },
    {
      name: "app_snapshots",
      primary_key: "id",
      columns: [
        { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()" },
        { name: "data", type: "jsonb", nullable: false },
        { name: "version", type: "integer", nullable: false, default: 1 },
        { name: "note", type: "text" },
        { name: "created_at", type: "timestamptz", nullable: false },
      ],
    },
  ],
};
