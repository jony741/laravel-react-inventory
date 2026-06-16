import { LayoutGrid, Settings, Tag, FolderTree, Store, Users, Building2 } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as indexBrands } from '@/routes/brands';
import { index as indexCategories } from '@/routes/categories';
import { index as indexStores } from '@/routes/stores';
import { index as indexCustomers } from '@/routes/customers';
import { index as indexSuppliers } from '@/routes/suppliers';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const crmNavItems: NavItem[] = [
    {
        title: 'Customers',
        href: indexCustomers(),
        icon: Users,
    },
    {
        title: 'Suppliers',
        href: indexSuppliers(),
        icon: Building2,
    },
];

const settingsNavItems: NavItem[] = [
    {
        title: 'Stores',
        href: indexStores(),
        icon: Store,
    },
    {
        title: 'Brands',
        href: indexBrands(),
        icon: Tag,
    },
    {
        title: 'Categories',
        href: indexCategories(),
        icon: FolderTree,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavMain items={crmNavItems} label="CRM" />
                <NavMain items={settingsNavItems} label="Settings" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
