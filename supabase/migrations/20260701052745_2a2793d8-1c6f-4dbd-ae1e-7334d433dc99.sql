
-- Central snapshot for the entire portal state (used for backup + third-party integration)
CREATE TABLE public.app_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL,
  version INT NOT NULL DEFAULT 1,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.app_snapshots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_snapshots TO authenticated;
GRANT ALL ON public.app_snapshots TO service_role;
ALTER TABLE public.app_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "snap read all" ON public.app_snapshots FOR SELECT USING (true);
CREATE POLICY "snap insert all" ON public.app_snapshots FOR INSERT WITH CHECK (true);

-- Normalized tables for external integrations (BI, HRIS, etc.)
CREATE TABLE public.employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  department TEXT,
  position TEXT,
  telegram TEXT,
  start_date DATE,
  birthday DATE,
  avatar TEXT,
  balance INT NOT NULL DEFAULT 0,
  bio TEXT,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  manager_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.employees TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees read" ON public.employees FOR SELECT USING (true);
CREATE POLICY "employees write" ON public.employees FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL,
  category TEXT,
  image TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products write" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount INT NOT NULL,
  reason TEXT,
  from_user TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx read" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "tx write" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  image TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ann read" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "ann write" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.positions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  mission TEXT,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  kpi JSONB DEFAULT '[]'::jsonb,
  career_track JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.positions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.positions TO authenticated;
GRANT ALL ON public.positions TO service_role;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pos read" ON public.positions FOR SELECT USING (true);
CREATE POLICY "pos write" ON public.positions FOR ALL USING (true) WITH CHECK (true);
