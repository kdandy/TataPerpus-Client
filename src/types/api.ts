export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UserRole = "PNS" | "PJLP";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
