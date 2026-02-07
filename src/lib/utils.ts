import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export function getSeverityColor(severity: string): string {
  const colors = {
    critical: "text-red-600 bg-red-100 border-red-300",
    high: "text-orange-600 bg-orange-100 border-orange-300",
    medium: "text-yellow-600 bg-yellow-100 border-yellow-300",
    low: "text-blue-600 bg-blue-100 border-blue-300",
    info: "text-gray-600 bg-gray-100 border-gray-300",
  }
  return colors[severity.toLowerCase() as keyof typeof colors] || colors.info
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}
