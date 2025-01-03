import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';

export default function SettingsComponent() {
    return (
        <Box sx={{ width: '100%', maxWidth: 360, margin: '0 auto', pt: 2 }}>
            <Typography variant="h6" sx={{ p: 2 }}>Settings</Typography>
            <List>
                <ListItem button>
                    <ListItemIcon><NotificationsIcon /></ListItemIcon>
                    <ListItemText primary="Notifications" secondary="Manage notification preferences" />
                </ListItem>

                <ListItem button>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText primary="Account" secondary="Manage your account settings" />
                </ListItem>

                <ListItem button>
                    <ListItemIcon><ChatIcon /></ListItemIcon>
                    <ListItemText primary="Chat" secondary="Chat preferences and settings" />
                </ListItem>
            </List>
        </Box>
    );
};