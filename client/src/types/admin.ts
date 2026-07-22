export type AdminRole =
  | 'super_admin'
  | 'admin'
  | 'product_manager'
  | 'inventory_manager'
  | 'customer_support'
  | 'content_manager'
  | 'marketing_manager'
  | 'finance_manager'
  | 'manager'
  | 'orders_manager'
  | 'content_editor';

export type AdminModule =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'inventory'
  | 'customers'
  | 'coupons'
  | 'collections'
  | 'cms'
  | 'media'
  | 'analytics'
  | 'finance'
  | 'marketing'
  | 'settings'
  | 'audit-logs';

export interface NavItem {
  id: AdminModule;
  label: string;
  href: string;
  iconName: string;
  roles: AdminRole[];
  badge?: string;
  category: 'Core' | 'Catalog' | 'Growth' | 'System';
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    href: '/admin',
    iconName: 'Grid',
    roles: [
      'super_admin',
      'admin',
      'manager',
      'product_manager',
      'inventory_manager',
      'customer_support',
      'content_manager',
      'marketing_manager',
      'finance_manager',
    ],
    category: 'Core',
  },
  {
    id: 'orders',
    label: 'Orders & Fulfillment',
    href: '/admin/orders',
    iconName: 'ShoppingBag',
    roles: ['super_admin', 'admin', 'manager', 'orders_manager', 'customer_support', 'finance_manager'],
    category: 'Core',
  },
  {
    id: 'products',
    label: 'Products',
    href: '/admin/products',
    iconName: 'Package',
    roles: ['super_admin', 'admin', 'manager', 'product_manager', 'inventory_manager'],
    category: 'Catalog',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    href: '/admin/inventory',
    iconName: 'Layers',
    roles: ['super_admin', 'admin', 'manager', 'product_manager', 'inventory_manager'],
    category: 'Catalog',
  },
  {
    id: 'collections',
    label: 'Collections',
    href: '/admin/collections',
    iconName: 'Folder',
    roles: ['super_admin', 'admin', 'manager', 'product_manager', 'content_manager'],
    category: 'Catalog',
  },
  {
    id: 'customers',
    label: 'Customers & CRM',
    href: '/admin/customers',
    iconName: 'Users',
    roles: ['super_admin', 'admin', 'manager', 'customer_support', 'marketing_manager'],
    category: 'Growth',
  },
  {
    id: 'coupons',
    label: 'Coupons & Discounts',
    href: '/admin/coupons',
    iconName: 'Tag',
    roles: ['super_admin', 'admin', 'manager', 'marketing_manager'],
    category: 'Growth',
  },
  {
    id: 'cms',
    label: 'CMS & Storefront',
    href: '/admin/cms',
    iconName: 'Layout',
    roles: ['super_admin', 'admin', 'manager', 'content_manager', 'content_editor'],
    category: 'Catalog',
  },
  {
    id: 'media',
    label: 'Media Library',
    href: '/admin/media',
    iconName: 'Image',
    roles: ['super_admin', 'admin', 'manager', 'content_manager', 'product_manager'],
    category: 'Catalog',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/admin/analytics',
    iconName: 'BarChart',
    roles: ['super_admin', 'admin', 'manager', 'finance_manager', 'marketing_manager'],
    category: 'Growth',
  },
  {
    id: 'finance',
    label: 'Finance & GST',
    href: '/admin/finance',
    iconName: 'DollarSign',
    roles: ['super_admin', 'admin', 'manager', 'finance_manager'],
    category: 'Growth',
  },
  {
    id: 'marketing',
    label: 'Marketing & Campaigns',
    href: '/admin/marketing',
    iconName: 'Send',
    roles: ['super_admin', 'admin', 'manager', 'marketing_manager'],
    category: 'Growth',
  },
  {
    id: 'settings',
    label: 'Settings & Roles',
    href: '/admin/settings',
    iconName: 'Settings',
    roles: ['super_admin', 'admin'],
    category: 'System',
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    href: '/admin/audit-logs',
    iconName: 'Shield',
    roles: ['super_admin', 'admin'],
    category: 'System',
  },
];

export const ROLE_LABELS: Record<AdminRole, { title: string; color: string }> = {
  super_admin: { title: 'Super Admin', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  admin: { title: 'Administrator', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  product_manager: { title: 'Product Manager', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  inventory_manager: { title: 'Inventory Manager', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  customer_support: { title: 'Customer Support', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  content_manager: { title: 'Content Manager', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  marketing_manager: { title: 'Marketing Manager', color: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
  finance_manager: { title: 'Finance Manager', color: 'bg-emerald-600/15 text-emerald-300 border-emerald-600/30' },
  manager: { title: 'Store Manager', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  orders_manager: { title: 'Fulfillment Lead', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
  content_editor: { title: 'Content Editor', color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
};
