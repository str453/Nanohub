import { Box, CircularProgress, Typography } from "@mui/material";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import { useState, useEffect } from "react";
import { orderAPI } from "../../services/api";

const Line = () => {
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesOverTime = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await orderAPI.getAllOrders(token);
        if (response.success && response.orders) {
          // Group revenue by month (YYYY-MM)
          const revenueByMonth = {};

          response.orders.forEach((order) => {
            const date = new Date(order.orderedAt || order.createdAt || new Date());
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const revenue = order.totalPrice || 0;

            if (!revenueByMonth[key]) {
              revenueByMonth[key] = 0;
            }
            revenueByMonth[key] += revenue;
          });

          // Sort months chronologically
          const sortedMonths = Object.keys(revenueByMonth).sort();

          const series = [
            {
              id: "Monthly Revenue",
              data: sortedMonths.map((month) => ({
                x: month,
                y: Number(revenueByMonth[month].toFixed(2)),
              })),
            },
          ];

          setLineData(series);
        }
      } catch (error) {
        console.error("Error fetching sales data for line chart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesOverTime();
  }, []);

  if (loading) {
    return (
      <Box
        m="20px"
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="75vh"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading sales data...</Typography>
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Header title="Line Chart" subtitle="Monthly Revenue Over Time" />
      <Box height="75vh">
        <LineChart data={lineData} />
      </Box>
    </Box>
  );
};

export default Line;
