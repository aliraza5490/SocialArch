'use client';

import { UserMenu } from '@/components/UserMenu';

export function NavUser({
  user,
  logout,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  logout: () => void;
}) {
  return <UserMenu user={user} logout={logout} variant="sidebar" />;
}
