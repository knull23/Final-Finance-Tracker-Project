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

  // Handle API fetch errors or undefined data
  const isLoading =
    !financeData ||
    !Array.isArray(financeData.transactions) ||
    !Array.isArray(financeData.budgets)

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-gray-500 text-center mt-12">
          Loading data or failed to load. Please check connection or try again later.
        </div>
      )
    }

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
