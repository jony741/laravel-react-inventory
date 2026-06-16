import { LayoutGrid, Settings, Tag, FolderTree, Store } from 'lucide-react';
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
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
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
                <NavMain items={settingsNavItems} label="Settings" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
