"use client";

import { RequireAuth } from "@/lib/auth/RequireAuth";
import { ProfileView } from "./ProfileView";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileView />
    </RequireAuth>
  );
}
