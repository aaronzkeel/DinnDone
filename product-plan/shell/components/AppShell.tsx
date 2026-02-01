import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'

export interface NavigationItem {
  label: string
  href: string
  icon: 'list' | 'message-circle' | 'calendar' | 'bell'
  isActive?: boolean
}

export interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  user?: {
    name: string
    avatarUrl?: string
  }
  onNavigate?: (href: string) => void
  onLogout?: () => void
  onSettings?: () => void
}

export function AppShell({
  children,
  navigationItems,
  user,
  onNavigate,
  onLogout,
  onSettings,
}: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-900 font-['Nunito_Sans']">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
            DinnDone
          </span>
        </div>
        {user && (
          <UserMenu
            user={user}
            onLogout={onLogout}
            onSettings={onSettings}
          />
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Tab Bar */}
      <MainNav
        items={navigationItems}
        onNavigate={onNavigate}
      />
    </div>
  )
}
