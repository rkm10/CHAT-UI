// src/components/Login.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';

// Dummy user data
const DUMMY_USERS = [
    {
        email: 'admin@example.com',
        password: 'admin123',
        id: 1,
        name: 'Admin User'
    },
    {
        email: 'agent@example.com',
        password: 'Raj123',
        id: 2,
        name: 'Support Agent'
    }
];

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showDummyCredentials, setShowDummyCredentials] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginStart());

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const user = DUMMY_USERS.find(
                user => user.email === credentials.email && user.password === credentials.password
            );

            if (user) {
                // Remove password from user object before storing in state
                const { password, ...userWithoutPassword } = user;
                dispatch(loginSuccess(userWithoutPassword));
                navigate('/dashboard');
            } else {
                dispatch(loginFailure('Invalid email or password'));
            }
        } catch (err) {
            dispatch(loginFailure(err.message));
        }
    };

    const fillDummyCredentials = (userIndex) => {
        setCredentials({
            email: DUMMY_USERS[userIndex].email,
            password: DUMMY_USERS[userIndex].password
        });
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="#f5f5f5"
        >
            <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', mx: 2 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Smartsupp Clone Login
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        margin="normal"
                        value={credentials.email}
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        margin="normal"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </form>

                <Box mt={3}>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="secondary"
                        onClick={() => setShowDummyCredentials(!showDummyCredentials)}
                        sx={{ mb: 1 }}
                    >
                        {showDummyCredentials ? 'Hide Dummy Credentials' : 'Show Dummy Credentials'}
                    </Button>

                    {showDummyCredentials && (
                        <Box mt={2}>
                            <Typography variant="subtitle2" gutterBottom>
                                Available Test Accounts:
                            </Typography>
                            {DUMMY_USERS.map((user, index) => (
                                <Box
                                    key={user.id}
                                    sx={{
                                        mt: 1,
                                        p: 1,
                                        bgcolor: '#f5f5f5',
                                        borderRadius: 1,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => fillDummyCredentials(index)}
                                >
                                    <Typography variant="body2">
                                        Email: {user.email}
                                    </Typography>
                                    <Typography variant="body2">
                                        Password: {user.password}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;