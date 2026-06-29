import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Building2,
    CalendarDays,
    ClipboardList,
    CreditCard,
    FileText,
    FlaskConical,
    LayoutDashboard,
    Package,
    Receipt,
    ShoppingBag,
    ShoppingCart,
    Store,
    TrendingUp,
    Users,
    Warehouse,
} from 'lucide-react';
import AppLogo from './app-logo';

interface NavGroupProps {
    title: string;
    items: NavItem[];
}

function NavGroup({ title, items }: NavGroupProps) {
    if (items.length === 0) return null;
    return (
        <div className="mb-1">
            <div className="text-sidebar-foreground/50 mb-1 px-4 text-[11px] font-semibold tracking-wider uppercase">
                {title}
            </div>
            <NavMain items={items} />
        </div>
    );
}

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    
    const isAdmin = user?.roles?.includes('admin');
    const isOwner = user?.roles?.includes('owner');
    
    // ── Platform Admin Navigation ──
    if (isAdmin) {
        const adminMainItems: NavItem[] = [
            {
                title: 'Admin Dashboard',
                href: '/admin',
                icon: LayoutDashboard,
            },
        ];

        const adminGroupItems: NavItem[] = [
            {
                title: 'Daftar Tenant',
                href: '/admin/tenants',
                icon: Building2,
            },
            {
                title: 'Daftar Pengguna',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Paket Langganan',
                href: '/admin/plans',
                icon: CreditCard,
            },
        ];

        return (
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/admin" prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <NavMain items={adminMainItems} />
                    <NavGroup title="Platform Admin" items={adminGroupItems} />
                </SidebarContent>

                <SidebarFooter>
                    <NavUser />
                </SidebarFooter>
            </Sidebar>
        );
    }

    // ── Tenant Business Navigation (Owner & Staff) ──
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
    ];

    const inventoryNavItems: NavItem[] = [
        {
            title: 'Produk (Bahan)',
            href: '/inventory',
            icon: Package,
        },
        {
            title: 'Stok Masuk',
            href: '/inventory/stock-in',
            icon: ShoppingCart,
        },
        {
            title: 'Stok Keluar',
            href: '/inventory/stock-out',
            icon: Warehouse,
        },
        {
            title: 'Stok Opname',
            href: '/inventory/opname',
            icon: FileText,
        },
    ];

    // Variant & Order nav (visible to owner and staff)
    const salesNavItems: NavItem[] = [
        {
            title: 'Varian Produk',
            href: '/variants',
            icon: FlaskConical,
        },
        {
            title: 'Pesanan',
            href: '/orders',
            icon: ClipboardList,
        },
        {
            title: 'POS Kasir',
            href: '/pos',
            icon: ShoppingBag,
        },
    ];

    // Finance items are only visible to the tenant owner
    const financeNavItems: NavItem[] = isOwner ? [
        {
            title: 'Ringkasan',
            href: '/finance',
            icon: BarChart3,
        },
        {
            title: 'Transaksi',
            href: '/finance/transactions',
            icon: Receipt,
        },
        {
            title: 'Laporan Penjualan',
            href: '/finance/sales-report',
            icon: TrendingUp,
        },
        {
            title: 'Laporan Pengeluaran',
            href: '/finance/expense-report',
            icon: CreditCard,
        },
    ] : [];

    // Business items are role-dependent
    const businessNavItems: NavItem[] = [
        {
            title: 'Event',
            href: '/events',
            icon: CalendarDays,
        },
        {
            title: 'Komunitas',
            href: '/community',
            icon: Users,
        },
        {
            title: 'Supplier',
            href: '/suppliers',
            icon: Store,
        },
        {
            title: 'Pajak',
            href: isOwner ? '/tax' : '/tax/consultation',
            icon: Building2,
        },
    ];

    // Subscription & Team management are only visible to the owner
    if (isOwner) {
        businessNavItems.push({
            title: 'Anggota Tim',
            href: '/members',
            icon: Users,
        });
        businessNavItems.push({
            title: 'Langganan',
            href: '/subscription',
            icon: CreditCard,
        });
        salesNavItems.unshift({
            title: 'Resep (BOM)',
            href: '/recipes',
            icon: BookOpen,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavGroup title="Inventori" items={inventoryNavItems} />
                <NavGroup title="Penjualan" items={salesNavItems} />
                {isOwner && <NavGroup title="Keuangan" items={financeNavItems} />}
                <NavGroup title="Bisnis" items={businessNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
