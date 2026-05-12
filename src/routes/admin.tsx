import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (!user) throw redirect({ to: "/auth/login" });
    if (user.role !== "company_admin") throw redirect({ to: "/worker/home" });
  },
  component: () => <Outlet />,
});
