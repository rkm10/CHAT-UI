import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Avatar,
  Paper,
  Divider,
  TextField,
  IconButton,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// Styled components remain the same as before...
const ChatMessage = styled(Paper)(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  maxWidth: '70%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser ? theme.palette.primary.light : theme.palette.grey[100],
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
}));

const ChatContainer = styled(Box)({
  display: 'flex',
  height: 'calc(100vh - 164px)',
  overflow: 'hidden',
});

const MessageInputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  alignItems: 'center',
  gap: theme.spacing(1),
}));

// Sample data (unchanged from before)
const sampleUsers = {
  1: {
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatar: 'JS',
    accountType: 'Premium',
    lastLogin: 'Today at 10:30 AM',
    company: 'Tech Corp',
    location: 'New York, USA',
    timeZone: 'EST',
  },
  2: {
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    avatar: 'MG',
    accountType: 'Business',
    lastLogin: 'Today at 11:45 AM',
    company: 'Design Studio',
    location: 'Barcelona, Spain',
    timeZone: 'CET',
  },
  3: {
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    avatar: 'AC',
    accountType: 'Enterprise',
    lastLogin: 'Today at 09:15 AM',
    company: 'Global Solutions',
    location: 'Singapore',
    timeZone: 'SGT',
  },
  4: {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'SJ',
    accountType: 'Standard',
    lastLogin: 'Yesterday at 4:30 PM',
    company: 'Retail Plus',
    location: 'London, UK',
    timeZone: 'GMT',
  },
  5: {
    name: 'Mohammed Ali',
    email: 'mohammed.a@example.com',
    avatar: 'MA',
    accountType: 'Premium',
    lastLogin: 'Today at 08:00 AM',
    company: 'Finance Hub',
    location: 'Dubai, UAE',
    timeZone: 'GST',
  },
  6: {
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    avatar: 'ED',
    accountType: 'Standard',
    lastLogin: 'Today at 12:00 PM',
    company: 'HealthCare Inc.',
    location: 'San Francisco, USA',
    timeZone: 'PST',
  },
  7: {
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@example.com',
    avatar: 'CR',
    accountType: 'Business',
    lastLogin: 'Yesterday at 2:45 PM',
    company: 'TravelGo',
    location: 'Mexico City, Mexico',
    timeZone: 'CST',
  },
  8: {
    name: 'Sophia Zhang',
    email: 'sophia.z@example.com',
    avatar: 'SZ',
    accountType: 'Enterprise',
    lastLogin: 'Today at 07:15 AM',
    company: 'Innovatech',
    location: 'Shanghai, China',
    timeZone: 'CST',
  },
  9: {
    name: 'Liam Brown',
    email: 'liam.b@example.com',
    avatar: 'LB',
    accountType: 'Premium',
    lastLogin: 'Today at 06:30 AM',
    company: 'E-Commerce Plus',
    location: 'Toronto, Canada',
    timeZone: 'EST',
  },
  10: {
    name: 'Olivia Wilson',
    email: 'olivia.w@example.com',
    avatar: 'OW',
    accountType: 'Standard',
    lastLogin: 'Yesterday at 8:15 PM',
    company: 'Education Center',
    location: 'Sydney, Australia',
    timeZone: 'AEST',
  },
};

const sampleChats = [
  {
    id: 1,
    userId: 1,
    title: 'Payment Issue #1234',
    lastMessage: 'I can’t process my payment',
    time: '10:30 AM',
    status: 'urgent',
    unread: 3,
  },
  {
    id: 2,
    userId: 2,
    title: 'Account Access #1235',
    lastMessage: 'Need help with login',
    time: '11:45 AM',
    status: 'normal',
    unread: 1,
  },
  {
    id: 3,
    userId: 3,
    title: 'Feature Request #1236',
    lastMessage: 'When will the new update be available?',
    time: '09:15 AM',
    status: 'low',
    unread: 0,
  },
  {
    id: 4,
    userId: 4,
    title: 'Product Query #1237',
    lastMessage: 'Looking for pricing information',
    time: 'Yesterday',
    status: 'normal',
    unread: 2,
  },
  {
    id: 5,
    userId: 5,
    title: 'Technical Support #1238',
    lastMessage: 'Integration issues with API',
    time: '08:00 AM',
    status: 'urgent',
    unread: 4,
  },
  {
    id: 6,
    userId: 6,
    title: 'Health Check-up Inquiry',
    lastMessage: 'What are the available slots for check-ups?',
    time: '12:00 PM',
    status: 'low',
    unread: 0,
  },
  {
    id: 7,
    userId: 7,
    title: 'Flight Booking Assistance',
    lastMessage: 'I need help rescheduling my flight',
    time: 'Yesterday',
    status: 'urgent',
    unread: 1,
  },
  {
    id: 8,
    userId: 8,
    title: 'Partnership Proposal',
    lastMessage: 'Would you like to partner with us?',
    time: '07:15 AM',
    status: 'normal',
    unread: 0,
  },
  {
    id: 9,
    userId: 9,
    title: 'Order Cancellation Request',
    lastMessage: 'Please cancel my order',
    time: '06:30 AM',
    status: 'normal',
    unread: 1,
  },
  {
    id: 10,
    userId: 10,
    title: 'Course Enrollment Issue',
    lastMessage: 'Having trouble enrolling in a course',
    time: 'Yesterday',
    status: 'urgent',
    unread: 2,
  },
];

const initialMessages = {
  1: [
    { id: 1, text: 'Hi, I’m having trouble with my payment', isUser: false, time: '10:30 AM' },
    { id: 2, text: 'I’m getting an error code 404', isUser: false, time: '10:31 AM' },
  ],
  2: [
    { id: 1, text: 'Hello, I can’t log into my account', isUser: false, time: '11:45 AM' },
  ],
  3: [
    { id: 1, text: 'When is the new feature coming out?', isUser: false, time: '09:15 AM' },
  ],
  4: [
    { id: 1, text: 'Can you send me the pricing details?', isUser: false, time: '4:30 PM' },
  ],
  5: [
    { id: 1, text: 'The API integration is not working', isUser: false, time: '08:00 AM' },
    { id: 2, text: 'Getting timeout errors', isUser: false, time: '08:01 AM' },
  ],
  6: [
    { id: 1, text: 'Are there any slots available for check-ups this week?', isUser: false, time: '12:00 PM' },
  ],
  7: [
    { id: 1, text: 'I need help rescheduling my flight', isUser: false, time: 'Yesterday' },
  ],
  8: [
    { id: 1, text: 'We are interested in a partnership. Are you available for a meeting?', isUser: false, time: '07:15 AM' },
  ],
  9: [
    { id: 1, text: 'Can you cancel my order? It was placed by mistake.', isUser: false, time: '06:30 AM' },
  ],
  10: [
    { id: 1, text: 'I’m having trouble enrolling in the course. It keeps giving an error.', isUser: false, time: 'Yesterday' },
  ],
};

const ChatComponent = () => {
  const [mainTab, setMainTab] = useState(0); // 0 = Open, 1 = Resolved
  const [subTab, setSubTab] = useState(0);  // 0 = All, 1 = Mine
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(initialMessages);

  const handleChatSelect = (chatId) => {
    setSelectedChat(chatId);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const newMsg = {
        id: messages[selectedChat].length + 1,
        text: newMessage,
        isUser: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages({
        ...messages,
        [selectedChat]: [...messages[selectedChat], newMsg],
      });
      setNewMessage('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'urgent': return 'error.main';
      case 'normal': return 'info.main';
      case 'low': return 'success.main';
      default: return 'grey.500';
    }
  };

  const filteredChats = sampleChats.filter((chat) => {
    // Filter by main tab
    if (mainTab === 0 && chat.status === 'resolved') return false;
    if (mainTab === 1 && chat.status !== 'resolved') return false;

    // Filter by sub-tab
    if (subTab === 1) {
      const currentUser = 1; // Simulate "Mine" with userId = 1
      return chat.userId === currentUser;
    }
    return true;
  });

  return (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={mainTab}
          onChange={(e, v) => setMainTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: '#3f51b5' } }}
        >
          <Tab label="Open" />
          <Tab label="Resolved" />
        </Tabs>
        <Tabs
          value={subTab}
          onChange={(e, v) => setSubTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: '#3f51b5' } }}
        >
          <Tab label="All" />
          <Tab label="Mine" />
        </Tabs>
      </Box>

      <ChatContainer>
        {/* Chat List */}
        <Box sx={{ width: '30%', overflow: 'auto', transition: 'width 0.3s' }}>
          {filteredChats.map((chat) => (
            <Box
              key={chat.id}
              onClick={() => handleChatSelect(chat.id)}
              sx={{
                p: 2,
                cursor: 'pointer',
                borderBottom: 1,
                borderColor: 'divider',
                '&:hover': { backgroundColor: 'action.hover' },
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                backgroundColor: selectedChat === chat.id ? 'action.selected' : 'transparent',
              }}
            >
              <Avatar sx={{
                bgcolor: (() => {
                  const colors = [
                    '#2196F3', // Blue
                    '#F44336', // Red
                    '#4CAF50', // Green
                    '#9C27B0', // Purple
                    '#FFEB3B', // Yellow
                    '#E91E63', // Pink
                    '#3F51B5', // Indigo
                    '#FF9800', // Orange
                    '#009688', // Teal
                    '#00BCD4'  // Cyan
                  ];
                  return colors[chat.userId % colors.length];
                })()
              }}>
                {sampleUsers[chat.userId].avatar}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">{chat.title}</Typography>
                  <FiberManualRecordIcon sx={{ color: getStatusColor(chat.status), fontSize: 12 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {chat.lastMessage}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {chat.time}
                  </Typography>
                  {chat.unread > 0 && (
                    <Badge badgeContent={chat.unread} color="primary" />
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Chat View */}
        {selectedChat ? (
          <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', p: 2 }}>
              <IconButton onClick={() => setSelectedChat(null)}>
                <ArrowBackIcon />
              </IconButton>
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle1">
                  {sampleChats.find((c) => c.id === selectedChat)?.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {sampleUsers[sampleChats.find((c) => c.id === selectedChat)?.userId].name}
                </Typography>
              </Box>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              {messages[selectedChat].map((message) => (
                <ChatMessage key={message.id} isUser={message.isUser}>
                  <Typography variant="body1">{message.text}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {message.time}
                  </Typography>
                </ChatMessage>
              ))}
            </Box>

            {/* Input */}
            <MessageInputContainer>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                variant="outlined"
                size="small"
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <SendIcon />
              </IconButton>
            </MessageInputContainer>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Select a chat to start messaging
            </Typography>
          </Box>
        )}

        {/* Right Section - Client Details */}
        <Box sx={{ width: '20%', borderLeft: 1, borderColor: 'divider', p: 2, overflow: 'auto' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }} />
            <Typography variant="h6">Raj Kumar</Typography>
            <Typography variant="body2" color="text.secondary">
              Rajkumar.m@noveloffice.in
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Ticket Details
          </Typography>
          <Typography variant="body2" paragraph>
            Ticket ID: #1234
          </Typography>
          <Typography variant="body2" paragraph>
            Created: Jan 2, 2025
          </Typography>
          <Typography variant="body2" paragraph>
            Status: Open
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Additional Information
          </Typography>
          <Typography variant="body2" paragraph>
            Account Type: Premium
          </Typography>
          <Typography variant="body2" paragraph>
            Last Login: Today at 10:30 AM
          </Typography>
        </Box>
      </ChatContainer>
    </Box>
  );
};

export default ChatComponent;
