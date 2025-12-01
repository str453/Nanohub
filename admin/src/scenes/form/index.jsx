import { Box, Button, TextField, Typography, Alert, CircularProgress } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import { authAPI } from "../../services/api";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material";

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Password requirements
  const passwordRequirements = {
    minLength: 8,
    hasUpperCase: /[A-Z]/,
    hasLowerCase: /[a-z]/,
    hasNumber: /\d/,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
  };

  const checkPasswordValid = (password) => {
    return (
      password.length >= passwordRequirements.minLength &&
      passwordRequirements.hasUpperCase.test(password) &&
      passwordRequirements.hasLowerCase.test(password) &&
      passwordRequirements.hasNumber.test(password) &&
      passwordRequirements.hasSpecialChar.test(password)
    );
  };

  // Check username availability
  const checkUsername = async (username) => {
    if (username && username.length >= 3) {
      setCheckingUsername(true);
      try {
        const response = await authAPI.checkUsername(username);
        setUsernameAvailable(response.available);
      } catch (error) {
        console.error('Username check error:', error);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    } else {
      setUsernameAvailable(null);
    }
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate password
      if (!checkPasswordValid(values.password)) {
        setError("Password does not meet requirements");
        setLoading(false);
        return;
      }

      if (values.password !== values.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (usernameAvailable === false) {
        setError("Username is already taken");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }

      const adminData = {
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        address: values.address,
        city: values.city,
        state: values.state,
        postal_code: values.postal_code,
        phone: values.phone,
        date_of_birth: values.date_of_birth || undefined
      };

      const response = await authAPI.registerAdmin(adminData, token);
      
      if (response.success) {
        setSuccess(`Admin "${response.user.username}" successfully created!`);
        resetForm();
        setUsernameAvailable(null);
      }
    } catch (e) {
      console.error('Error creating admin:', e);
      if (e.response?.data?.error) {
        setError(e.response.data.error);
      } else {
        setError("Failed to create admin. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE ADMIN" subtitle="Create a New Admin Account" />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Username"
                onBlur={(e) => {
                  handleBlur(e);
                  checkUsername(values.username);
                }}
                onChange={handleChange}
                value={values.username}
                name="username"
                error={!!touched.username && (!!errors.username || usernameAvailable === false)}
                helperText={
                  touched.username && errors.username
                    ? errors.username
                    : usernameAvailable === false
                    ? "Username already taken"
                    : checkingUsername
                    ? "Checking..."
                    : usernameAvailable === true
                    ? "Username available"
                    : ""
                }
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="First Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Last Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="email"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={!!touched.password && !!errors.password}
                helperText={
                  touched.password && errors.password
                    ? errors.password
                    : values.password && !checkPasswordValid(values.password)
                    ? "Password must be 8+ chars with uppercase, lowercase, number, and special character"
                    : ""
                }
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Confirm Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.confirmPassword}
                name="confirmPassword"
                error={!!touched.confirmPassword && !!errors.confirmPassword}
                helperText={touched.confirmPassword && errors.confirmPassword}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Address"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address}
                name="address"
                error={!!touched.address && !!errors.address}
                helperText={touched.address && errors.address}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="City"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.city}
                name="city"
                error={!!touched.city && !!errors.city}
                helperText={touched.city && errors.city}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="State"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.state}
                name="state"
                error={!!touched.state && !!errors.state}
                helperText={touched.state && errors.state}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Postal Code"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.postal_code}
                name="postal_code"
                error={!!touched.postal_code && !!errors.postal_code}
                helperText={touched.postal_code && errors.postal_code}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="tel"
                label="Phone Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phone}
                name="phone"
                error={!!touched.phone && !!errors.phone}
                helperText={touched.phone && errors.phone}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="Date of Birth"
                InputLabelProps={{ shrink: true }}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.date_of_birth}
                name="date_of_birth"
                error={!!touched.date_of_birth && !!errors.date_of_birth}
                helperText={touched.date_of_birth && errors.date_of_birth}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button 
                type="submit" 
                color="secondary" 
                variant="contained"
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading ? <CircularProgress size={24} /> : "Create New Admin"}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const phoneRegExp = /^\d{10,15}$/;

const checkoutSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .required("required"),
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .required("required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("required"),
  address: yup.string().required("required"),
  city: yup.string().required("required"),
  state: yup.string().required("required"),
  postal_code: yup.string().required("required"),
  phone: yup
    .string()
    .matches(phoneRegExp, "Phone number must be 10-15 digits")
    .required("required"),
  date_of_birth: yup.date().nullable(),
});

const initialValues = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  phone: "",
  date_of_birth: "",
};

export default Form;
