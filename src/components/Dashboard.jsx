import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SettingsIcon from '@mui/icons-material/Settings';

import ChatComponent from './ChatComponent';
import ProfileComponent from './ProfileComponent';
import SettingsComponent from './SettingsComponent';

const drawerWidth = 240;

// ... (keep all the existing styled components: openedMixin, closedMixin, DrawerHeader, AppBar, Drawer)
const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
        {
            props: ({ open }) => open,
            style: {
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        },
    ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

export default function Dashboard() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [profileOpen, setProfileOpen] = React.useState(false);
    const [currentView, setCurrentView] = React.useState('chat'); // Default view is chat

    // Function to render the appropriate component based on currentView
    const renderView = () => {
        switch (currentView) {
            case 'profile':
                return <ProfileComponent />;
            case 'chat':
                return <ChatComponent />;
            case 'settings':
                return <SettingsComponent />;
            default:
                return <ChatComponent />;
        }
    };

    const handleOpenProfile = () => {
        console.log('Opening profile');

        setProfileOpen(!profileOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleOpenProfile}
                        sx={[
                            {
                                marginRight: 5,
                            },
                            open && { display: 'none' },
                        ]}
                    >
                        <PersonRoundedIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Novel Chat Application
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <DrawerHeader />
                <List>

                    {/* Conversations Section */}
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={() => setCurrentView('chat')}
                            sx={{
                                minHeight: 48,
                                px: 2.5,
                                justifyContent: open ? 'initial' : 'center',
                                bgcolor: currentView === 'chat' ? 'action.selected' : 'transparent',
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                }}
                            >
                                <ChatBubbleOutlineIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Conversations"
                                sx={{ opacity: open ? 1 : 0 }}
                            />
                        </ListItemButton>
                    </ListItem>
                </List>

                {/* Settings at the bottom */}
                <Box sx={{ marginTop: 'auto' }}>
                    <Divider />
                    <List>
                        <ListItem disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                onClick={() => setCurrentView('settings')}
                                sx={{
                                    minHeight: 48,
                                    px: 2.5,
                                    justifyContent: open ? 'initial' : 'center',
                                    bgcolor: currentView === 'settings' ? 'action.selected' : 'transparent',
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Settings"
                                    sx={{ opacity: open ? 1 : 0 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1 }}>
                <DrawerHeader />
                {profileOpen ? <ProfileComponent /> : ''}
                {renderView()}
            </Box>
        </Box>
    );
}