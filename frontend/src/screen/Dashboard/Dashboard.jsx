import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ApiService from '../../services/apiService';
import './Dashboard.css';
import { FiTrendingUp, FiUsers, FiDollarSign, FiShoppingBag } from 'react-icons/fi';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        topDishes: [],
        ordersOverview: [],
        topCategories: [],
        orderStatuses: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Mock data - thay thế bằng API calls thực tế
            const mockData = {
                totalOrders: 1255,
                totalCustomers: 487,
                totalRevenue: 45320000,
                topDishes: [
                    { id: 1, name: 'Cơm tấm sườn nướng', sold: 342, price: 65000 },
                    { id: 2, name: 'Phở gà', sold: 298, price: 75000 },
                    { id: 3, name: 'Bánh mì thịt nướng', sold: 287, price: 35000 },
                    { id: 4, name: 'Cà phê đen đá', sold: 265, price: 20000 },
                    { id: 5, name: 'Bún chả hà nội', sold: 241, price: 55000 }
                ],
                ordersOverview: [
                    { day: 'Thứ 2', orders: 145 },
                    { day: 'Thứ 3', orders: 158 },
                    { day: 'Thứ 4', orders: 172 },
                    { day: 'Thứ 5', orders: 189 },
                    { day: 'Thứ 6', orders: 205 },
                    { day: 'Thứ 7', orders: 198 },
                    { day: 'CN', orders: 165 }
                ],
                topCategories: [
                    { name: 'Món chính', value: 35 },
                    { name: 'Thức uống', value: 25 },
                    { name: 'Tráng miệng', value: 20 },
                    { name: 'Khác', value: 20 }
                ],
                orderStatuses: [
                    { name: 'Chờ xác nhận', count: 45, percentage: 20 },
                    { name: 'Đang chuẩn bị', count: 135, percentage: 60 },
                    { name: 'Đã sẵn sàng', count: 30, percentage: 13 },
                    { name: 'Đã hoàn thành', count: 5, percentage: 7 }
                ]
            };

            setDashboardData(mockData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#D06F35', '#2D2D2D', '#F4A460', '#D3D3D3'];

    if (loading) {
        return <div className="dashboard-loading">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Bảng điều khiển</h1>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total-orders">
                        <FiShoppingBag />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Tổng đơn hàng</p>
                        <h3>{dashboardData.totalOrders.toLocaleString()}</h3>
                        <span className="stat-change positive">
                            <FiTrendingUp /> 1.58%
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon total-customers">
                        <FiUsers />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Tổng khách hàng</p>
                        <h3>{dashboardData.totalCustomers.toLocaleString()}</h3>
                        <span className="stat-change">
                            <FiTrendingUp /> 0.42%
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon total-revenue">
                        <FiDollarSign />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Tổng doanh thu</p>
                        <h3>₫{(dashboardData.totalRevenue / 1000000).toFixed(0)}M</h3>
                        <span className="stat-change positive">
                            <FiTrendingUp /> 2.36%
                        </span>
                    </div>
                </div>
            </div>

            {/* Top Dishes */}
            <div className="chart-section revenue-section">
                <div className="chart-header">
                    <div>
                        <p className="chart-label">Những món bán chạy nhất</p>
                        <h3>Top 5 Món ăn</h3>
                    </div>
                    <select className="time-filter">
                        <option>Tháng này</option>
                        <option>Tuần này</option>
                        <option>Hôm nay</option>
                    </select>
                </div>
                
                <div className="top-dishes-list">
                    {dashboardData.topDishes.map((dish, idx) => (
                        <div key={dish.id} className="dish-item">
                            <div className="dish-rank">#{idx + 1}</div>
                            <div className="dish-info">
                                <h4 className="dish-name">{dish.name}</h4>
                                <p className="dish-price">₫{dish.price.toLocaleString()}</p>
                            </div>
                            <div className="dish-sales">
                                <span className="sales-count">{dish.sold}</span>
                                <span className="sales-label">bán</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Orders Overview & Categories */}
            <div className="charts-row">
                <div className="chart-section">
                    <h3>Tổng quan đơn hàng</h3>
                    <div className="time-filter-wrapper">
                        <select className="time-filter">
                            <option>Tuần này</option>
                        </select>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dashboardData.ordersOverview}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" stroke="#999" />
                            <YAxis stroke="#999" />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
                            <Bar dataKey="orders" fill="#D06F35" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="charts-column">
                    <div className="chart-section">
                        <div className="chart-header">
                            <h3>Danh mục hàng đầu</h3>
                            <select className="time-filter">
                                <option>Tháng này</option>
                            </select>
                        </div>
                        
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={dashboardData.topCategories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dashboardData.topCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}%`} />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="legend-custom">
                            {dashboardData.topCategories.map((cat, idx) => (
                                <div key={idx} className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                    <span>{cat.name} {cat.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="chart-section">
                        <div className="chart-header">
                            <h3>Trạng thái đơn hàng</h3>
                        </div>

                        <div className="order-types-list">
                            {dashboardData.orderStatuses.map((status, idx) => (
                                <div key={idx} className="order-type-item">
                                    <div className="order-type-info">
                                        <span className="order-type-name">{status.name}</span>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{ width: `${status.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="order-type-count">{status.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
