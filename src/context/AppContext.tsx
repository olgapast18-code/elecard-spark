import { createContext, useContext, useState, useMemo, type ReactNode } from "react";

export type Role = "admin" | "employee";

export type Transaction = {
  id: string;
  type: "credit" | "debit";
  amount: number;
  reason: string;
  from?: string;
  date: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  position: string;
  telegram?: string;
  startDate: string;
  avatar: string;
  balance: number;
  transactions: Transaction[];
  kpi: { title: string; progress: number }[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Брендированный мерч" | "Обучение" | "Дни отдыха";
  image: string;
};

export type Job = {
  id: string;
  title: string;
  department: string;
  mission: string;
  responsibilities: string[];
  skills: string[];
  kpi: string[];
  careerTrack: string[];
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  date: string;
};

export const DEPARTMENTS = [
  "Разработка",
  "HR",
  "Маркетинг",
  "Продажи",
  "Дизайн",
  "Аналитика",
];

const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

const avatarFor = (name: string, hue = 245) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(initials(name))}&background=${hue.toString(16)}&color=fff&bold=true`;

const today = () => new Date().toISOString();

const seedUsers: User[] = [
  {
    id: "u-admin",
    name: "Мария Иванова",
    email: "hr@elecard.space",
    password: "admin",
    role: "admin",
    department: "HR",
    position: "HR Director",
    telegram: "@maria_hr",
    startDate: "2019-03-12",
    avatar: avatarFor("Мария Иванова"),
    balance: 999,
    kpi: [
      { title: "Найм Q4", progress: 72 },
      { title: "Onboarding 2026", progress: 45 },
    ],
    transactions: [
      { id: "t1", type: "credit", amount: 200, reason: "Бонус за квартал", from: "Система", date: "2026-05-01" },
    ],
  },
  {
    id: "u-dev",
    name: "Алексей Петров",
    email: "alex@elecard.space",
    password: "dev",
    role: "employee",
    department: "Разработка",
    position: "Senior Frontend Developer",
    telegram: "@alex_dev",
    startDate: "2021-08-02",
    avatar: avatarFor("Алексей Петров", 230),
    balance: 450,
    kpi: [
      { title: "Релиз v3.2", progress: 80 },
      { title: "Код-ревью", progress: 60 },
      { title: "Менторинг джунов", progress: 35 },
    ],
    transactions: [
      { id: "t2", type: "credit", amount: 150, reason: "Успешное закрытие спринта", from: "Мария Иванова", date: "2026-06-01" },
      { id: "t3", type: "credit", amount: 300, reason: "Релиз продукта", from: "Мария Иванова", date: "2026-05-15" },
    ],
  },
  {
    id: "u-design",
    name: "Ольга Смирнова",
    email: "olga@elecard.space",
    password: "design",
    role: "employee",
    department: "Дизайн",
    position: "Product Designer",
    telegram: "@olga_d",
    startDate: "2022-11-20",
    avatar: avatarFor("Ольга Смирнова", 280),
    balance: 220,
    kpi: [{ title: "Редизайн портала", progress: 55 }],
    transactions: [
      { id: "t4", type: "credit", amount: 100, reason: "За помощь в организации мероприятия", from: "Мария Иванова", date: "2026-05-20" },
      { id: "t5", type: "debit", amount: 80, reason: "Покупка: Брендированная кружка", date: "2026-05-25" },
    ],
  },
  {
    id: "u-analytics",
    name: "Дмитрий Кузнецов",
    email: "dmitry@elecard.space",
    password: "analytics",
    role: "employee",
    department: "Аналитика",
    position: "Data Analyst",
    telegram: "@dk_data",
    startDate: "2023-02-14",
    avatar: avatarFor("Дмитрий Кузнецов", 200),
    balance: 130,
    kpi: [{ title: "Дашборд продаж", progress: 90 }],
    transactions: [
      { id: "t6", type: "credit", amount: 130, reason: "Внедрение метрики LTV", from: "Мария Иванова", date: "2026-06-05" },
    ],
  },
];

const seedProducts: Product[] = [
  {
    id: "p1",
    name: "Худи ElecardSpace",
    description: "Тёплое худи с фирменным логотипом",
    price: 350,
    category: "Брендированный мерч",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=70",
  },
  {
    id: "p2",
    name: "Термокружка",
    description: "Сохраняет тепло до 8 часов",
    price: 80,
    category: "Брендированный мерч",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=70",
  },
  {
    id: "p3",
    name: "Курс «Advanced TypeScript»",
    description: "Доступ к онлайн-курсу на 6 месяцев",
    price: 400,
    category: "Обучение",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=70",
  },
  {
    id: "p4",
    name: "Книга «Clean Architecture»",
    description: "Бумажное издание, доставка в офис",
    price: 120,
    category: "Обучение",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=70",
  },
  {
    id: "p5",
    name: "Дополнительный отгул",
    description: "Один оплачиваемый день отдыха",
    price: 500,
    category: "Дни отдыха",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=70",
  },
  {
    id: "p6",
    name: "Гибкий график на неделю",
    description: "Свободный старт рабочего дня 5 дней",
    price: 250,
    category: "Дни отдыха",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=70",
  },
];

const seedJobs: Job[] = [
  {
    id: "j1",
    title: "Senior Frontend Developer",
    department: "Разработка",
    mission: "Создавать быстрые и доступные интерфейсы продуктов ElecardSpace.",
    responsibilities: ["Разработка фич на React/TS", "Код-ревью", "Менторинг джунов"],
    skills: ["React", "TypeScript", "Tailwind", "Тестирование"],
    kpi: ["Скорость загрузки < 2s", "Lighthouse > 90", "Релизы без P1-багов"],
    careerTrack: ["Middle", "Senior", "Lead", "Principal"],
  },
  {
    id: "j2",
    title: "Product Designer",
    department: "Дизайн",
    mission: "Превращать сложные сценарии в простые интерфейсы.",
    responsibilities: ["UX-исследования", "Прототипирование", "Дизайн-система"],
    skills: ["Figma", "UX research", "Motion"],
    kpi: ["NPS > 50", "Скорость прохождения сценариев"],
    careerTrack: ["Junior", "Middle", "Senior", "Lead"],
  },
  {
    id: "j3",
    title: "HR Director",
    department: "HR",
    mission: "Развивать команду и культуру компании.",
    responsibilities: ["Найм", "Onboarding", "Развитие сотрудников"],
    skills: ["Лидерство", "Коммуникации", "Аналитика людей"],
    kpi: ["Срок найма", "Retention > 90%"],
    careerTrack: ["HR Manager", "HR Lead", "HR Director", "CPO"],
  },
  {
    id: "j4",
    title: "Data Analyst",
    department: "Аналитика",
    mission: "Превращать данные в решения.",
    responsibilities: ["Дашборды", "A/B тесты", "Метрики продукта"],
    skills: ["SQL", "Python", "BI"],
    kpi: ["Точность прогнозов", "Время до инсайта"],
    careerTrack: ["Junior", "Middle", "Senior", "Lead"],
  },
];

const seedAnnouncements: Announcement[] = [
  { id: "a1", title: "Тимбилдинг 28 июня", body: "Всех ждём на загородной базе, автобусы от офиса в 10:00.", date: "2026-06-15" },
  { id: "a2", title: "Запуск ElecardSpace v3.2", body: "Поздравляем команду разработки с успешным релизом!", date: "2026-06-10" },
  { id: "a3", title: "Открыт магазин бонусов", body: "Тратьте накопленные ElecardBonus на мерч и обучение.", date: "2026-06-01" },
];

type Ctx = {
  users: User[];
  products: Product[];
  jobs: Job[];
  announcements: Announcement[];
  currentUserId: string | null;
  currentUser: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => User | null;
  loginAs: (id: string) => void;
  logout: () => void;
  register: (data: { name: string; email: string; password: string; department: string; position: string }) => User;
  buyProduct: (productId: string) => { ok: boolean; message: string };
  grantBonus: (userId: string, amount: number, reason: string) => void;
  addUser: (data: Omit<User, "id" | "avatar" | "transactions" | "kpi" | "balance" | "role"> & { balance?: number; role?: Role }) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  addJob: (j: Omit<Job, "id">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  addProduct: (p: Omit<Product, "id">) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [announcements] = useState<Announcement[]>(seedAnnouncements);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId],
  );

  const value: Ctx = {
    users,
    products,
    jobs,
    announcements,
    currentUserId,
    currentUser,
    isAdmin: currentUser?.role === "admin",
    login: (email, password) => {
      const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
      if (u) setCurrentUserId(u.id);
      return u ?? null;
    },
    loginAs: (id) => setCurrentUserId(id),
    logout: () => setCurrentUserId(null),
    register: (data) => {
      const newUser: User = {
        id: "u-" + Math.random().toString(36).slice(2, 8),
        name: data.name,
        email: data.email,
        password: data.password,
        role: "employee",
        department: data.department,
        position: data.position,
        startDate: today().slice(0, 10),
        avatar: avatarFor(data.name, 245),
        balance: 100,
        transactions: [
          { id: "t-" + Math.random().toString(36).slice(2, 7), type: "credit", amount: 100, reason: "Приветственный бонус", from: "ElecardSpace", date: today() },
        ],
        kpi: [{ title: "Onboarding", progress: 10 }],
      };
      setUsers((p) => [...p, newUser]);
      setCurrentUserId(newUser.id);
      return newUser;
    },
    buyProduct: (productId) => {
      const product = products.find((p) => p.id === productId);
      if (!product || !currentUser) return { ok: false, message: "Ошибка" };
      if (currentUser.balance < product.price) return { ok: false, message: "Недостаточно бонусов" };
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? {
                ...u,
                balance: u.balance - product.price,
                transactions: [
                  { id: "t-" + Math.random().toString(36).slice(2, 7), type: "debit", amount: product.price, reason: `Покупка: ${product.name}`, date: today() },
                  ...u.transactions,
                ],
              }
            : u,
        ),
      );
      return { ok: true, message: `«${product.name}» успешно заказан!` };
    },
    grantBonus: (userId, amount, reason) => {
      const admin = currentUser;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                balance: u.balance + amount,
                transactions: [
                  { id: "t-" + Math.random().toString(36).slice(2, 7), type: "credit", amount, reason, from: admin?.name ?? "Администратор", date: today() },
                  ...u.transactions,
                ],
              }
            : u,
        ),
      );
    },
    addUser: (data) => {
      const newUser: User = {
        id: "u-" + Math.random().toString(36).slice(2, 8),
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role ?? "employee",
        department: data.department,
        position: data.position,
        telegram: data.telegram,
        startDate: data.startDate || today().slice(0, 10),
        avatar: avatarFor(data.name, 245),
        balance: data.balance ?? 100,
        transactions: [],
        kpi: [],
      };
      setUsers((p) => [...p, newUser]);
    },
    updateUser: (id, patch) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u))),
    addJob: (j) => setJobs((p) => [...p, { ...j, id: "j-" + Math.random().toString(36).slice(2, 7) }]),
    updateProduct: (id, patch) => setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    addProduct: (p) => setProducts((prev) => [...prev, { ...p, id: "p-" + Math.random().toString(36).slice(2, 7) }]),
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
