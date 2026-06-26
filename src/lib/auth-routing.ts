import type { UserRole } from "../types/api";

export function getRoleHomePath(role: UserRole) {
  return role === "PNS" ? "/admin/dashboard" : "/app/infobase";
}
