import { Box, Typography, useTheme, CircularProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import { userAPI } from "../../services/api";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false); // Debug: show all users if no admins

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        // First check localStorage
        let token = localStorage.getItem('token');
        
        // If no token in localStorage, check URL parameters (in case App.jsx hasn't run yet)
        if (!token) {
          const urlParams = new URLSearchParams(window.location.search);
          token = urlParams.get('token');
          
          console.log('Checking URL for token...');
          console.log('Current URL:', window.location.href);
          console.log('URL search params:', window.location.search);
          console.log('Token from URL:', token ? 'Found' : 'Not found');
          
          if (token) {
            console.log('Token found in URL, storing in localStorage');
            localStorage.setItem('token', token);
            
            // Also get user data from URL if available
            const userData = urlParams.get('user');
            if (userData) {
              try {
                localStorage.setItem('user', decodeURIComponent(userData));
                console.log('User data stored from URL');
              } catch (e) {
                console.error('Error storing user data:', e);
              }
            }
          }
        }
        
        console.log('Token exists:', !!token);
        
        if (!token) {
          console.error('No token found in localStorage or URL parameters');
          console.log('Current URL:', window.location.href);
          setLoading(false);
          return;
        }

        console.log('Fetching users from API...');
        const response = await userAPI.getAllUsers(token);
        console.log('API Response:', response);
        
        if (response.success && response.users) {
          console.log('Total users fetched:', response.users.length);
          console.log('All user roles:', response.users.map(u => ({ 
            name: u.name || u.firstName || u.username, 
            role: u.role,
            roleType: typeof u.role,
            roleValue: JSON.stringify(u.role)
          })));
          
          // Filter to only show admins - be flexible with role matching
          const adminUsers = response.users.filter(user => {
            const role = user.role;
            // Check for 'admin' in various formats
            return role === 'admin' || 
                   role === 'Admin' || 
                   role === 'ADMIN' ||
                   (typeof role === 'string' && role.toLowerCase() === 'admin');
          });
          console.log('Admin users found:', adminUsers.length);
          console.log('Admin users:', adminUsers);
          
          // If no admins found, let's see what we have
          if (adminUsers.length === 0) {
            console.warn('No admin users found. Showing all users for debugging:');
            console.log('All users:', response.users);
            // Temporarily show all users for debugging
            setShowAllUsers(true);
          }
          
          // Use adminUsers or all users if debugging
          const usersToDisplay = adminUsers.length > 0 ? adminUsers : (showAllUsers ? response.users : []);
          
          // Transform admins to team format
          const teamData = usersToDisplay.map((user, index) => {
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

            const name = user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.name || user.username || 'Unknown';
            
            console.log(`Processing admin ${index + 1}:`, { name, role: user.role, email: user.email });

            return {
              id: user._id || index + 1,
              name: name,
              email: user.email || 'N/A',
              age: age || 'N/A',
              phone: user.phone || 'N/A',
              access: user.role || 'admin'
            };
          });
          
          console.log('Final team data:', teamData);
          setTeamData(teamData);
        } else {
          console.error('API response not successful or no users:', response);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
        console.error('Error details:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);
  const columns = [
    { field: "id", headerName: "ID" },
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
      field: "accessLevel",
      headerName: "Access Level",
      flex: 1,
      renderCell: ({ row: { access } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              access === "admin"
                ? colors.greenAccent[600]
                : access === "manager"
                ? colors.greenAccent[700]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {access === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {access === "manager" && <SecurityOutlinedIcon />}
            {access === "user" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {access}
            </Typography>
          </Box>
        );
      },
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
        title="TEAM" 
        subtitle={showAllUsers ? "All Users (Debug Mode - No Admins Found)" : "Managing the Team Members"} 
      />
      {teamData.length === 0 && !loading ? (
        <Box m="40px 0 0 0" textAlign="center" p="40px">
          <Typography variant="h5" color={colors.grey[300]}>
            No admins found in the database
          </Typography>
          <Typography variant="body1" color={colors.grey[500]} sx={{ mt: 2 }}>
            Check the browser console for debugging information
          </Typography>
          <Typography variant="body2" color={colors.grey[600]} sx={{ mt: 1 }}>
            Open browser console (F12) and look for logs showing user roles
          </Typography>
        </Box>
      ) : (
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
          }}
        >
          <DataGrid checkboxSelection rows={teamData} columns={columns} />
        </Box>
      )}
    </Box>
  );
};

export default Team;
