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
  bio?: string;
  responsibilities?: string[];
  managerId?: string | null;
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

export type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  body: string;
  date: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  date: string;
  comments: Comment[];
};

export type UsefulLink = {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
};

export const DEPARTMENTS = [
  "Руководство",
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
    name: "Ольга Пастушкова",
    email: "olga.pastushkova@elecard.ru",
    password: "12345elecard",
    role: "admin",
    department: "Руководство",
    position: "HR Director",
    telegram: "@olga_pastushkova",
    startDate: "2017-01-15",
    avatar: avatarFor("Ольга Пастушкова", 0x1e3a5f),
    balance: 1500,
    managerId: null,
    bio: "Отвечаю за развитие команды и культуру ElecardSpace. 9 лет в HR, кандидат психологических наук.",
    responsibilities: [
      "Стратегия развития персонала",
      "Найм ключевых ролей",
      "Программы обучения и адаптации",
      "Корпоративная культура",
    ],
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
    email: "alex@elecard.ru",
    password: "dev",
    role: "employee",
    department: "Разработка",
    position: "Tech Lead",
    telegram: "@alex_dev",
    startDate: "2021-08-02",
    avatar: avatarFor("Алексей Петров", 230),
    balance: 450,
    managerId: "u-admin",
    bio: "Frontend-инженер с 8-летним опытом. Люблю производительный React и менторинг.",
    responsibilities: ["Архитектура фронтенда", "Релизы продукта", "Менторинг команды"],
    kpi: [
      { title: "Релиз v3.2", progress: 80 },
      { title: "Код-ревью", progress: 60 },
      { title: "Менторинг джунов", progress: 35 },
    ],
    transactions: [
      { id: "t2", type: "credit", amount: 150, reason: "Успешное закрытие спринта", from: "Ольга Пастушкова", date: "2026-06-01" },
      { id: "t3", type: "credit", amount: 300, reason: "Релиз продукта", from: "Ольга Пастушкова", date: "2026-05-15" },
    ],
  },
  {
    id: "u-design",
    name: "Ольга Смирнова",
    email: "smirnova@elecard.ru",
    password: "design",
    role: "employee",
    department: "Дизайн",
    position: "Lead Product Designer",
    telegram: "@olga_d",
    startDate: "2022-11-20",
    avatar: avatarFor("Ольга Смирнова", 280),
    balance: 220,
    managerId: "u-admin",
    bio: "Дизайнер продуктов, фанат дизайн-систем и доступности.",
    responsibilities: ["UX-исследования", "Дизайн-система", "Прототипирование"],
    kpi: [{ title: "Редизайн портала", progress: 55 }],
    transactions: [
      { id: "t4", type: "credit", amount: 100, reason: "За помощь в организации мероприятия", from: "Ольга Пастушкова", date: "2026-05-20" },
      { id: "t5", type: "debit", amount: 80, reason: "Покупка: Брендированная кружка", date: "2026-05-25" },
    ],
  },
  {
    id: "u-analytics",
    name: "Дмитрий Кузнецов",
    email: "dmitry@elecard.ru",
    password: "analytics",
    role: "employee",
    department: "Аналитика",
    position: "Lead Data Analyst",
    telegram: "@dk_data",
    startDate: "2023-02-14",
    avatar: avatarFor("Дмитрий Кузнецов", 200),
    balance: 130,
    managerId: "u-admin",
    bio: "Перевожу данные в решения. Эксперт по продуктовой аналитике.",
    responsibilities: ["Дашборды", "A/B тесты", "Прогнозные модели"],
    kpi: [{ title: "Дашборд продаж", progress: 90 }],
    transactions: [
      { id: "t6", type: "credit", amount: 130, reason: "Внедрение метрики LTV", from: "Ольга Пастушкова", date: "2026-06-05" },
    ],
  },
  {
    id: "u-dev2",
    name: "Иван Соколов",
    email: "ivan@elecard.ru",
    password: "dev2",
    role: "employee",
    department: "Разработка",
    position: "Frontend Developer",
    startDate: "2024-04-01",
    avatar: avatarFor("Иван Соколов", 210),
    balance: 90,
    managerId: "u-dev",
    bio: "Middle разработчик, увлекаюсь анимациями и DX.",
    responsibilities: ["Разработка фич", "Поддержка дизайн-системы"],
    kpi: [{ title: "Спринт #14", progress: 60 }],
    transactions: [],
  },
  {
    id: "u-designjr",
    name: "Анна Лебедева",
    email: "anna@elecard.ru",
    password: "designjr",
    role: "employee",
    department: "Дизайн",
    position: "Product Designer",
    startDate: "2024-09-10",
    avatar: avatarFor("Анна Лебедева", 290),
    balance: 60,
    managerId: "u-design",
    bio: "Дизайнер интерфейсов, люблю иллюстрации.",
    responsibilities: ["Макеты", "Иллюстрации"],
    kpi: [{ title: "Онбординг", progress: 80 }],
    transactions: [],
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
  { id: "a1", title: "Тимбилдинг 28 июня", body: "Всех ждём на загородной базе, автобусы от офиса в 10:00.", date: "2026-06-15", comments: [] },
  { id: "a2", title: "Запуск ElecardSpace v3.2", body: "Поздравляем команду разработки с успешным релизом!", date: "2026-06-10", comments: [] },
  { id: "a3", title: "Открыт магазин бонусов", body: "Тратьте накопленные ElecardBonus на мерч и обучение.", date: "2026-06-01", comments: [] },
];

const seedLinks: UsefulLink[] = [
  { id: "l1", title: "Корпоративная почта", url: "https://mail.elecard.ru", description: "Веб-интерфейс почты", category: "Сервисы" },
  { id: "l2", title: "База знаний (Confluence)", url: "https://wiki.elecard.ru", description: "Документация, регламенты, инструкции", category: "Документация" },
  { id: "l3", title: "Трекер задач (Jira)", url: "https://jira.elecard.ru", description: "Задачи, спринты и баги", category: "Сервисы" },
  { id: "l4", title: "HR-портал", url: "https://hr.elecard.ru", description: "Заявления, отпуска, справки", category: "HR" },
  { id: "l5", title: "Бронирование переговорок", url: "https://rooms.elecard.ru", description: "Календарь свободных комнат", category: "Офис" },
  { id: "l6", title: "Служба поддержки IT", url: "https://help.elecard.ru", description: "Создать тикет в IT-отдел", category: "Поддержка" },
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
  addUser: (data: Omit<User, "id" | "avatar" | "transactions" | "kpi" | "balance" | "role"> & { balance?: number; role?: Role; avatar?: string }) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addJob: (j: Omit<Job, "id">) => void;
  updateJob: (id: string, patch: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  addProduct: (p: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
  addComment: (announcementId: string, body: string) => void;
  addAnnouncement: (data: { title: string; body: string }) => void;
  updateAnnouncement: (id: string, patch: Partial<Pick<Announcement, "title" | "body">>) => void;
  deleteAnnouncement: (id: string) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [announcements, setAnnouncements] = useState<Announcement[]>(seedAnnouncements);
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
        managerId: "u-admin",
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
        avatar: data.avatar || avatarFor(data.name, 245),
        balance: data.balance ?? 100,
        managerId: data.managerId ?? "u-admin",
        bio: data.bio,
        responsibilities: data.responsibilities,
        transactions: [],
        kpi: [],
      };
      setUsers((p) => [...p, newUser]);
    },
    updateUser: (id, patch) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u))),
    deleteUser: (id) => {
      setUsers((prev) => prev.filter((u) => u.id !== id).map((u) => (u.managerId === id ? { ...u, managerId: "u-admin" } : u)));
      if (currentUserId === id) setCurrentUserId(null);
    },
    addJob: (j) => setJobs((p) => [...p, { ...j, id: "j-" + Math.random().toString(36).slice(2, 7) }]),
    updateJob: (id, patch) => setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j))),
    deleteJob: (id) => setJobs((prev) => prev.filter((j) => j.id !== id)),
    updateProduct: (id, patch) => setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    addProduct: (p) => setProducts((prev) => [...prev, { ...p, id: "p-" + Math.random().toString(36).slice(2, 7) }]),
    deleteProduct: (id) => setProducts((prev) => prev.filter((p) => p.id !== id)),
    addComment: (announcementId, body) => {
      if (!currentUser || !body.trim()) return;
      const c: Comment = {
        id: "c-" + Math.random().toString(36).slice(2, 7),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        body: body.trim(),
        date: today(),
      };
      setAnnouncements((prev) => prev.map((a) => (a.id === announcementId ? { ...a, comments: [...a.comments, c] } : a)));
    },
    addAnnouncement: ({ title, body }) => {
      setAnnouncements((prev) => [
        { id: "a-" + Math.random().toString(36).slice(2, 7), title, body, date: today().slice(0, 10), comments: [] },
        ...prev,
      ]);
    },
    updateAnnouncement: (id, patch) => setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))),
    deleteAnnouncement: (id) => setAnnouncements((prev) => prev.filter((a) => a.id !== id)),
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
