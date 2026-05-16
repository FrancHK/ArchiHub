import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

export function truncate(str: string, maxLength: number) {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export function calculateCommission(amount: number, rate = 0.20) {
  const commission = amount * rate
  const engineerAmount = amount - commission
  return { commission, engineerAmount }
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

export const HOUSE_TYPES = ['modern', 'classic', 'contemporary', 'traditional', 'minimalist', 'bungalow', 'villa', 'apartment'] as const
export const PROJECT_STAGES = ['planning', 'foundation', 'walling', 'roofing', 'finishing'] as const
export const WITHDRAWAL_METHODS = ['bank_transfer', 'mpesa', 'airtel_money', 'paypal'] as const
