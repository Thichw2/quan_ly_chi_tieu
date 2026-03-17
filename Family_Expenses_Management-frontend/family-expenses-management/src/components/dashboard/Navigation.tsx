import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, List, PieChart, BarChart, Settings, ChevronLeft } from 'lucide-react'

const links = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/expenses', label: 'Expenses', icon: List },
  { href: '/budget', label: 'Budget', icon: PieChart },
  { href: '/reports', label: 'Reports', icon: BarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const Navigation = () => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex flex-col items-center py-2 px-3 transition-all duration-300 ease-in-out hover:text-blue-600 hover:scale-105 ${
                  isActive(link.href) ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <div className="rounded-full p-2 mb-1 bg-transparent">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out 
        ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h1 className={`font-bold text-xl transition-opacity duration-300 ${
              isCollapsed ? "opacity-0 hidden" : "opacity-100"
            }`}>
              Family Budget
            </h1>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 flex flex-col p-3 gap-2">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center py-3 px-4 rounded-lg transition-all duration-300 ease-in-out
                  hover:bg-blue-50 hover:text-blue-600
                  ${isActive(link.href) 
                    ? "text-blue-600 bg-blue-50 shadow-sm" 
                    : "text-gray-600"
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${!isCollapsed && "mr-3"}`} />
                <span className={`whitespace-nowrap transition-opacity duration-300 ${
                  isCollapsed ? "opacity-0 hidden" : "opacity-100"
                }`}>
                  {link.label}
                </span>
              </Link>
            )
          })}
        </div>
       
      </aside>
    </>
  )
}

export default Navigation