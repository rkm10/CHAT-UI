import React, { useState } from 'react';
import { Box, Switch, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ShortcutIcon from '@mui/icons-material/Shortcut';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';

export default function ProfileComponent() {
    const [available, setAvailable] = useState(true);

    return (
        <Box sx={{ width: '100%', maxWidth: 360, margin: '0 auto', pt: 2 , position: 'absolute', backgroundColor: '#f5f5f5', zIndex: 999 }}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, margin: '0 auto', mb: 2 }} />
                <Typography variant="h6">Rajkumar</Typography>
            </Box>

            <List>
                <ListItem>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText primary="Available Free" />
                    <Switch checked={available} onChange={() => setAvailable(!available)} />

                </ListItem>

                <ListItem button>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText primary="Profile" />
                </ListItem>

                <ListItem button>
                    <ListItemIcon><ShortcutIcon /></ListItemIcon>
                    <ListItemText primary="Shortcuts" />
                </ListItem>

                <ListItem button>
                    <ListItemIcon><NotificationsIcon /></ListItemIcon>
                    <ListItemText primary="Notifications" />
                </ListItem>

                <ListItem button>
                    <ListItemIcon><ChatIcon /></ListItemIcon>
                    <ListItemText primary="Open chat page" />
                </ListItem>

                <Divider />

                <ListItem button>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Box>
    );
};

