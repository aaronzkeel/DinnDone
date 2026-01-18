import { List, MessageCircle, Calendar, Bell } from 'lucide-react'
import type { NavigationItem } from './AppShell'

interface MainNavProps {
  items: NavigationItem[]
  onNavigate?: (href: string) => void
}

const iconMap: Record<string, typeof List> = {
  'list': List,
  'message-circle': MessageCircle,
  'calendar': Calendar,
  'bell': Bell,
}

export function MainNav({ items, onNavigate }: MainNavProps) {
  return (
    <nav className="bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 px-2 py-2 pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around items-center max-w-md mx-auto">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || List
          return (
            <li key={item.href}>
              <button
                onClick={() => onNavigate?.(item.href)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                  transition-colors duration-150
                  ${item.isActive
                    ? 'text-yellow-600 dark:text-yellow-500'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                  }
                `}
              >
                <Icon
                  size={24}
                  strokeWidth={item.isActive ? 2.5 : 2}
                />
                <span className={`
                  text-xs
                  ${item.isActive ? 'font-semibold' : 'font-medium'}
                `}>
                  {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
