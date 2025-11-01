function getRoleBasedDashboard(role: string): string {
  switch (role) {
    case "VENDOR":
      return "/vendor/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "SUPER_ADMIN":
      return "/superadmin/dashboard";
    default:
      return "/signin";
  }
}

export { getRoleBasedDashboard };
