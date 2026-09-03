"use client";

import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
      <LogOut className="h-3.5 w-3.5" />
      Log Out
    </Button>
  );
}
