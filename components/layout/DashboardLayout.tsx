'use client'

import { ReactNode, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ShoppingCart, 
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Briefcase,
  TrendingUp,
  FileCheck,
  PieChart,
  AlertCircle,
  BarChart3,
  ClipboardList,
  Package,
  Truck,
  Wallet,
  Target,
  CheckCircle2,
  Plus,
  Search,
  Receipt
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Presupuestos', href: '/presupuestos', icon: FileText },
    ]
  },
  {
    title: 'Gestión',
    items: [
      { name: 'CRM', href: '/crm', icon: Users },
      { name: 'Planificación', href: '/planificacion', icon: Calendar },
    ]
  },
  {
    title: 'Finanzas y Costes',
    items: [
      { name: 'Control de Costes', href: '/costes', icon: DollarSign },
      { name: 'Compras y Subcontratas', href: '/compras', icon: ShoppingCart },
      { name: 'Facturas Trabajadores', href: '/facturas-trabajadores', icon: Receipt },
    ]
  }
]

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 bg-white/90 backdrop-blur-sm border-r border-blue-100/50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-blue-100/50">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                IA Reformas
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-blue-50/50 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {navigation.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative",
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                            : "text-slate-700 hover:bg-blue-50/50 hover:text-blue-700"
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-transform duration-200",
                          isActive ? "" : "group-hover:scale-110"
                        )} />
                        {item.name}
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-white/20 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-blue-100/50">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50/50 hover:text-blue-700 transition-all"
            >
              <Settings className="h-5 w-5" />
              Configuración
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50/50 transition-all">
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-blue-100/50 shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            {/* Mobile: Hamburger + REHABITECA */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-blue-50/50 transition-colors"
              >
                <Menu className="h-6 w-6 text-slate-700" />
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                REHABITECA
              </h1>
            </div>
            
            {/* Desktop: Logo */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                IA Reformas
              </span>
            </div>
            
            {/* Quick Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-blue-200/50 bg-white/50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 ml-auto">
              {/* Quick Actions */}
              <Link href="/presupuestos/nuevo" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all">
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline">Nuevo</span>
              </Link>
              
              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 lg:gap-3 p-2 rounded-xl hover:bg-blue-50/50 transition-colors"
                >
                  {/* Mobile: REHABITECA + Icono */}
                  <div className="lg:hidden flex items-center gap-2">
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      REHABITECA
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/30 text-xs">
                      UD
                    </div>
                  </div>
                  
                  {/* Desktop: Usuario Demo + Icono */}
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium text-slate-900">Usuario Demo</p>
                    <p className="text-xs text-slate-500">Plan Profesional</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/30 hidden lg:flex">
                    UD
                  </div>
                </button>
                
                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-blue-100/50 overflow-hidden z-30">
                    <div className="p-4 border-b border-blue-100/50">
                      <p className="text-sm font-semibold text-slate-900">Usuario Demo</p>
                      <p className="text-xs text-slate-500">usuario@demo.com</p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg">
                        Plan Profesional
                      </span>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-blue-50/50 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Configuración
                      </Link>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50/50 transition-colors">
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

