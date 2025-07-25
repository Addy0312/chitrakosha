// Export OrderStatus enum for use in API routes
export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED', // Add this if you want to support REFUNDED in the app logic
}
