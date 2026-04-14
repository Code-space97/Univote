import { Link, useLocation } from 'react-router-dom'
import Navbar from './Navbar'

const navLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/admin/voters', label: 'Voters', icon: '👥' },
  { to: '/admin/elections', label: 'Elections', icon: '🗳️' },
]

export default function AdminLayout({ children, title }) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-52 shrink-0 hidden md:block">
            <nav className="card p-2 space-y-1 sticky top-24">
              {navLinks.map(link => {
                const active = link.exact ? pathname === link.to : pathname.startsWith(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {title && <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>}
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
