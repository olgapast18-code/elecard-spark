import { createContext, useContext, useState, useMemo, useEffect, useRef, type ReactNode } from "react";

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
  birthday?: string;
  avatar: string;
  balance: number;
  transactions: Transaction[];
  kpi: { title: string; progress: number }[];
  bio?: string;
  responsibilities?: string[];
  managerId?: string | null;
  notifyEmail?: boolean;
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

export type NewsAttachment = { name: string; dataUrl: string; type: string };

export type Announcement = {
  id: string;
  title: string;
  body: string;
  date: string;
  image?: string;
  comments: Comment[];
};

export type UsefulLink = {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
};

export type BonusRule = {
  id: string;
  title: string;
  amount: number;
  description: string;
};

export type Message = {
  id: string;
  fromId: string;
  toId: string;
  body: string;
  attachments: NewsAttachment[];
  date: string;
  read: boolean;
  system?: boolean;
};

export type CartItem = { productId: string; qty: number };

export type PollOption = { id: string; text: string; votes: string[] };
export type Poll = {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  createdAt: string;
  closed?: boolean;
};

const DEFAULT_DEPARTMENTS = [
  "Руководство",
  "Разработка",
  "HR",
  "Маркетинг",
  "Продажи",
  "Дизайн",
  "Аналитика",
];

// Backwards-compat re-export (used by some routes).
export const DEPARTMENTS = DEFAULT_DEPARTMENTS;

const initials = (n: string) =>
  n.split(" ").map((p) => p[0]).slice(0, 2).join("");

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
    birthday: "1985-04-22",
    avatar: avatarFor("Ольга Пастушкова", 0x1e3a5f),
    balance: 1500,
    managerId: null,
    notifyEmail: true,
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
    birthday: "1990-09-12",
    avatar: avatarFor("Алексей Петров", 230),
    balance: 450,
    managerId: "u-admin",
    notifyEmail: false,
    bio: "Frontend-инженер с 8-летним опытом. Люблю производительный React и менторинг.",
    responsibilities: ["Архитектура фронтенда", "Релизы продукта", "Менторинг команды"],
    kpi: [
      { title: "Релиз v3.2", progress: 80 },
      { title: "Код-ревью", progress: 60 },
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
    birthday: "1992-12-03",
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
    birthday: "1988-07-30",
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
    birthday: "1996-02-18",
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
    birthday: "1998-11-05",
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
  { id: "p1", name: "Худи ElecardSpace", description: "Тёплое худи с фирменным логотипом", price: 350, category: "Брендированный мерч", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=70" },
  { id: "p2", name: "Термокружка", description: "Сохраняет тепло до 8 часов", price: 80, category: "Брендированный мерч", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=70" },
  { id: "p3", name: "Курс «Advanced TypeScript»", description: "Доступ к онлайн-курсу на 6 месяцев", price: 400, category: "Обучение", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=70" },
  { id: "p4", name: "Книга «Clean Architecture»", description: "Бумажное издание, доставка в офис", price: 120, category: "Обучение", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=70" },
  { id: "p5", name: "Дополнительный отгул", description: "Один оплачиваемый день отдыха", price: 500, category: "Дни отдыха", image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=70" },
  { id: "p6", name: "Гибкий график на неделю", description: "Свободный старт рабочего дня 5 дней", price: 250, category: "Дни отдыха", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=70" },
];

const seedJobs: Job[] = [
  { id: "j1", title: "Senior Frontend Developer", department: "Разработка", mission: "Создавать быстрые и доступные интерфейсы продуктов ElecardSpace.", responsibilities: ["Разработка фич на React/TS", "Код-ревью", "Менторинг джунов"], skills: ["React", "TypeScript", "Tailwind", "Тестирование"], kpi: ["Скорость загрузки < 2s", "Lighthouse > 90"], careerTrack: ["Middle", "Senior", "Lead", "Principal"] },
  { id: "j2", title: "Product Designer", department: "Дизайн", mission: "Превращать сложные сценарии в простые интерфейсы.", responsibilities: ["UX-исследования", "Прототипирование", "Дизайн-система"], skills: ["Figma", "UX research", "Motion"], kpi: ["NPS > 50"], careerTrack: ["Junior", "Middle", "Senior", "Lead"] },
  { id: "j3", title: "HR Director", department: "HR", mission: "Развивать команду и культуру компании.", responsibilities: ["Найм", "Onboarding", "Развитие сотрудников"], skills: ["Лидерство", "Коммуникации"], kpi: ["Срок найма", "Retention > 90%"], careerTrack: ["HR Manager", "HR Lead", "HR Director", "CPO"] },
  { id: "j4", title: "Data Analyst", department: "Аналитика", mission: "Превращать данные в решения.", responsibilities: ["Дашборды", "A/B тесты"], skills: ["SQL", "Python", "BI"], kpi: ["Точность прогнозов"], careerTrack: ["Junior", "Middle", "Senior", "Lead"] },
];

const seedAnnouncements: Announcement[] = [
  { id: "a1", title: "Тимбилдинг 28 июня", body: "Всех ждём на загородной базе, автобусы от офиса в 10:00. 🎉", date: "2026-06-15", comments: [] },
  { id: "a2", title: "Запуск ElecardSpace v3.2", body: "Поздравляем команду разработки с успешным релизом! 🚀", date: "2026-06-10", comments: [] },
  { id: "a3", title: "Открыт магазин бонусов", body: "Тратьте накопленные ElecardBonus на мерч и обучение. 🛍️", date: "2026-06-01", comments: [] },
];

const seedLinks: UsefulLink[] = [
  { id: "l1", title: "Корпоративная почта", url: "https://mail.elecard.ru", description: "Веб-интерфейс почты", category: "Сервисы" },
  { id: "l2", title: "База знаний (Confluence)", url: "https://wiki.elecard.ru", description: "Документация, регламенты, инструкции", category: "Документация" },
  { id: "l3", title: "Трекер задач (Jira)", url: "https://jira.elecard.ru", description: "Задачи, спринты и баги", category: "Сервисы" },
  { id: "l4", title: "HR-портал", url: "https://hr.elecard.ru", description: "Заявления, отпуска, справки", category: "HR" },
  { id: "l5", title: "Бронирование переговорок", url: "https://rooms.elecard.ru", description: "Календарь свободных комнат", category: "Офис" },
  { id: "l6", title: "Служба поддержки IT", url: "https://help.elecard.ru", description: "Создать тикет в IT-отдел", category: "Поддержка" },
];

const seedBonusRules: BonusRule[] = [
  { id: "b1", title: "Успешное закрытие спринта", amount: 150, description: "Команда сдала все запланированные задачи без переноса." },
  { id: "b2", title: "Релиз продукта", amount: 300, description: "Ключевой релиз вышел в срок и без критических багов." },
  { id: "b3", title: "Менторинг", amount: 100, description: "Регулярное обучение и поддержка новых сотрудников." },
  { id: "b4", title: "Инициатива квартала", amount: 250, description: "Реализованная идея, повлиявшая на процессы или продукт." },
  { id: "b5", title: "Помощь коллеге", amount: 50, description: "Подмена, ревью или экстренная поддержка вне зоны ответственности." },
  { id: "b6", title: "Участие в мероприятии", amount: 80, description: "Доклад, организация митапа или внешнее представление компании." },
];

const seedPolls: Poll[] = [
  {
    id: "poll1",
    question: "Куда поедем на летний тимбилдинг?",
    description: "Голосование открыто до 25 июня. Выбери один вариант.",
    createdAt: "2026-06-10",
    options: [
      { id: "o1", text: "Загородная база отдыха", votes: ["u-dev", "u-design"] },
      { id: "o2", text: "Сплав по реке", votes: ["u-analytics"] },
      { id: "o3", text: "Поездка в горы", votes: ["u-dev2"] },
    ],
  },
  {
    id: "poll2",
    question: "Какие курсы добавить в магазин бонусов?",
    createdAt: "2026-06-05",
    options: [
      { id: "o1", text: "Курс по System Design", votes: ["u-dev"] },
      { id: "o2", text: "Курс по продуктовой аналитике", votes: [] },
      { id: "o3", text: "Курс по soft skills", votes: ["u-designjr"] },
    ],
  },
];

const STORAGE_KEY = "elecard_space_state_v1";

type PersistedState = {
  users: User[];
  products: Product[];
  jobs: Job[];
  announcements: Announcement[];
  links: UsefulLink[];
  bonusRules: BonusRule[];
  departments: string[];
  messages: Message[];
  polls: Poll[];
};

const seedAll = (): PersistedState => ({
  users: seedUsers,
  products: seedProducts,
  jobs: seedJobs,
  announcements: seedAnnouncements,
  links: seedLinks,
  bonusRules: seedBonusRules,
  departments: DEFAULT_DEPARTMENTS,
  messages: [],
  polls: seedPolls,
});

const loadInitial = (): PersistedState => {
  if (typeof window === "undefined") return seedAll();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedAll();
    const parsed = JSON.parse(raw);
    return { ...seedAll(), ...parsed };
  } catch {
    return seedAll();
  }
};

type Ctx = {
  users: User[];
  products: Product[];
  jobs: Job[];
  announcements: Announcement[];
  links: UsefulLink[];
  bonusRules: BonusRule[];
  departments: string[];
  messages: Message[];
  cart: CartItem[];
  polls: Poll[];
  currentUserId: string | null;
  currentUser: User | null;
  isAdmin: boolean;
  unreadCount: number;
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
  deleteComment: (announcementId: string, commentId: string) => void;
  addAnnouncement: (data: { title: string; body: string; image?: string }) => void;
  updateAnnouncement: (id: string, patch: Partial<Pick<Announcement, "title" | "body" | "image">>) => void;
  deleteAnnouncement: (id: string) => void;
  addLink: (data: Omit<UsefulLink, "id">) => void;
  updateLink: (id: string, patch: Partial<UsefulLink>) => void;
  deleteLink: (id: string) => void;
  addBonusRule: (r: Omit<BonusRule, "id">) => void;
  updateBonusRule: (id: string, patch: Partial<BonusRule>) => void;
  deleteBonusRule: (id: string) => void;
  addDepartment: (name: string) => void;
  renameDepartment: (oldName: string, newName: string) => void;
  deleteDepartment: (name: string) => void;
  sendMessage: (toId: string, body: string, attachments?: NewsAttachment[], opts?: { system?: boolean; fromId?: string }) => void;
  markThreadRead: (peerId: string) => void;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  checkoutCart: () => { ok: boolean; message: string };
  // polls
  addPoll: (data: { question: string; description?: string; options: string[] }) => void;
  updatePoll: (id: string, patch: Partial<Pick<Poll, "question" | "description" | "closed">>) => void;
  deletePoll: (id: string) => void;
  votePoll: (pollId: string, optionId: string) => void;
  // data import/export
  exportData: () => string;
  importData: (json: string) => { ok: boolean; message: string };
  resetData: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = useRef<PersistedState | null>(null);
  if (initial.current === null) initial.current = loadInitial();

  const [users, setUsers] = useState<User[]>(initial.current.users);
  const [products, setProducts] = useState<Product[]>(initial.current.products);
  const [jobs, setJobs] = useState<Job[]>(initial.current.jobs);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initial.current.announcements);
  const [links, setLinks] = useState<UsefulLink[]>(initial.current.links);
  const [bonusRules, setBonusRules] = useState<BonusRule[]>(initial.current.bonusRules);
  const [departments, setDepartments] = useState<string[]>(initial.current.departments);
  const [messages, setMessages] = useState<Message[]>(initial.current.messages);
  const [polls, setPolls] = useState<Poll[]>(initial.current.polls);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Persist to localStorage on changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const snapshot: PersistedState = { users, products, jobs, announcements, links, bonusRules, departments, messages, polls };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // ignore quota errors
    }
  }, [users, products, jobs, announcements, links, bonusRules, departments, messages, polls]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId],
  );

  const unreadCount = useMemo(
    () => (currentUser ? messages.filter((m) => m.toId === currentUser.id && !m.read).length : 0),
    [messages, currentUser],
  );

  const adminUser = users.find((u) => u.role === "admin");

  const sendSystem = (toId: string, body: string) => {
    const msg: Message = {
      id: "m-" + Math.random().toString(36).slice(2, 8),
      fromId: "system",
      toId,
      body,
      attachments: [],
      date: today(),
      read: false,
      system: true,
    };
    setMessages((p) => [...p, msg]);
  };

  const value: Ctx = {
    users, products, jobs, announcements, links, bonusRules, departments, messages, cart, polls,
    currentUserId, currentUser, isAdmin: currentUser?.role === "admin", unreadCount,
    login: (email, password) => {
      const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
      if (u) setCurrentUserId(u.id);
      return u ?? null;
    },
    loginAs: (id) => setCurrentUserId(id),
    logout: () => { setCurrentUserId(null); setCart([]); },
    register: (data) => {
      const newUser: User = {
        id: "u-" + Math.random().toString(36).slice(2, 8),
        name: data.name, email: data.email, password: data.password,
        role: "employee", department: data.department, position: data.position,
        startDate: today().slice(0, 10),
        avatar: avatarFor(data.name, 245),
        balance: 100, managerId: "u-admin", notifyEmail: false,
        transactions: [{ id: "t-" + Math.random().toString(36).slice(2, 7), type: "credit", amount: 100, reason: "Приветственный бонус", from: "ElecardSpace", date: today() }],
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
      setUsers((prev) => prev.map((u) => u.id === currentUser.id ? {
        ...u, balance: u.balance - product.price,
        transactions: [{ id: "t-" + Math.random().toString(36).slice(2, 7), type: "debit", amount: product.price, reason: `Покупка: ${product.name}`, date: today() }, ...u.transactions],
      } : u));
      if (adminUser && adminUser.id !== currentUser.id) {
        sendSystem(adminUser.id, `🛒 Новая покупка: ${currentUser.name} заказал «${product.name}» за ${product.price} бонусов.`);
      }
      return { ok: true, message: `«${product.name}» успешно заказан!` };
    },
    grantBonus: (userId, amount, reason) => {
      const admin = currentUser;
      setUsers((prev) => prev.map((u) => u.id === userId ? {
        ...u, balance: u.balance + amount,
        transactions: [{ id: "t-" + Math.random().toString(36).slice(2, 7), type: "credit", amount, reason, from: admin?.name ?? "Администратор", date: today() }, ...u.transactions],
      } : u));
    },
    addUser: (data) => {
      const newUser: User = {
        id: "u-" + Math.random().toString(36).slice(2, 8),
        name: data.name, email: data.email, password: data.password,
        role: data.role ?? "employee", department: data.department, position: data.position, telegram: data.telegram,
        startDate: data.startDate || today().slice(0, 10),
        birthday: data.birthday,
        avatar: data.avatar || avatarFor(data.name, 245),
        balance: data.balance ?? 100, managerId: data.managerId ?? "u-admin",
        bio: data.bio, responsibilities: data.responsibilities,
        notifyEmail: data.notifyEmail ?? false,
        transactions: [], kpi: [],
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
        authorId: currentUser.id, authorName: currentUser.name, authorAvatar: currentUser.avatar,
        body: body.trim(), date: today(),
      };
      setAnnouncements((prev) => prev.map((a) => (a.id === announcementId ? { ...a, comments: [...a.comments, c] } : a)));
    },
    addAnnouncement: ({ title, body, image }) => {
      const newA: Announcement = { id: "a-" + Math.random().toString(36).slice(2, 7), title, body, image, date: today().slice(0, 10), comments: [] };
      setAnnouncements((prev) => [newA, ...prev]);
      users.forEach((u) => { if (u.notifyEmail) sendSystem(u.id, `📰 Новая новость: «${title}»`); });
    },
    updateAnnouncement: (id, patch) => setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))),
    deleteAnnouncement: (id) => setAnnouncements((prev) => prev.filter((a) => a.id !== id)),
    addLink: (data) => setLinks((prev) => [...prev, { ...data, id: "l-" + Math.random().toString(36).slice(2, 7) }]),
    updateLink: (id, patch) => setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l))),
    deleteLink: (id) => setLinks((prev) => prev.filter((l) => l.id !== id)),
    addBonusRule: (r) => setBonusRules((p) => [...p, { ...r, id: "br-" + Math.random().toString(36).slice(2, 7) }]),
    updateBonusRule: (id, patch) => setBonusRules((p) => p.map((b) => (b.id === id ? { ...b, ...patch } : b))),
    deleteBonusRule: (id) => setBonusRules((p) => p.filter((b) => b.id !== id)),
    addDepartment: (name) => { const n = name.trim(); if (n && !departments.includes(n)) setDepartments((p) => [...p, n]); },
    renameDepartment: (oldName, newName) => {
      const n = newName.trim(); if (!n) return;
      setDepartments((p) => p.map((d) => (d === oldName ? n : d)));
      setUsers((p) => p.map((u) => (u.department === oldName ? { ...u, department: n } : u)));
    },
    deleteDepartment: (name) => {
      if (users.some((u) => u.department === name)) return;
      setDepartments((p) => p.filter((d) => d !== name));
    },
    sendMessage: (toId, body, attachments = [], opts) => {
      const fromId = opts?.fromId ?? currentUser?.id;
      if (!fromId) return;
      const msg: Message = {
        id: "m-" + Math.random().toString(36).slice(2, 8),
        fromId, toId, body, attachments,
        date: today(), read: false, system: opts?.system,
      };
      setMessages((p) => [...p, msg]);
      const recipient = users.find((u) => u.id === toId);
      if (recipient?.notifyEmail) {
        console.log(`[email] notify ${recipient.email}: новое сообщение от ${users.find((u) => u.id === fromId)?.name ?? "Система"}`);
      }
    },
    markThreadRead: (peerId) => {
      if (!currentUser) return;
      setMessages((p) => p.map((m) => (m.toId === currentUser.id && m.fromId === peerId && !m.read ? { ...m, read: true } : m)));
    },
    addToCart: (productId) => {
      setCart((p) => {
        const ex = p.find((c) => c.productId === productId);
        if (ex) return p.map((c) => (c.productId === productId ? { ...c, qty: c.qty + 1 } : c));
        return [...p, { productId, qty: 1 }];
      });
    },
    removeFromCart: (productId) => setCart((p) => p.filter((c) => c.productId !== productId)),
    updateCartQty: (productId, qty) => setCart((p) => qty <= 0 ? p.filter((c) => c.productId !== productId) : p.map((c) => (c.productId === productId ? { ...c, qty } : c))),
    clearCart: () => setCart([]),
    checkoutCart: () => {
      if (!currentUser) return { ok: false, message: "Не авторизован" };
      if (cart.length === 0) return { ok: false, message: "Корзина пуста" };
      const items = cart.map((c) => { const p = products.find((x) => x.id === c.productId); return p ? { p, qty: c.qty } : null; }).filter(Boolean) as { p: Product; qty: number }[];
      const total = items.reduce((s, i) => s + i.p.price * i.qty, 0);
      if (currentUser.balance < total) return { ok: false, message: `Недостаточно бонусов (нужно ${total})` };
      setUsers((prev) => prev.map((u) => u.id === currentUser.id ? {
        ...u, balance: u.balance - total,
        transactions: [
          ...items.map((i) => ({ id: "t-" + Math.random().toString(36).slice(2, 7), type: "debit" as const, amount: i.p.price * i.qty, reason: `Покупка: ${i.p.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`, date: today() })),
          ...u.transactions,
        ],
      } : u));
      if (adminUser && adminUser.id !== currentUser.id) {
        const lines = items.map((i) => `• ${i.p.name} ×${i.qty} — ${i.p.price * i.qty} ⭐`).join("\n");
        sendSystem(adminUser.id, `🛒 Новый заказ от ${currentUser.name}:\n${lines}\nИтого: ${total} бонусов.`);
      }
      setCart([]);
      return { ok: true, message: `Заказ оформлен! Списано ${total} бонусов.` };
    },
    addPoll: ({ question, description, options }) => {
      const poll: Poll = {
        id: "poll-" + Math.random().toString(36).slice(2, 7),
        question, description, createdAt: today().slice(0, 10),
        options: options.filter((o) => o.trim()).map((text, i) => ({ id: `o${i + 1}-${Math.random().toString(36).slice(2, 5)}`, text: text.trim(), votes: [] })),
      };
      setPolls((p) => [poll, ...p]);
    },
    updatePoll: (id, patch) => setPolls((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    deletePoll: (id) => setPolls((p) => p.filter((x) => x.id !== id)),
    votePoll: (pollId, optionId) => {
      if (!currentUser) return;
      const uid = currentUser.id;
      setPolls((prev) => prev.map((p) => {
        if (p.id !== pollId) return p;
        return {
          ...p,
          options: p.options.map((o) => ({
            ...o,
            votes: o.id === optionId
              ? (o.votes.includes(uid) ? o.votes : [...o.votes, uid])
              : o.votes.filter((v) => v !== uid),
          })),
        };
      }));
    },
    exportData: () => {
      const snapshot: PersistedState = { users, products, jobs, announcements, links, bonusRules, departments, messages, polls };
      return JSON.stringify(snapshot, null, 2);
    },
    importData: (json) => {
      try {
        const parsed = JSON.parse(json) as Partial<PersistedState>;
        if (parsed.users) setUsers(parsed.users);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.jobs) setJobs(parsed.jobs);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
        if (parsed.links) setLinks(parsed.links);
        if (parsed.bonusRules) setBonusRules(parsed.bonusRules);
        if (parsed.departments) setDepartments(parsed.departments);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.polls) setPolls(parsed.polls);
        return { ok: true, message: "Данные импортированы" };
      } catch (e) {
        return { ok: false, message: "Неверный JSON" };
      }
    },
    resetData: () => {
      const s = seedAll();
      setUsers(s.users); setProducts(s.products); setJobs(s.jobs);
      setAnnouncements(s.announcements); setLinks(s.links); setBonusRules(s.bonusRules);
      setDepartments(s.departments); setMessages(s.messages); setPolls(s.polls);
      setCart([]);
      if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    },
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
