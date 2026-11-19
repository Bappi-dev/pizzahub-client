import { LucideIcon } from "lucide-react";

export type TCustomerRole = "admin" | "user" | "branchManager";


export type TCustemer = {
     name: string,
     email: string, 
     role?: string | null;
}


export type  TDashboardSidebarItem = {
      title: string ,
      href: string , 
      icon: LucideIcon,
      roles?: TCustomerRole[];
}