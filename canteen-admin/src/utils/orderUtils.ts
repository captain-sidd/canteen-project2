import { differenceInMinutes, formatDistanceToNowStrict } from 'date-fns';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatElapsedTime(createdAt: string): string {
  try {
    const date = new Date(createdAt);
    return formatDistanceToNowStrict(date, { addSuffix: false });
  } catch (e) {
    return '0m';
  }
}

export type OrderPriority = 'normal' | 'warning' | 'danger';

export function getOrderPriority(createdAt: string, status: string): OrderPriority {
  // Only pending and preparing orders age into warning/danger.
  if (status !== 'pending' && status !== 'preparing') {
    return 'normal';
  }

  const mins = differenceInMinutes(new Date(), new Date(createdAt));
  
  if (mins >= 20) return 'danger';
  if (mins >= 10) return 'warning';
  
  return 'normal';
}

// Prepare sound architecture hook
export function playNotificationSound(type: 'new_order' | 'ready' | 'alert') {
  // Mock sound playback - to be implemented with real Audio object
  console.log(`[Audio] Playing ${type} sound...`);
}
