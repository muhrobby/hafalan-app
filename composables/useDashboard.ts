/**
 * Dashboard Composable
 * Shared state and utilities for dashboard
 */

export const useDashboard = () => {
  const isNotificationsOpen = ref(false)
  const selectedPeriod = ref<'daily' | 'weekly' | 'monthly'>('daily')
  
  const dateRange = ref({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  })

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // Format currency
  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num)
  }

  // Get percentage change color
  const getChangeColor = (change: number): 'success' | 'error' => {
    return change >= 0 ? 'success' : 'error'
  }

  return {
    isNotificationsOpen,
    selectedPeriod,
    dateRange,
    formatNumber,
    formatCurrency,
    getChangeColor
  }
}
