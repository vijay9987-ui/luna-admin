import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });

  const [orderStatusData, setOrderStatusData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrderPages, setTotalOrderPages] = useState(1);
  const ordersPerPage = 5;

  const fetchStats = async () => {
    try {
      const [userRes, productRes, revenueRes] = await Promise.all([
        axios.get('http://194.164.148.244:4066/api/users/users'),
        axios.get('http://194.164.148.244:4066/api/products/getproducts'),
        axios.get('http://194.164.148.244:4066/api/users/revenue'),
      ]);

      setStats(prev => ({
        ...prev,
        users: userRes.data.length,
        products: productRes.data.length,
        revenue: revenueRes.data.totalRevenue || 0,
      }));
    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  };

  const fetchOrders = async (page) => {
    try {
      const orderRes = await axios.get(`http://194.164.148.244:4066/api/users/allorders?page=${currentPage}&limit=${ordersPerPage}`);

      const ordersData = orderRes.data;

      setStats(prev => ({
        ...prev,
        orders: ordersData.totalOrders || 0,
      }));

      const orders = ordersData.orders.map(order => ({
        _id: order.orderId,
        customerName: order.shippingAddress.fullName,
        createdAt: order.createdAt,
        status: order.orderStatus,
        total: order.totalAmount,
      }));

      setRecentOrders(orders);
      setTotalOrderPages(Math.ceil((ordersData.totalOrders || 1) / ordersPerPage));

      // Initialize all possible statuses with count 0
      const allStatuses = [
        'Pending',
        'Confirmed',
        'Shipped',
        'Delivered',
        'Cancel request',
        'Cancelled'
      ];

      const statusCount = allStatuses.reduce((acc, status) => {
        acc[status] = 0;
        return acc;
      }, {});

      // Count actual statuses from orders
      orders.forEach(order => {
        if (statusCount.hasOwnProperty(order.status)) {
          statusCount[order.status] += 1;
        }
      });

      // Convert to pie chart data format
      const statusChartData = allStatuses.map(status => ({
        name: status,
        value: statusCount[status],
      }));

      setOrderStatusData(statusChartData);

    } catch (error) {
      console.error("Orders fetch error:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const formattedStats = [
    { title: 'Total Users', value: stats.users, change: '+12%', variant: '#A66CFF' },
    { title: 'Total Products', value: stats.products, change: '+5%', variant: '#9C9EFE' },
    { title: 'Total Orders', value: stats.orders, change: '+23%', variant: '#A66CFF' },
    { title: 'Total Revenue', value: `₹${stats.revenue.toFixed(2)}`, change: '+18%', variant: '#9C9EFE' },
  ];

  // Status colors that match the badge colors in the table
  const statusColors = {
    'Pending': '#FFC107',     // Yellow
    'Confirmed': '#17A2B8',   // Teal
    'Shipped': '#007BFF',     // Blue
    'Delivered': '#28A745',   // Green
    'Cancel request': '#FF851B', // Orange
    'Cancelled': '#DC3545'    // Red
  };

  const getColor = (status) => statusColors[status] || '#6C757D'; // Default gray

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalOrderPages) {
      setCurrentPage(newPage);
    }
  };

  // Bar Chart Data for Revenue
  const revenueChartData = [
    {
      name: 'Total Revenue',
      revenue: stats.revenue,
    },
  ];

  return (
    <div>
      <h1 className="h3 mb-4">Dashboard Overview</h1>

      <div className="row mb-4">
        {formattedStats.map((stat, index) => (
          <div key={index} className="col-md-3 mb-3">
            <div className={`card bg-${stat.variant} text-white`} style={{ backgroundColor: stat.variant }}>
              <div className="card-body">
                <h5 className="card-title">{stat.title}</h5>
                <h2 className="card-text">{stat.value}</h2>
                <p className="card-text">
                  <small>{stat.change} from last month</small>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Revenue Overview</h5>
              <div className="bg-light p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Order Status Distribution</h5>
              <div className="bg-light p-4 text-center">
                {orderStatusData.some(item => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                        ))}
                      </Pie>
                      {/* <Tooltip
                        formatter={(value, name, props) => [
                          value,
                          props.payload.name
                        ]}
                      />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        formatter={(value) => value}
                      /> */}
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
                    <p className="text-muted">No order status data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Recent Orders</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th># Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="text-nowrap text-muted">{order._id}</td>
                      <td className="fw-semibold">{order.customerName}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge 
                            ${order.status === 'Pending' ? 'bg-warning text-white' :
                            order.status === 'Confirmed' ? 'bg-info text-white' :
                              order.status === 'Shipped' ? 'bg-primary text-white' :
                                order.status === 'Delivered' ? 'bg-success' :
                                  order.status === 'Cancel Request' ? 'bg-warning' :
                                    order.status === 'Cancelled' ? 'bg-danger' :
                                      'bg-secondary'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="fw-bold">₹{order.total.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-secondary"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalOrderPages}</span>
        <button
          className="btn btn-outline-secondary"
          disabled={currentPage === totalOrderPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;