import Card, { CardHeader } from '../../components/Card/Card';
import Badge from '../../components/Badge/Badge';
import LineChart from '../../components/Charts/LineChart';
import BarChart from '../../components/Charts/BarChart';
import DonutChart from '../../components/Charts/DonutChart';
import { dashboardMetrics, revenueChartData, ordersBarData, categoryPieData, recentOrders } from '../../data/dashboard';
import './Dashboard.css';

const metricIcons = {
  revenue: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  orders: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  users: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  conversion: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
};

const metricColors = {
  accent:  { bg: '#e9f3ff', icon: '#1b84ff', glowA: '#1b84ff', glowB: '#7239ea' },
  success: { bg: '#f0fdf4', icon: '#22c55e', glowA: '#22c55e', glowB: '#16a34a' },
  info:    { bg: '#eff6ff', icon: '#3b82f6', glowA: '#3b82f6', glowB: '#06b6d4' },
  warning: { bg: '#fffbeb', icon: '#f59e0b', glowA: '#f59e0b', glowB: '#fb923c' },
};

const orderStatusVariant = {
  Delivered: 'success', Shipped: 'info', Processing: 'warning', Cancelled: 'danger',
};

function Dashboard() {
  return (
    <div className="dashboard animate-fadeIn">
      {/* Header */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="dashboard__date">
          {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="dashboard__metrics">
        {dashboardMetrics.map((metric, i) => {
          const colors = metricColors[metric.color];
          return (
            <div
              key={metric.id}
              className="metric-card"
              style={{
                animationDelay: `${i * 60}ms`,
                '--metric-glow-a': colors.glowA,
                '--metric-glow-b': colors.glowB,
              }}
            >
              <div className="metric-card__info">
                <p className="metric-card__label">{metric.title}</p>
                <p className="metric-card__value">{metric.value}</p>
                <div className="metric-card__change">
                  <span className={`metric-card__trend metric-card__trend--${metric.trend === 'up' ? 'up' : 'down'}`}>
                    {metric.trend === 'up' ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    )}
                    {metric.change}
                  </span>
                  <span className="metric-card__period">vs last month</span>
                </div>
              </div>
              <div className="metric-card__icon" style={{ background: colors.bg, color: colors.icon }}>
                {metricIcons[metric.icon]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="dashboard__charts-row">
        <Card padding="md" className="dashboard__chart-main animate-fadeIn stagger-3">
          <CardHeader>
            <h2 className="dashboard__section-title">Revenue Overview</h2>
            <Badge variant="success" dot>Live</Badge>
          </CardHeader>
          <LineChart data={revenueChartData} />
        </Card>

        <Card padding="md" className="dashboard__chart-side animate-fadeIn stagger-4">
          <CardHeader>
            <h2 className="dashboard__section-title">Categories</h2>
          </CardHeader>
          <DonutChart data={categoryPieData} />
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="dashboard__charts-row dashboard__charts-row--secondary">
        <Card padding="md" className="dashboard__chart-bar animate-fadeIn stagger-5">
          <CardHeader>
            <h2 className="dashboard__section-title">Weekly Orders</h2>
          </CardHeader>
          <BarChart data={ordersBarData} />
        </Card>

        {/* Recent Orders */}
        <Card padding="none" className="dashboard__orders animate-fadeIn stagger-6">
          <div className="dashboard__orders-header">
            <h2 className="dashboard__section-title">Recent Orders</h2>
            <button className="dashboard__view-all">View all</button>
          </div>
          <div className="dashboard__orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="orders-table__id">{order.id}</td>
                    <td>{order.customer}</td>
                    <td className="orders-table__amount">{order.amount}</td>
                    <td>
                      <Badge variant={orderStatusVariant[order.status] || 'default'} size="sm">
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
