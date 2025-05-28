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
  LabelList,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF', '#FF0066'];

const Revenue = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    numberOfOrders: 0,
  });

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get(
          'https://luna-backend-1.onrender.com/api/users/revenue'
        );

        setRevenueData({
          totalRevenue: data.totalRevenue || 0,
          numberOfOrders: data.numberOfOrders || 0,
        });
      } catch (err) {
        setError('Failed to load revenue data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  // Pre-formatted labels for chart
  const chartData = [
    {
      name: 'Total Revenue',
      value: revenueData.totalRevenue,
      label: `₹${revenueData.totalRevenue.toFixed(2)}`,
    },
    {
      name: 'Total Orders',
      value: revenueData.numberOfOrders,
      label: `${revenueData.numberOfOrders}`,
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Revenue Analytics</h1>
      </div>

      {loading ? (
        <div className="text-center my-5">Loading...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <div className="row mb-4">
            {/* Bar Chart showing total revenue and orders */}
            <div className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Revenue Overview</h5>
                  <div className="bg-light p-3" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip
                          formatter={(value, name) =>
                            name === 'Total Revenue' ? `₹${value.toFixed(2)}` : value
                          }
                        />
                        <Bar dataKey="value" fill="#0088FE" name="Value">
                          <LabelList dataKey="label" position="right" />
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Chart showing revenue vs orders */}
            <div className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Revenue Distribution</h5>
                  <div className="bg-light p-3" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) =>
                            name === 'Total Revenue'
                              ? `${name}: ₹${value.toFixed(2)}`
                              : `${name}: ${value}`
                          }
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) =>
                            name === 'Total Revenue' ? `₹${value.toFixed(2)}` : value
                          }
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Summary</h5>
              <table className="table table-bordered text-center">
                <thead>
                  <tr>
                    <th>Total Revenue</th>
                    <th>Total Orders</th>
                    <th>Avg. Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>₹{revenueData.totalRevenue.toFixed(2)}</td>
                    <td>{revenueData.numberOfOrders}</td>
                    <td>
                      {revenueData.numberOfOrders > 0
                        ? `₹${(revenueData.totalRevenue / revenueData.numberOfOrders).toFixed(2)}`
                        : '₹0.00'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Revenue;
