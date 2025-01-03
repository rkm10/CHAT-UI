import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Avatar, Paper, Divider, TextField, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';

// Custom TabPanel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Styled components
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
  height: 'calc(100vh - 165px)',
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

// Sample data
const sampleChats = [
  { id: 1, title: 'Support Ticket #1234', lastMessage: 'Hello, I need help with...', time: '10:30 AM' },
  { id: 2, title: 'Support Ticket #1235', lastMessage: 'Thank you for your help', time: '11:45 AM' },
];

const sampleMessages = [
  { id: 1, text: 'Im having issues with my account', isUser: false, time: '10:31 AM' },
  { id: 2, text: 'Hello, how can I help you today?', isUser: false, time: '10:30 AM' },
];

const ChatComponent = () => {
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(sampleMessages);

  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
  };

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        text: newMessage,
        isUser: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Main Tabs (Open/Resolved) */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={mainTab} onChange={handleMainTabChange}>
          <Tab label="Open" />
          <Tab label="Resolved" />
        </Tabs>
      </Box>

      {/* Sub Tabs (All/Mine) */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={subTab} onChange={handleSubTabChange}>
          <Tab label="All" />
          <Tab label="Mine" />
        </Tabs>
      </Box>

      <ChatContainer>
        {/* Left Section - Chat List */}
        <Box sx={{ width: '300px', borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          {sampleChats.map((chat) => (
            <Box
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              sx={{
                p: 2,
                cursor: 'pointer',
                backgroundColor: selectedChat === chat.id ? 'action.selected' : 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <Typography variant="subtitle1">{chat.title}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {chat.lastMessage}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {chat.time}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Middle Section - Chat Messages and Input */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Messages Container */}
          <Box sx={{ flex: 1, p: 2, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {messages.map((message) => (
              <ChatMessage key={message.id} isUser={message.isUser}>
                <Typography variant="body1">{message.text}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {message.time}
                </Typography>
              </ChatMessage>
            ))}
          </Box>

          {/* Message Input */}
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

        {/* Right Section - Client Details */}
        <Box sx={{ width: '300px', borderLeft: 1, borderColor: 'divider', p: 2, overflow: 'auto' }}>
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