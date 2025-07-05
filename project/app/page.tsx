'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Overview } from '@/components/sections/overview'
import { Transactions } from '@/components/sections/transactions'
import { Analytics } from '@/components/sections/analytics'
import { Budget } from '@/components/sections/budget'
import { useFinanceData } from '@/lib/hooks/useFinanceData'

export default function Home() {
  const [activeSection, setActiveSection] = useState('overview')
  const financeData = useFinanceData()

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview {...financeData} />
      case 'transactions':
        return <Transactions {...financeData} />
      case 'analytics':
        return <Analytics {...financeData} />
      case 'budget':
        return <Budget {...financeData} />
      default:
        return <Overview {...financeData} />
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}