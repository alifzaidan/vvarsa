/**
 * Format number as Indonesian Rupiah
 */
export function formatRupiah(amount: number, compact = false): string {
    if (compact) {
        if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
        if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
        if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`;
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...options,
    });
}

/**
 * Format date and time
 */
export function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Get stock badge color based on stock level
 */
export function getStockStatus(current: number, min: number): 'danger' | 'warning' | 'success' {
    if (current <= 0) return 'danger';
    if (current <= min) return 'warning';
    return 'success';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length = 100): string {
    return text.length > length ? text.slice(0, length) + '...' : text;
}

/**
 * Business type label mapping
 */
export const BUSINESS_TYPE_LABELS: Record<string, string> = {
    fnb: 'FnB (Makanan & Minuman)',
    retail: 'Retail',
    fashion: 'Fashion',
    general: 'Umum',
    service: 'Jasa',
};

/**
 * Indonesian month names
 */
export const MONTHS_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
