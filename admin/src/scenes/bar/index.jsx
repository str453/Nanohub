import { Box, CircularProgress, Typography } from "@mui/material";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";
import { useState, useEffect } from "react";
import { orderAPI } from "../../services/api";

const Bar = () => {
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await orderAPI.getAllOrders(token);
        if (response.success && response.orders) {
          // Compute revenue by product category
          const revenueByCategory = {};
          
          response.orders.forEach(order => {
            if (order.orderItems && Array.isArray(order.orderItems)) {
              order.orderItems.forEach(item => {
                const category = item.product?.category || 'Unknown';
                const revenue = (item.price || item.product?.price || 0) * (item.quantity || 1);
                
                if (!revenueByCategory[category]) {
                  revenueByCategory[category] = 0;
                }
                revenueByCategory[category] += revenue;
              });
            }
          });

          // Transform to bar chart format
          const formattedData = Object.entries(revenueByCategory).map(([category, value]) => ({
            category: category,
            value: Math.round(value * 100) / 100 // Round to 2 decimal places
          }));

          setBarData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching sales data for bar chart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) {
    return (
      <Box m="20px" display="flex" justifyContent="center" alignItems="center" minHeight="75vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading sales data...</Typography>
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Header title="Bar Chart" subtitle="Sales Revenue by Product Category" />
      <Box height="75vh">
        <BarChart data={barData} />
      </Box>
    </Box>
  );
};

export default Bar;
