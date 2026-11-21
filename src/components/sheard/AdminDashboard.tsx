"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  PackageSearch,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  Utensils,
  XCircle,
} from "lucide-react";

type Totals = {
  users: number;
  vendors: number;
  customers: number;
  menuItems: number;
  pendingItems: number;
  transactions: number;
};
type ChartPoint = { date: string; amount: number };
type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  blocked: boolean;
};
type MenuItem = {
  id: string;
  name: string;
  itemImage: string;
  category: string;
  price: number;
  vendorName: string;
  status: string;
  approvalStatus: string;
  createdAt: string;
};
type Transaction = {
  id: string;
  vendor: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

const tabs = ["Overview", "Users", "Menu Items", "Transactions"] as const;
type Tab = (typeof tabs)[number];

function getError(value: unknown, fallback: string) {
  return typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
    ? value.error
    : fallback;
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [totals, setTotals] = useState<Totals | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [itemFilter, setItemFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    function syncTabWithHash() {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#users") setTab("Users");
      else if (hash === "#menu") setTab("Menu Items");
      else if (hash === "#transactions") setTab("Transactions");
      else setTab("Overview");
    }
    syncTabWithHash();
    window.addEventListener("hashchange", syncTabWithHash);
    return () => window.removeEventListener("hashchange", syncTabWithHash);
  }, []);

  async function load(resource: "overview" | "users" | "menu" | "transactions") {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/admin?resource=${resource}`);
      const value: unknown = await response.json();
      if (!response.ok) throw new Error(getError(value, "Could not load admin data."));
      if (typeof value !== "object" || value === null) throw new Error("Invalid server response.");
      if (resource === "overview" && "totals" in value) {
        setTotals(value.totals as Totals);
        setChart(
          "chart" in value && Array.isArray(value.chart)
            ? (value.chart as ChartPoint[])
            : [],
        );
      }
      if (resource === "users" && "users" in value) setUsers(value.users as AdminUser[]);
      if (resource === "menu" && "items" in value) setItems(value.items as MenuItem[]);
      if (resource === "transactions" && "transactions" in value) {
        setTransactions(value.transactions as Transaction[]);
      }
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load admin data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const resource =
      tab === "Overview"
        ? "overview"
        : tab === "Users"
          ? "users"
          : tab === "Menu Items"
            ? "menu"
            : "transactions";
    void Promise.resolve().then(() => load(resource));
  }, [tab]);

  async function changeUser(user: AdminUser) {
    setBusyId(user.id);
    setErrorMessage(null);
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
      const tokenResponse = await fetch(`${apiBaseUrl}/api/auth/token`, {
        credentials: "include",
      });
      const tokenValue: unknown = await tokenResponse.json();
      if (!tokenResponse.ok) {
        throw new Error(getError(tokenValue, "Could not authenticate request."));
      }
      if (
        typeof tokenValue !== "object" ||
        tokenValue === null ||
        !("token" in tokenValue) ||
        typeof tokenValue.token !== "string"
      ) {
        throw new Error("The server returned an invalid access token.");
      }

      const response = await fetch(
        `${apiBaseUrl}/api/admin/users/${encodeURIComponent(user.id)}`,
        {
          method: "PATCH",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenValue.token}`,
          },
          body: JSON.stringify({ blocked: !user.blocked }),
        },
      );
      const value: unknown = await response.json();
      if (!response.ok) throw new Error(getError(value, "Could not update user."));
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, blocked: !item.blocked } : item,
        ),
      );
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not update user.");
    } finally {
      setBusyId(null);
    }
  }

  async function changeMenu(id: string, payload: { approvalStatus: string } | { status: string }) {
    setBusyId(id);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/admin/menu-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const value: unknown = await response.json();
      if (!response.ok) throw new Error(getError(value, "Could not update menu item."));
      await load("menu");
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not update menu item.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteMenu(id: string) {
    if (!window.confirm("Delete this menu item?")) return;
    setBusyId(id);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/admin/menu-items/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const value: unknown = await response.json();
        throw new Error(getError(value, "Could not delete menu item."));
      }
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not delete menu item.");
    } finally {
      setBusyId(null);
    }
  }

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);
    return matchesSearch && (roleFilter === "all" || user.role === roleFilter);
  });
  const filteredItems = items.filter((item) => {
    const query = search.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.vendorName.toLowerCase().includes(query);
    const normalized = item.approvalStatus.toLowerCase();
    return matchesSearch && (itemFilter === "all" || normalized === itemFilter);
  });
  const filteredTransactions = transactions.filter((transaction) =>
    `${transaction.vendor} ${transaction.plan} ${transaction.status}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const metricCards = totals
    ? [
        ["Total users", totals.users, Users, "bg-[#FCE9E3] text-[#B34B31]"],
        ["Vendors", totals.vendors, ShieldCheck, "bg-amber-50 text-amber-800"],
        ["Customers", totals.customers, Users, "bg-blue-50 text-blue-700"],
        ["Menu items", totals.menuItems, Utensils, "bg-green-50 text-green-700"],
        ["Pending items", totals.pendingItems, Clock3, "bg-orange-50 text-orange-700"],
        ["Transactions", totals.transactions, CreditCard, "bg-violet-50 text-violet-700"],
      ]
    : [];

  const maxChartAmount = Math.max(...chart.map((point) => point.amount), 1);

  return (
    <section className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A4442F]">
          Admin workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#30231B] sm:text-4xl">
          Platform dashboard
        </h1>
      </header>

      <nav className="mb-6 flex gap-2 overflow-x-auto border-b border-[#E8DED3]">
        {tabs.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              setTab(name);
              setSearch("");
              const hash =
                name === "Users"
                  ? "#users"
                  : name === "Menu Items"
                    ? "#menu"
                    : name === "Transactions"
                      ? "#transactions"
                      : "";
              window.history.replaceState(null, "", `${window.location.pathname}${hash}`);
            }}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
              tab === name
                ? "border-[#B34B31] text-[#B34B31]"
                : "border-transparent text-[#75685F] hover:text-[#30231B]"
            }`}
          >
            {name}
          </button>
        ))}
      </nav>

      {errorMessage && (
        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div role="status" className="flex min-h-52 items-center justify-center gap-3 rounded-2xl border border-[#E8DED3] bg-white text-sm text-[#75685F]">
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-[#B34B31]" />
          Loading admin data...
        </div>
      ) : (
        <>
          {tab === "Overview" && totals && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {metricCards.map(([label, value, Icon, colors]) => (
                  <article key={String(label)} className="rounded-2xl border border-[#E8DED3] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className={`grid size-11 place-items-center rounded-xl ${String(colors)}`}>
                        {typeof Icon === "function" && <Icon aria-hidden="true" className="size-5" />}
                      </span>
                      <span className="text-3xl font-extrabold text-[#30231B]">{String(value)}</span>
                    </div>
                    <p className="mt-4 text-sm font-bold text-[#75685F]">{String(label)}</p>
                  </article>
                ))}
              </div>
              <article className="rounded-2xl border border-[#E8DED3] bg-white p-5 shadow-sm">
                <h2 className="font-bold text-[#30231B]">Recent transaction volume</h2>
                {chart.length ? (
                  <div className="mt-5 flex h-52 items-end gap-3">
                    {chart.map((point, index) => (
                      <div key={`${point.date}-${index}`} className="flex h-full flex-1 flex-col justify-end gap-2">
                        <div
                          title={`${point.amount} ${point.date}`}
                          className="w-full rounded-t-lg bg-[#B34B31]"
                          style={{ height: `${Math.max((point.amount / maxChartAmount) * 100, 6)}%` }}
                        />
                        <span className="truncate text-center text-[10px] text-[#8B7D72]">{point.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 grid h-52 place-items-center rounded-xl bg-[#FFF9F2] text-sm text-[#75685F]">
                    No transaction data yet
                  </div>
                )}
              </article>
            </div>
          )}

          {(tab === "Users" || tab === "Menu Items" || tab === "Transactions") && (
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8B7D72]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${tab.toLowerCase()}...`}
                  className="h-11 w-full rounded-xl border border-[#E0D5C8] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#B34B31] focus:ring-2 focus:ring-[#B34B31]/15"
                />
              </label>
              {tab === "Users" && (
                <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-11 rounded-xl border border-[#E0D5C8] bg-white px-3 text-sm">
                  <option value="all">All roles</option>
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </select>
              )}
              {tab === "Menu Items" && (
                <select value={itemFilter} onChange={(event) => setItemFilter(event.target.value)} className="h-11 rounded-xl border border-[#E0D5C8] bg-white px-3 text-sm">
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              )}
            </div>
          )}

          {tab === "Users" && (
            <div className="overflow-x-auto rounded-2xl border border-[#E8DED3] bg-white">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#FFF9F2] text-xs uppercase tracking-wide text-[#75685F]">
                  <tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Plan</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-[#EFE8DF]">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-4"><p className="font-bold text-[#30231B]">{user.name}</p><p className="text-xs text-[#8B7D72]">{user.email}</p></td>
                      <td className="px-5 py-4 capitalize">{user.role}</td>
                      <td className="px-5 py-4 capitalize">{user.plan}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.blocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{user.blocked ? "Blocked" : "Active"}</span></td>
                      <td className="px-5 py-4 text-right">
                        <button type="button" disabled={busyId === user.id} onClick={() => void changeUser(user)} className={`rounded-lg px-3 py-2 text-xs font-bold ${user.blocked ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{busyId === user.id ? "Saving..." : user.blocked ? "Unblock" : "Block"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredUsers.length && <p className="p-8 text-center text-sm text-[#75685F]">No users found.</p>}
            </div>
          )}

          {tab === "Menu Items" && (
            <div className="overflow-x-auto rounded-2xl border border-[#E8DED3] bg-white">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[#FFF9F2] text-xs uppercase tracking-wide text-[#75685F]">
                  <tr><th className="px-5 py-4">Item</th><th className="px-5 py-4">Vendor</th><th className="px-5 py-4">Approval</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-[#EFE8DF]">
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4"><p className="font-bold text-[#30231B]">{item.name}</p><p className="text-xs text-[#8B7D72]">{item.category} · ${item.price}</p></td>
                      <td className="px-5 py-4">{item.vendorName}</td>
                      <td className="px-5 py-4 capitalize">{item.approvalStatus}</td>
                      <td className="px-5 py-4">
                        <select value={item.status === "active" ? "active" : "inactive"} onChange={(event) => void changeMenu(item.id, { status: event.target.value })} disabled={busyId === item.id || item.approvalStatus === "rejected"} className="rounded-lg border border-[#E0D5C8] bg-white px-2 py-1.5 text-xs">
                          <option value="active">Active</option><option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {item.approvalStatus !== "approved" && <button type="button" title="Approve" disabled={busyId === item.id} onClick={() => void changeMenu(item.id, { approvalStatus: "approved" })} className="grid size-9 place-items-center rounded-lg bg-green-50 text-green-700"><CheckCircle2 className="size-4" /></button>}
                          {item.approvalStatus !== "rejected" && <button type="button" title="Reject" disabled={busyId === item.id} onClick={() => void changeMenu(item.id, { approvalStatus: "rejected" })} className="grid size-9 place-items-center rounded-lg bg-amber-50 text-amber-700"><XCircle className="size-4" /></button>}
                          <button type="button" title="Delete" disabled={busyId === item.id} onClick={() => void deleteMenu(item.id)} className="grid size-9 place-items-center rounded-lg bg-red-50 text-red-700"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredItems.length && <p className="p-8 text-center text-sm text-[#75685F]">No menu items found.</p>}
            </div>
          )}

          {tab === "Transactions" && (
            <div className="overflow-x-auto rounded-2xl border border-[#E8DED3] bg-white">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#FFF9F2] text-xs uppercase tracking-wide text-[#75685F]">
                  <tr><th className="px-5 py-4">Vendor</th><th className="px-5 py-4">Plan</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Date</th></tr>
                </thead>
                <tbody className="divide-y divide-[#EFE8DF]">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-5 py-4 font-bold text-[#30231B]">{transaction.vendor}</td>
                      <td className="px-5 py-4 capitalize">{transaction.plan}</td>
                      <td className="px-5 py-4 font-bold">{transaction.currency.toUpperCase()} {transaction.amount.toFixed(2)}</td>
                      <td className="px-5 py-4"><span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold capitalize text-green-700">{transaction.status}</span></td>
                      <td className="px-5 py-4 text-[#75685F]">{formatDate(transaction.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredTransactions.length && (
                <div className="grid min-h-44 place-items-center text-center text-sm text-[#75685F]">
                  <div><PackageSearch className="mx-auto mb-2 size-6" /><p>No payment records yet.</p></div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
