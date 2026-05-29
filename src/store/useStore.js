import { create } from 'zustand';
import { generateTrains, STATION_MAP, TICKET_TYPES } from '../data/trainData';

const LS = {
  get: (key, fb) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (key, v)  => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} },
};

const uid = (p = 'id') => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const nextWeek  = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

const SEED_USERS = [
  { id: 'user-demo', name: '陳大明', email: 'demo@example.com', phone: '0912-345-678', password: 'demo123' },
  { id: 'user-2',    name: '林小美', email: 'user2@example.com', phone: '0987-654-321', password: 'demo123' },
];

const SEED_ORDERS = [
  {
    id: 'ORD-DEMO-001',
    userId: 'user-demo',
    bookingNo: 'TR8821039401',
    train: {
      id: 'express-taipei-kaohsiung-demo',
      trainNo: 'ZQ1035',
      type: 'express',
      from: 'taipei', fromName: '台北',
      to: 'kaohsiung', toName: '高雄',
      date: yesterday,
      depTime: '08:30', arrTime: '12:15',
      duration: 225, basePrice: 650,
    },
    tickets: [
      { typeId: 'adult', typeName: '全票', count: 2, unitPrice: 650, subtotal: 1300 },
    ],
    passengers: [
      { name: '陳大明', phone: '0912-345-678', idNo: 'A123456789', ticketType: 'adult', ticketTypeName: '全票' },
      { name: '陳小芳', phone: '0912-345-678', idNo: 'B234567890', ticketType: 'adult', ticketTypeName: '全票' },
    ],
    seatPref: 'window',
    paymentMethod: 'credit',
    totalAmount: 1300,
    status: 'used',
    createdAt: Date.now() - 2 * 86400000,
    paidAt:    Date.now() - 2 * 86400000,
  },
  {
    id: 'ORD-DEMO-002',
    userId: 'user-demo',
    bookingNo: 'TR9932087612',
    train: {
      id: 'taroko-taipei-tainan-demo',
      trainNo: 'TR0223',
      type: 'taroko',
      from: 'taipei', fromName: '台北',
      to: 'tainan', toName: '台南',
      date: nextWeek,
      depTime: '09:00', arrTime: '11:40',
      duration: 160, basePrice: 738,
    },
    tickets: [
      { typeId: 'adult', typeName: '全票',   count: 1, unitPrice: 738, subtotal: 738 },
      { typeId: 'child', typeName: '孩童票', count: 1, unitPrice: 369, subtotal: 369 },
    ],
    passengers: [
      { name: '陳大明', phone: '0912-345-678', idNo: 'A123456789', ticketType: 'adult', ticketTypeName: '全票' },
      { name: '陳小寶', phone: '0912-345-678', idNo: '',            ticketType: 'child', ticketTypeName: '孩童票' },
    ],
    seatPref: 'window',
    paymentMethod: 'linepay',
    totalAmount: 1107,
    status: 'paid',
    createdAt: Date.now() - 3600000,
    paidAt:    Date.now() - 3600000,
  },
];

function init() {
  if (!LS.get('tr_users', null))  LS.set('tr_users',  SEED_USERS);
  if (!LS.get('tr_orders', null)) LS.set('tr_orders', SEED_ORDERS);
}
init();

const DEFAULT_SEARCH = {
  queryType: 'basic',
  from: 'taipei',
  to: 'kaohsiung',
  date: tomorrow,
  timeSlot: 'all',
  carType: 'any',
  transferAllowed: false,
  seatPref: 'any',
  ticketCounts: { adult: 1, child: 0, senior: 0, disability: 0, student: 0 },
};

const useStore = create((set, get) => ({
  currentUser:   LS.get('tr_current', null),
  users:         LS.get('tr_users', SEED_USERS),
  searchParams:  DEFAULT_SEARCH,
  searchResults: [],
  selectedTrain: null,
  orders:        LS.get('tr_orders', SEED_ORDERS),
  paymentResult: null,

  // ── Auth ──────────────────────────────────────────────────────
  login: (email, password) => {
    const user = get().users.find(u => u.email === email && u.password === password);
    if (!user) return false;
    LS.set('tr_current', user);
    set({ currentUser: user });
    return true;
  },

  logout: () => {
    LS.set('tr_current', null);
    set({ currentUser: null });
  },

  register: (name, email, password) => {
    if (get().users.find(u => u.email === email)) return null;
    const user = { id: uid('user'), name, email, password, phone: '' };
    const users = [...get().users, user];
    LS.set('tr_users', users);
    LS.set('tr_current', user);
    set({ users, currentUser: user });
    return user;
  },

  // ── Search ────────────────────────────────────────────────────
  setSearchParams: (p) => set({ searchParams: { ...get().searchParams, ...p } }),

  searchTrains: (params) => {
    const merged = { ...get().searchParams, ...params };
    const results = generateTrains(merged);
    set({ searchResults: results, searchParams: merged });
    return results;
  },

  selectTrain: (train) => set({ selectedTrain: train }),

  // ── Orders ────────────────────────────────────────────────────
  createOrder: ({ train, tickets, passengers, seatPref }) => {
    const user = get().currentUser;
    if (!user) return null;
    const order = {
      id: uid('ORD'),
      userId: user.id,
      bookingNo: null,
      train: { ...train, fromName: STATION_MAP[train.from] ?? train.from, toName: STATION_MAP[train.to] ?? train.to },
      tickets,
      passengers,
      seatPref,
      paymentMethod: null,
      totalAmount: tickets.reduce((s, t) => s + t.subtotal, 0),
      status: 'pending',
      createdAt: Date.now(),
      paidAt: null,
    };
    const orders = [...get().orders, order];
    LS.set('tr_orders', orders);
    set({ orders });
    return order.id;
  },

  processPayment: (orderId, method, cardNumber = '') => {
    const orders = get().orders;
    const order  = orders.find(o => o.id === orderId);
    if (!order) return { success: false, reason: '找不到訂單' };

    // Fail if credit card starts with 0000 (demo failure case)
    const fail = method === 'credit' && cardNumber.replace(/\s/g, '').startsWith('0000');
    if (fail) {
      const result = { success: false, reason: '信用卡授權失敗，請確認卡號是否正確', orderId };
      set({ paymentResult: result });
      return result;
    }

    const bookingNo = `TR${Date.now().toString().slice(-10)}`;
    const updated = { ...order, status: 'paid', paymentMethod: method, bookingNo, paidAt: Date.now() };
    const newOrders = orders.map(o => o.id === orderId ? updated : o);
    LS.set('tr_orders', newOrders);
    const result = { success: true, bookingNo, orderId };
    set({ orders: newOrders, paymentResult: result });
    return result;
  },

  cancelOrder: (orderId) => {
    const orders = get().orders.map(o =>
      o.id === orderId ? { ...o, status: 'cancelled', cancelledAt: Date.now() } : o
    );
    LS.set('tr_orders', orders);
    set({ orders });
  },

  requestRefund: (orderId) => {
    const orders = get().orders.map(o =>
      o.id === orderId ? { ...o, status: 'refunded', refundedAt: Date.now() } : o
    );
    LS.set('tr_orders', orders);
    set({ orders });
    return true;
  },

  changeTicket: (orderId, newTrain, priceDiff) => {
    const orders = get().orders;
    const order  = orders.find(o => o.id === orderId);
    if (!order) return false;
    const updated = {
      ...order,
      status: 'changed',
      train: { ...newTrain, fromName: STATION_MAP[newTrain.from] ?? newTrain.from, toName: STATION_MAP[newTrain.to] ?? newTrain.to },
      totalAmount: order.totalAmount + priceDiff,
      changedAt: Date.now(),
    };
    const newOrders = orders.map(o => o.id === orderId ? updated : o);
    LS.set('tr_orders', newOrders);
    set({ orders: newOrders });
    return true;
  },

  getOrder: (id) => get().orders.find(o => o.id === id),

  getUserOrders: () => {
    const user = get().currentUser;
    return user ? get().orders.filter(o => o.userId === user.id) : [];
  },

  clearPaymentResult: () => set({ paymentResult: null }),
}));

export default useStore;
