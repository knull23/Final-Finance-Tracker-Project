'use client'

import { BarChart3, CreditCard, DollarSign, PieChart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'transactions', label: 'Transactions', icon: CreditCard },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'budget', label: 'Budget', icon: DollarSign },
]

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-black">FinanceTracker</span>
            <p className="text-xs text-gray-600 font-medium">ENTERPRISE</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                  activeSection === item.id
                    ? 'bg-black text-white shadow-lg'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100 border border-transparent hover:border-gray-200'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 transition-colors',
                  activeSection === item.id ? 'text-white' : 'text-gray-600 group-hover:text-black'
                )} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
            <User className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-black">John Doe</p>
            <p className="text-xs text-gray-600">Premium Account</p>
          </div>
        </div>
      </div>
    </div>
  )
}