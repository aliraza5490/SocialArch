import { UserRole } from "@/shared/types";
import { SetMetadata } from "@nestjs/common";

export const Roles = (...roles: UserRole[]) => SetMetadata("roles", roles);
