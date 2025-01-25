// chat-widget.js
class ChatWidget {
    constructor(config = {}) {
        this.config = {
            socketURL: config.socketURL || "http://localhost:4040",
            apiURL: config.apiURL || "http://localhost:4040/api",
            primaryColor: config.primaryColor || "#2563eb",
            secondaryColor: config.secondaryColor || "#f3f4f6",
            title: config.title || "Chat Support",
            subtitle: config.subtitle || "We typically reply within 5 minutes",
            socketIOVersion: config.socketIOVersion || "4.7.2"
        };

        this.state = {
            isOpen: false,
            isOnline: false,
            isSending: false,
            messages: [],
            unreadCount: 0
        };

        this.socket = null;
        this.userId = localStorage.getItem('chat_user_id') || this.generateUserId();
    }


    generateUserId() {
        const id = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chat_user_id', id);
        return id;
    }

    // Load Socket.IO library
    async loadSocketIO() {
        return new Promise((resolve, reject) => {
            if (window.io) {
                resolve(window.io);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://cdn.socket.io/${this.config.socketIOVersion}/socket.io.min.js`;
            script.async = true;
            script.onload = () => resolve(window.io);
            script.onerror = () => reject(new Error('Failed to load Socket.IO'));
            document.head.appendChild(script);
        });
    }

    async init() {
        try {
            this.injectStyles();
            this.createWidget();
            await this.loadSocketIO();
            await this.initializeSocket();
            this.bindEvents();
        } catch (error) {
            console.error('Failed to initialize chat widget:', error);
            this.showError('Chat initialization failed. Please try again later.');
        }
    }

    // showError(message) {
    //     const errorDiv = document.createElement('div');
    //     errorDiv.style.cssText = `
    //         position: fixed;
    //         bottom: 20px;
    //         right: 20px;
    //         background-color: #ef4444;
    //         color: white;
    //         padding: 12px 24px;
    //         border-radius: 8px;
    //         font-family: system-ui, sans-serif;
    //         z-index: 10000;
    //     `;
    //     errorDiv.textContent = message;
    //     document.body.appendChild(errorDiv);
    //     setTimeout(() => errorDiv.remove(), 5000);
    // }

    injectStyles() {
        const styles = `
            .chat-widget-container * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .chat-widget-container {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }

            .chat-bubble {
                background-color: ${this.config.primaryColor};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 100px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                cursor: pointer;
                padding : 3px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: transform 0.2s ease;
            }
            
.widget-button-text {
    display: flex;
    align-items: center;
    white-space: nowrap;
    padding-left: 16px;
    padding-right: 4px;
    color: white;
}

.icon-container {
    padding: 4px;
}

.icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    color: white;
    background-color: rgb(255, 255, 255, 0.2);
    border-radius: 50%;
}

.icon-transform {
    transform: scale(1);
    transition: transform 0.3s;
}

.icon-transform:hover {
    transform: scale(1.15);
}

.widget-online-badge {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 3px;
    height: 3px;
    padding: 6px;
    background-color: #34D399;
    border-radius: 50%;
    border: 2px solid white;
}

            .chat-bubble:hover {
                background-color: #1f2937;
            }
            .chat-bubble:hover .icon-transform {
    transform: scale(1.15);
}

            .chat-window {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 360px;
                height: 600px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
                transition: all 0.3s ease;
            }

            .chat-window.open {
                opacity: 1;
                transform: translateY(0);
                pointer-events: all;
            }

            .chat-header {
                background: ${this.config.primaryColor};
                color: white;
                padding: 1.5rem;
            }

            .chat-header-title {
                font-size: 1.125rem;
                font-weight: 600;
                margin-bottom: 0.25rem;
            }

            .chat-header-subtitle {
                font-size: 0.875rem;
                opacity: 0.8;
            }

            .chat-messages {
                flex: 1;
                padding: 1.5rem;
                overflow-y: auto;
                background: ${this.config.secondaryColor};
            }

            .chat-message {
                margin-bottom: 1rem;
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .chat-message.user {
                align-items: flex-end;
            }

            .message-bubble {
                max-width: 80%;
                padding: 0.75rem 1rem;
                border-radius: 16px;
                font-size: 0.9375rem;
                line-height: 1.4;
            }

            .chat-message.user .message-bubble {
                background: ${this.config.primaryColor};
                color: white;
                border-bottom-right-radius: 4px;
            }

            .chat-message.agent .message-bubble {
                background: white;
                color: #1f2937;
                border-bottom-left-radius: 4px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .message-time {
                font-size: 0.75rem;
                color: #6b7280;
            }

            .chat-input-container {
                padding: 1.25rem;
                background: white;
                border-top: 1px solid #e5e7eb;
            }

            .chat-input-wrapper {
                display: flex;
                gap: 0.75rem;
                align-items: center;
            }

            .chat-input {
                flex: 1;
                padding: 0.75rem 1rem;
                border: 1px solid #e5e7eb;
                border-radius: 100px;
                font-size: 0.9375rem;
                transition: border-color 0.2s ease;
                outline: none;
            }

            .chat-input:focus {
                border-color: ${this.config.primaryColor};
            }

            .chat-send-button {
                background: ${this.config.primaryColor};
                color: white;
                border: none;
                padding: 0.75rem 1.25rem;
                border-radius: 100px;
                font-size: 0.9375rem;
                font-weight: 500;
                cursor: pointer;
                transition: transform 0.2s ease;
            }

            .chat-send-button:hover {
                transform: scale(1.05);
            }

            .chat-send-button:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
            }

            .typing-indicator {
                display: flex;
                gap: 0.25rem;
                padding: 0.75rem 1rem;
                background: white;
                border-radius: 16px;
                width: fit-content;
                margin-bottom: 1rem;
            }

            .typing-dot {
                width: 6px;
                height: 6px;
                background: #9ca3af;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-4px); }
            }

            @media (max-width: 640px) {
                .chat-window {
                    width: 100%;
                    height: 100%;
                    bottom: 0;
                    right: 0;
                    border-radius: 0;
                }

                .chat-bubble {
                    padding: 0.875rem 1.25rem;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    createWidget() {
        const container = document.createElement('div');
        container.className = 'chat-widget-container';

        container.innerHTML = `
            <div class="chat-window">
                <div class="chat-header">
                    <div>
                        <span class="chat-maxmize">
                        <svg width="1em" height="1em" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" fill-rule="evenodd" clip-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" style="transform: scale(1.2) scaleX(1);">
                         <g transform="matrix(1,0,0,-1,-2,22)"><path d="M15,3L21,3L21,9" style="fill: none; fill-rule: nonzero; stroke: currentcolor; stroke-width: 2px;"></path></g><g transform="matrix(1,0,0,-1,2,26)"><path d="M9,21L3,21L3,15" style="fill: none; fill-rule: nonzero; stroke: currentcolor; stroke-width: 2px;"></path></g><g transform="matrix(0.857864,-0.142136,0.142136,-0.857864,0.558456,24.5585)"><path d="M21,3L14,10" style="fill: none; fill-rule: nonzero; stroke: currentcolor; stroke-width: 2px;"></path>
                         </g><g transform="matrix(0.858562,-0.141438,0.141438,-0.858562,-0.545877,23.4541)"><path d="M3,21L10,14" style="fill: none; fill-rule: nonzero; stroke: currentcolor; stroke-width: 2px;"></path></g></svg>
                         </span>
                        <span class="chat-minimize">
                            <svg width="1em" height="1em" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" fill-rule="evenodd" clip-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" style="transform: scale(1.2) scaleX(1);"><g transform="matrix(-1,0.000780613,0.000780613,1,33.9953,9.98595)"><path d="M15,3L21,3L21,9" style="fill: none; fill-rule: nonzero; stroke: currentcolor; stroke-width: 2px;"></path></g>
                             <g transform="matrix(-1,-0.000254637,-0.000254637,1,14.0046,-9.99847)"><path d="M9,21L3,21L3,15" style="fill: none; fill-rule: nonzero; stroke: currentcolor; stroke-width: 2px;"></path></g><g transform="matrix(0.857864,-0.142136,0.142136,-0.857864,0.558456,24.5585)"><path d="M21,3L14,10" style="fill: none; fill-rule: nonzero; stroke: currentcolor; stroke-width: 2px;"></path></g><g transform="matrix(0.858562,-0.141438,0.141438,-0.858562,-0.545877,23.4541)">
                         <path d="M3,21L10,14" style="fill: none; fill-rule: nonzero; stroke: currentcolor; stroke-width: 2px;"></path></g></svg>
                        </span>    
                    </div>
                    <div class="chat-header-title">${this.config.title}</div>
                    <div class="chat-header-subtitle">${this.config.subtitle}</div>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <input type="text" class="chat-input" placeholder="Type your message...">
                        <button class="chat-send-button">Send</button>
                    </div>
                </div>
            </div>
            <div class="chat-bubble">
        <div class="widget-button-text">Chat</div>
        <div class="icon-container">
            <div class="icon-wrapper">
                <div class="icon-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor"
                        preserveAspectRatio="xMidYMid meet" width="24" height="24">
                        <path
                            d="M63.113,18.51v-.16C60.323,7.05,44.582,3,31.972,3S3.582,7,.792,18.5a66.22,66.22,0,0,0,0,20.46c1.18,4.74,5.05,8.63,11.36,11.41l-4,5A3.47,3.47,0,0,0,10.882,61a3.39,3.39,0,0,0,1.44-.31L26.862,54c1.79.18,3.49.27,5.07.27,11.04.04,28.41-4.04,31.18-15.43a60.33,60.33,0,0,0,0-20.33Z">
                        </path>
                    </svg>
                </div>
            </div>
            <div id="widget-online-badge" class="widget-online-badge"></div>
        </div>
    </div>
        `;

        document.body.appendChild(container);

        this.elements = {
            container,
            window: container.querySelector('.chat-window'),
            messages: container.querySelector('.chat-messages'),
            input: container.querySelector('.chat-input'),
            sendButton: container.querySelector('.chat-send-button'),
            bubble: container.querySelector('.chat-bubble')
        };
    }

    async initializeSocket() {
        try {
            this.socket = io(this.config.socketURL, {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            this.socket.on('connect', () => {
                this.state.isOnline = true;
                this.socket.emit('register', { userId: this.userId });
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                this.state.isOnline = false;
                this.showError('Connection failed. Retrying...');
            });

            this.socket.on('disconnect', () => {
                this.state.isOnline = false;
            });

            this.socket.on('message', (message) => {
                this.addMessage(message);
                if (!this.state.isOpen) {
                    this.state.unreadCount++;
                    this.updateUnreadCount();
                }
            });

            this.socket.on('typing', () => {
                this.showTypingIndicator();
            });
        } catch (error) {
            console.error('Socket initialization failed:', error);
            throw error;
        }
    }


    bindEvents() {
        this.elements.bubble.addEventListener('click', () => {
            this.toggleChat();
        });

        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.elements.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        this.elements.input.addEventListener('input', () => {
            this.socket.emit('typing', { userId: this.userId });
        });
    }

    toggleChat() {
        this.state.isOpen = !this.state.isOpen;
        this.elements.window.classList.toggle('open', this.state.isOpen);

        if (this.state.isOpen) {
            this.state.unreadCount = 0;
            this.updateUnreadCount();
            this.elements.input.focus();
        }
    }

    addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${message.userId === this.userId ? 'user' : 'agent'}`;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageElement.innerHTML = `
            <div class="message-bubble">${this.escapeHtml(message.text)}</div>
            <div class="message-time">${time}</div>
        `;

        this.elements.messages.appendChild(messageElement);
        this.scrollToBottom();
    }

    sendMessage() {
        const text = this.elements.input.value.trim();
        if (!text || this.state.isSending) return;

        this.state.isSending = true;
        this.elements.sendButton.disabled = true;

        const message = {
            userId: this.userId,
            text,
            timestamp: new Date().toISOString()
        };

        this.socket.emit('message', message, (error) => {
            this.state.isSending = false;
            this.elements.sendButton.disabled = false;

            if (error) {
                console.error('Failed to send message:', error);
                return;
            }

            this.elements.input.value = '';
            this.addMessage(message);
        });
    }

    showTypingIndicator() {
        const existingIndicator = this.elements.messages.querySelector('.typing-indicator');
        if (existingIndicator) return;

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;

        this.elements.messages.appendChild(indicator);
        this.scrollToBottom();

        setTimeout(() => {
            indicator.remove();
        }, 3000);
    }

    updateUnreadCount() {
        // Update the bubble with unread count if needed
        if (this.state.unreadCount > 0) {
            this.elements.bubble.setAttribute('data-count', this.state.unreadCount);
        } else {
            this.elements.bubble.removeAttribute('data-count');
        }
    }

    scrollToBottom() {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the widget with proper error handling
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const chatWidget = new ChatWidget({
            socketURL: 'http://localhost:4040',
            apiURL: 'http://localhost:4040/api',
            primaryColor: '#2563eb',
            title: 'Chat Support',
            subtitle: 'We typically reply within 5 minutes'
        });
        await chatWidget.init();
        window.chatWidget = chatWidget;
    } catch (error) {
        console.error('Failed to initialize chat widget:', error);
    }
});