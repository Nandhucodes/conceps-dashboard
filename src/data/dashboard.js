export const dashboardMetrics = [
  {
    id: 1,
    title: 'Total Revenue',
    value: '$48,295',
    change: '+12.5%',
    trend: 'up',
    icon: 'revenue',
    color: 'accent',
  },
  {
    id: 2,
    title: 'Total Orders',
    value: '3,842',
    change: '+8.2%',
    trend: 'up',
    icon: 'orders',
    color: 'success',
  },
  {
    id: 3,
    title: 'Total Users',
    value: '12,047',
    change: '+5.1%',
    trend: 'up',
    icon: 'users',
    color: 'info',
  },
  {
    id: 4,
    title: 'Conversion Rate',
    value: '3.6%',
    change: '-0.4%',
    trend: 'down',
    icon: 'conversion',
    color: 'warning',
  },
];

export const revenueChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Revenue 2025',
      data: [31000, 27500, 38000, 42000, 35500, 47000, 44000, 51000, 48000, 56000, 52000, 61000],
      color: '#4f46e5',
    },
    {
      label: 'Revenue 2024',
      data: [24000, 22000, 29000, 33000, 28000, 37000, 35000, 41000, 38000, 44000, 40000, 48000],
      color: '#06b6d4',
    },
  ],
};

export const ordersBarData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  data: [120, 185, 143, 210, 178, 95, 67],
  color: '#10b981',
};

export const categoryPieData = [
  { label: 'Electronics', value: 35, color: '#4f46e5' },
  { label: 'Wearables', value: 20, color: '#06b6d4' },
  { label: 'Gaming', value: 18, color: '#10b981' },
  { label: 'Audio', value: 15, color: '#f59e0b' },
  { label: 'Others', value: 12, color: '#ef4444' },
];

export const recentOrders = [
  { id: '#ORD-7821', customer: 'Alice Johnson', product: 'Wireless Headphones', amount: '$299.99', status: 'Delivered', date: '2025-12-10' },
  { id: '#ORD-7820', customer: 'Bob Martinez', product: 'Smart Watch', amount: '$149.99', status: 'Shipped', date: '2025-12-10' },
  { id: '#ORD-7819', customer: 'Carol White', product: 'Gaming Keyboard', amount: '$129.99', status: 'Processing', date: '2025-12-09' },
  { id: '#ORD-7818', customer: 'David Chen', product: 'USB-C Hub', amount: '$59.99', status: 'Delivered', date: '2025-12-09' },
  { id: '#ORD-7817', customer: 'Eva Brown', product: 'Portable Speaker', amount: '$79.99', status: 'Cancelled', date: '2025-12-08' },
];
