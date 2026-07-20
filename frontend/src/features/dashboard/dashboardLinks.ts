import type { UserRole } from "../auth/types";

type DashboardLink = {
    title: string;
    description: string;
    href: string;
    allowedRoles: UserRole[];
};

export const dashboardLinks: DashboardLink[] = [
    {   
        title: "Tables",
        description: "View tables, table status, and active table orders.",
        href: "/tables",
        allowedRoles: ["admin", "manager", "server", "host"]
    },
    {
        title: "Orders",
        description: "Create, view, update, close, and cancel orders",
        href: "/orders",
        allowedRoles: ["admin", "manager", "server", "cashier"]
    },
    {
        title: "Payments",
        description: "Create and manage payments for customer orders.",
        href: "/payments",
        allowedRoles: ["admin", "manager", "cashier"]
    },
    {
        title: "Kitchen",
        description: "View submitted and ready kitchen order items.",
        href: "/kitchen",
        allowedRoles: ["admin", "manager", "kitchen"]
    },
    {
        title: "Reports",
        description: "View sales, payment method, top item, and balance reports.",
        href: "/reports",
        allowedRoles: ["admin", "manager"]
    },
    {
        title: "Users",
        description: "Create, update, and deactivate staff users.",
        href: "/users",
        allowedRoles: ["admin", "manager"]
    }
];

export const getDashboardLinksForRole = (role: UserRole) => {
    return dashboardLinks.filter((link) => link.allowedRoles.includes(role));
};


