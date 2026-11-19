export const dashboardRoles = ["customer", "vendor", "admin"] as const;

export type DashboardRole = (typeof dashboardRoles)[number];

export function isDashboardRole(role: unknown): role is DashboardRole {
  return (
    typeof role === "string" &&
    dashboardRoles.some((dashboardRole) => dashboardRole === role)
  );
}
