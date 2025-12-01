import { Box, CircularProgress } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { userAPI } from "../../services/api";

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [contactsData, setContactsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await userAPI.getAllUsers(token);
        if (response.success && response.users) {
          // Transform users to contacts format
          const contactsData = response.users.map((user, index) => {
            // Calculate age from dateOfBirth if available
            let age = null;
            if (user.dateOfBirth) {
              const birthDate = new Date(user.dateOfBirth);
              const today = new Date();
              age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
            }

            return {
              id: user._id || index + 1,
              name: user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.name || user.username || 'Unknown',
              email: user.email || 'N/A',
              age: age || 'N/A',
              phone: user.phone || 'N/A',
              address: user.address?.street || 'N/A',
              city: user.address?.city || 'N/A',
              zipCode: user.address?.zipcode || 'N/A',
              registrarId: user._id?.toString().slice(-6) || index + 1
            };
          });
          setContactsData(contactsData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "registrarId", headerName: "Registrar ID" },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1,
    },
    {
      field: "city",
      headerName: "City",
      flex: 1,
    },
    {
      field: "zipCode",
      headerName: "Zip Code",
      flex: 1,
    },
  ];

  if (loading) {
    return (
      <Box m="20px" display="flex" justifyContent="center" alignItems="center" minHeight="75vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Header
        title="CONTACTS"
        subtitle="List of Contacts for Future Reference"
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={contactsData}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default Contacts;
