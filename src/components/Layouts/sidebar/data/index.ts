import * as Icons from "../icons";
import { ElementType } from "react";

// Define types for the navigation structure
export interface SubNavItem {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  icon: ElementType;
  url: string;
  items?: SubNavItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_DATA: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Statistics",
        icon: Icons.PieChart,
        url: "/dashboard/statistics",
        items: [],
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Clients",
        url: "/clients",
        icon: Icons.ClientsIcon,
        items: [],
      },
      {
        title: "Expenses",
        url: "/expenses",
        icon: Icons.ExpensesIcon,
        items: [],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Icons.Settings,
        items: [],
      },
      // {
      //   title: "Profile",
      //   url: "/profile",
      //   icon: Icons.User,
      //   items: [],
      // },
      // {
      //   title: "Forms",
      //   icon: Icons.Alphabet,
      //   items: [
      //     {
      //       title: "Form Elements",
      //       url: "/forms/form-elements",
      //     },
      //     {
      //       title: "Form Layout",
      //       url: "/forms/form-layout",
      //     },
      //   ],
      // },
      // {
      //   title: "Tables",
      //   url: "/tables",
      //   icon: Icons.Table,
      //   items: [
      //     {
      //       title: "Tables",
      //       url: "/tables",
      //     },
      //   ],
      // },
      // {
      //   title: "Pages",
      //   icon: Icons.Alphabet,
      //   items: [
      //     {
      //       title: "Settings",
      //       url: "/pages/settings",
      //     },
      //   ],
      // },
    ],
  },
  {
    label: " ",
    items: []
    // items: [
      // {
      //   title: "Charts",
      //   icon: Icons.PieChart,
      //   items: [
      //     {
      //       title: "Basic Chart",
      //       url: "/charts/basic-chart",
      //     },
      //   ],
      // },
      // {
      //   title: "UI Elements",
      //   icon: Icons.FourCircle,
      //   items: [
      //     {
      //       title: "Alerts",
      //       url: "/ui-elements/alerts",
      //     },
      //     {
      //       title: "Buttons",
      //       url: "/ui-elements/buttons",
      //     },
      //   ],
      // },
      // {
      //   title: "Authentication",
      //   icon: Icons.Authentication,
      //   items: [
      //     {
      //       title: "Sign In",
      //       url: "/auth/sign-in",
      //     },
      //   ],
      // },
    // ],
  },
];
