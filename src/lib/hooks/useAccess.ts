"use client";

import { useEffect, useState } from "react";
import { getAccessStatus } from "@/lib/actions/billing";
import type { AccessStatus } from "@/lib/actions/billing";

export function useAccess() {
  const [access, setAccess] = useState<AccessStatus | null>(null);

  useEffect(() => {
    console.log("[useAccess] calling getAccessStatus...");
    getAccessStatus()
      .then((result) => {
        console.log("[useAccess] result:", result);
        setAccess(result);
      })
      .catch((err) => {
        console.error("[useAccess] getAccessStatus failed:", err);
        setAccess({ status: "trial", daysLeft: 14 });
      });
  }, []);

  const isExpired  = access?.status === "expired";
  const isActive   = access?.status === "active";
  const isTrial    = access?.status === "trial";
  const daysLeft   = access?.status === "trial" ? access.daysLeft : null;

  return { access, isExpired, isActive, isTrial, daysLeft, loading: access === null };
}
