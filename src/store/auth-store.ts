import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Role, Session, User } from "@/lib/types";
import { DEMO_CUSTOMER_ID } from "@/lib/mock/seed";
import { useDataStore } from "@/store/data-store";
import { uid } from "@/lib/format";

export const AUTH_STORAGE_KEY = "bella-napoli:auth";

/**
 * PROTOTYPE ONLY — simulated authentication.
 * Demo passwords live in source (never in localStorage). Self-registered demo
 * accounts store only a non-reversible demo hash. None of this is security.
 */
export const DEMO_PASSWORD = "Demo123!";

export const DEMO_ACCOUNTS: (User & { title: string })[] = [
  { id: "usr_customer", email: "customer@demo.com", name: "Sophia Romano", role: "customer", customerId: DEMO_CUSTOMER_ID, title: "Customer" },
  { id: "usr_manager", email: "manager@demo.com", name: "Marco Bellini", role: "manager", title: "Restaurant Manager" },
  { id: "usr_admin", email: "admin@demo.com", name: "Avery Collins", role: "admin", title: "Platform Super Admin" },
];

export const LOGIN_PATHS: Record<Role, string> = {
  customer: "/login",
  manager: "/manager/login",
  admin: "/super-admin/login",
};

export const HOME_PATHS: Record<Role, string> = {
  customer: "/account",
  manager: "/manager/dashboard",
  admin: "/super-admin/dashboard",
};

const PORTAL_NAMES: Record<Role, string> = {
  customer: "customer website",
  manager: "Restaurant Manager portal",
  admin: "Super Admin portal",
};

interface RegisteredAccount {
  id: string;
  email: string;
  name: string;
  customerId: string;
  passwordHash: string;
}

/** djb2 — demo obfuscation only, NOT a password hash. */
function demoHash(input: string) {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
  return `demo$${(h >>> 0).toString(36)}`;
}

export type AuthErrorCode = "invalidCredentials" | "wrongPortal" | "profileMissing" | "deactivated" | "emailTaken";

/** `error` is an English fallback; UIs translate `code`. */
export type LoginResult =
  | { ok: true; session: Session }
  | { ok: false; code: AuthErrorCode; error: string; wrongPortal?: Role };

interface AuthState {
  sessions: Partial<Record<Role, Session>>;
  registered: RegisteredAccount[];
  login: (portal: Role, email: string, password: string, remember?: boolean) => LoginResult;
  register: (input: { name: string; email: string; phone: string; password: string }) => LoginResult;
  logout: (role: Role) => void;
  updateSessionName: (role: Role, name: string, email?: string) => void;
  resetAccounts: () => void;
}

function makeSession(user: User, remember: boolean): Session {
  const now = Date.now();
  return {
    ...user,
    signedInAt: new Date(now).toISOString(),
    expiresAt: new Date(now + (remember ? 30 * 24 : 12) * 3_600_000).toISOString(),
    remember,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      sessions: {},
      registered: [],

      login: (portal, rawEmail, password, remember = true) => {
        const email = rawEmail.trim().toLowerCase();
        const demo = DEMO_ACCOUNTS.find((a) => a.email === email);
        const registered = get().registered.find((a) => a.email === email);

        let user: User | undefined;
        if (demo && password === DEMO_PASSWORD) {
          user = { id: demo.id, email: demo.email, name: demo.name, role: demo.role, customerId: demo.customerId };
        } else if (registered && registered.passwordHash === demoHash(password)) {
          user = { id: registered.id, email: registered.email, name: registered.name, role: "customer", customerId: registered.customerId };
        }
        if (!user) return { ok: false, code: "invalidCredentials", error: "Incorrect email or password. Check the demo credentials below." };

        if (user.role !== portal) {
          return {
            ok: false,
            code: "wrongPortal",
            wrongPortal: user.role,
            error: `This account doesn't have access here. Please sign in through the ${PORTAL_NAMES[user.role]}.`,
          };
        }

        if (user.role === "customer") {
          const customerId = user.customerId;
          const customer = useDataStore.getState().customers.find((c) => c.id === customerId);
          if (!customer) return { ok: false, code: "profileMissing", error: "We couldn't find this customer profile. Try resetting the demo data." };
          if (customer.status === "inactive") {
            return { ok: false, code: "deactivated", error: "This account has been deactivated by the platform. Contact support for help." };
          }
          user = { ...user, name: customer.name, email: customer.email };
        }

        const session = makeSession(user, remember);
        set((s) => ({ sessions: { ...s.sessions, [portal]: session } }));
        return { ok: true, session };
      },

      register: ({ name, email: rawEmail, phone, password }) => {
        const email = rawEmail.trim().toLowerCase();
        const data = useDataStore.getState();
        const taken =
          DEMO_ACCOUNTS.some((a) => a.email === email) ||
          get().registered.some((a) => a.email === email) ||
          data.customers.some((c) => c.email.toLowerCase() === email);
        if (taken) return { ok: false, code: "emailTaken", error: "An account with this email already exists. Try signing in instead." };

        const customerId = uid("cus");
        data.addCustomer({
          id: customerId,
          name: name.trim(),
          email,
          phone,
          joinedAt: new Date().toISOString(),
          status: "active",
          addresses: [],
        });
        const account: RegisteredAccount = {
          id: uid("usr"),
          email,
          name: name.trim(),
          customerId,
          passwordHash: demoHash(password),
        };
        const session = makeSession(
          { id: account.id, email, name: account.name, role: "customer", customerId },
          true,
        );
        set((s) => ({ registered: [...s.registered, account], sessions: { ...s.sessions, customer: session } }));
        return { ok: true, session };
      },

      logout: (role) =>
        set((s) => {
          const sessions = { ...s.sessions };
          delete sessions[role];
          return { sessions };
        }),

      updateSessionName: (role, name, email) =>
        set((s) => {
          const current = s.sessions[role];
          if (!current) return {};
          return { sessions: { ...s.sessions, [role]: { ...current, name, email: email ?? current.email } } };
        }),

      resetAccounts: () =>
        set((s) => {
          // Keep built-in demo sessions; drop sessions for self-registered accounts
          const sessions = { ...s.sessions };
          if (sessions.customer && sessions.customer.customerId !== DEMO_CUSTOMER_ID) delete sessions.customer;
          return { registered: [], sessions };
        }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export function isSessionValid(session: Session | undefined): session is Session {
  return !!session && new Date(session.expiresAt).getTime() > Date.now();
}
