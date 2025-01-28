// Chat Widget Implementation with proper DOM loading
// Chat Widget Implementation with proper DOM loading
(function () {
    const config = {
        socketURL: "http://localhost:4040",
        apiURL: "http://localhost:4040/api",
        color: '#39B3BA',
        title: 'Need help? Start a conversation'
    };

    function createAndInjectCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .chat-widget-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: Arial, sans-serif;
            }

            .chat-button {
                display: flex;
                align-items: center;
                background-color: ${config.color};
                width: 110px;
                border-radius: 50px;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
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
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
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

            .chatbox {
                display: none;
                position: absolute;
                bottom: 0px;
                right: 0px;
                width: 320px;
                height: 620px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                background-color: #f5f5f5;
                transition: width 0.5s ease;
            }

            .chatbox-header {
                padding: 10px;
                background-color: ${config.color};
                border-radius: 8px 8px 0 0;
            }

            .chatbox-header-1 {
                display: flex;
                justify-content: space-between;
            }

            .chatbox-header-3 {
                display: flex;
                color: white;
                font-weight: 600;
                align-items: center;
                gap: 10px;
                margin-top: 10px;
            }

            .chatbox-header-3-img {
                height: 40px;
                width: 40px;
                border-radius: 20px;
            }

            .chatbox-header-btn {
                background-color: ${config.color};
                color: white;
                border: none;
                border-radius: 50px;
                padding: 8px;
            }

            .chatbox-content {
                min-height: 430px;
                max-height: 435px;
                overflow-y: auto;
                padding: 10px;
                background-color: #f5f5f5;
            }

            .message {
                margin-bottom: 10px;
            }

            .message-text {
                background-color: #e0f7fa;
                padding: 8px;
                border-radius: 5px;
                display: inline-block;
                max-width: 80%;
            }

            .message.sent .message-text {
                background-color: ${config.color};
                color: white;
                float: right;
            }

            .chatbox-input {
                display: flex;
                padding: 10px;
                border-top: 1px solid #ddd;
                background: white;
            }

            .chatbox-input input {
                flex: 1;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 8px;
                margin-right: 5px;
            }

            .chatbox-input button {
                padding: 8px;
                background-color: ${config.color};
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            }

            .overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(8px);
                z-index: 999;
                display: none;
            }

            .overlay.show {
                display: block;
            }

            .options {
                position: relative;
                height: 0;
                width: 100%;
                background: white;
                z-index: 1000;
                bottom: 0;
                transition: height 0.5s ease;
            }

            .options-header {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                padding: 18px;
            }

            .options-name {
                align-self: flex-start;
                font-size: 18px;
            }

            .options-body-btn {
                display: flex;
                align-items: center;
                padding: 7px 36px;
                background-color: transparent;
                border: none;
                font-size: 0.875rem;
                color: #1e293b;
                cursor: pointer;
            }

            .options-body-btn .icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                background-color: #319795;
                border-radius: 50%;
                margin-right: 8px;
            }

            .color-picker-container {
                margin: 15px 0;
            }
        `;
        document.head.appendChild(style);
    }

    function createWidgetHTML() {
        return `
            <div class="chat-button">
                <div class="widget-button-text">Chat</div>
                <div class="icon-container">
                    <div class="icon-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor" width="24" height="24">
                            <path d="M63.113,18.51v-.16C60.323,7.05,44.582,3,31.972,3S3.582,7,.792,18.5a66.22,66.22,0,0,0,0,20.46c1.18,4.74,5.05,8.63,11.36,11.41l-4,5A3.47,3.47,0,0,0,10.882,61a3.39,3.39,0,0,0,1.44-.31L26.862,54c1.79.18,3.49.27,5.07.27,11.04.04,28.41-4.04,31.18-15.43a60.33,60.33,0,0,0,0-20.33Z"/>
                        </svg>
                    </div>
                    <div class="widget-online-badge"></div>
                </div>
            </div>
            <div class="chatbox">
                <div class="chatbox-header">
                    <div class="chatbox-header-1">
                        <button class="chatbox-header-btn expand-btn">
                            <!-- Expand icon SVG -->
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                            </svg>
                        </button>
                        <div class="chatbox-header-2">
                            <button class="chatbox-header-btn options-btn">
                                <!-- Options icon SVG -->
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="1"/>
                                    <circle cx="12" cy="5" r="1"/>
                                    <circle cx="12" cy="19" r="1"/>
                                </svg>
                            </button>
                            <button class="chatbox-header-btn close-btn">
                                <!-- Close icon SVG -->
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="chatbox-header-3">
                        <img src="https://files.smartsuppcdn.com/files/agents/avatars/989738-2HJJ0Irj6i.jpg?size=80" 
                             class="chatbox-header-3-img">
                        <span>${config.title}</span>
                    </div>
                </div>
                <div class="chatbox-main">
                    <div class="chatbox-content"></div>
                    <div class="chatbox-input">
                        <input type="text" placeholder="Type your message here">
                        <button class="send-button">Send</button>
                    </div>
                </div>
                <div class="overlay">
                    <div class="options">
                        <div class="options-header">
                            <button class="options-close-btn">×</button>
                            <div class="options-name"><span>Options</span></div>
                        </div>
                        <div class="color-picker-container">
                            <label for="color-picker">Choose Widget Color:</label>
                            <input type="color" id="color-picker" value="${config.color}">
                        </div>
                        <div class="color-picker-container">
                            <label for="bg-color-picker">Choose Background Color:</label>
                            <input type="color" id="bg-color-picker" value="${localStorage.getItem('chatWidgetBackground') || '#ffffff'}">
                        </div>
                        <button class="save-button">Save</button>
                    </div>
                </div>
            </div>
        `;
    }


    function loadSocketIO() {
        return new Promise((resolve, reject) => {
            if (window.io) {
                resolve(window.io);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.0.0/socket.io.min.js';
            script.onload = () => resolve(window.io);
            script.onerror = () => reject(new Error('Failed to load Socket.IO'));
            document.body.appendChild(script);
        });
    }

    function getOS() {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf("Windows NT") !== -1) return "Windows";
        if (userAgent.indexOf("Macintosh") !== -1) return "macOS";
        if (userAgent.indexOf("Android") !== -1) return "Android";
        if (userAgent.indexOf("iPhone") !== -1 || userAgent.indexOf("iPad") !== -1) return "iOS";
        if (userAgent.indexOf("X11") !== -1 || userAgent.indexOf("Linux") !== -1) return "Linux";
        return "Unknown OS";
    }

    function getLocationDetails(sessionID) {
        navigator.geolocation.getCurrentPosition(async function (position) {
            let res = await fetch(`${config.apiURL}/v1/location`, {
                method: "POST",  // HTTP method should be POST
                headers: {
                    "Content-Type": "application/json"  // Ensure the request body is JSON
                },
                body: JSON.stringify({
                    "sessionID": sessionID,
                    "accuracy": position.coords.accuracy,
                    "longitude": position.coords.longitude,
                    "latitude": position.coords.latitude
                })
            });
            console.log("Location data sent", res);
        }, function (error) {
            console.error("Geolocation error", error);
            return { "msg": "no" };
        });
    }

    function initializeWidget() {
        const container = document.createElement('div');
        container.className = 'chat-widget-container';
        container.innerHTML = createWidgetHTML();
        document.body.appendChild(container);

        // DOM Elements
        const chatButton = container.querySelector('.chat-button');
        const chatbox = container.querySelector('.chatbox');
        const messagesContainer = container.querySelector('.chatbox-content');
        const input = container.querySelector('input');
        const sendButton = container.querySelector('.send-button');
        const optionsBtn = container.querySelector('.options-btn');
        const closeBtn = container.querySelector('.close-btn');
        const expandBtn = container.querySelector('.expand-btn');
        const overlay = container.querySelector('.overlay');
        const optionsPanel = container.querySelector('.options');
        const optionsCloseBtn = container.querySelector('.options-close-btn');
        // Color picker change events (without saving until Save button clicked)
        const colorPicker = document.getElementById('color-picker');
        const bgColorPicker = document.getElementById('bg-color-picker');
        const saveButton = document.querySelector('.save-button');

        let newColor = colorPicker.value;
        let newBgColor = bgColorPicker.value;

        colorPicker.addEventListener('input', (e) => {
            newColor = e.target.value;
        });

        bgColorPicker.addEventListener('input', (e) => {
            newBgColor = e.target.value;
        });

        saveButton.addEventListener('click', () => {
            // Save selected colors to localStorage
            localStorage.setItem('chatWidgetColor', newColor);
            localStorage.setItem('chatWidgetBackground', newBgColor);

            // Apply the saved colors
            updateColor(newColor);
            document.body.style.backgroundColor = newBgColor;
        });

        // Load saved settings from localStorage
        loadSettings();

        function loadSettings() {
            const savedColor = localStorage.getItem('chatWidgetColor');
            const savedBg = localStorage.getItem('chatWidgetBackground');
            if (savedColor) {
                newColor = savedColor;
                updateColor(savedColor);
            }
            if (savedBg) {
                document.body.style.backgroundColor = savedBg;
            }
        }

        function updateColor(color) {
            const elementsToUpdate = document.querySelectorAll('.chat-button, .chatbox-header, .chatbox-header-btn');
            elementsToUpdate.forEach(el => el.style.backgroundColor = color);
        }
    


    // Toggle functions
    function toggleChatbox() {
        chatbox.style.display = chatbox.style.display === 'block' ? 'none' : 'block';
    }

    function toggleOptions() {
        overlay.classList.toggle('show');
        optionsPanel.style.height = optionsPanel.style.height === '0px' ? '260px' : '0px';
    }

    function toggleExpand() {
        chatbox.style.width = chatbox.style.width === '350px' ? '500px' : '350px';
    }

    // Event Listeners
    chatButton.addEventListener('click', toggleChatbox);
    optionsBtn.addEventListener('click', toggleOptions);
    closeBtn.addEventListener('click', toggleChatbox);
    expandBtn.addEventListener('click', toggleExpand);
    optionsCloseBtn.addEventListener('click', toggleOptions);

    // Message handling (keep previous implementation but update selectors)
    function addMessage(text, type, username = '') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        const displayText = type === 'sent' ? `You: ${text}` : `${username}: ${text}`;
        messageDiv.innerHTML = `<div class="message-text">${displayText}</div>`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        sendMessage();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    async function initSocket() {
        try {
            const io = await loadSocketIO();
            socket = io(config.socketURL);

            socket.on('connect', () => console.log('Connected to socket'));
            socket.on('disconnect', () => console.log('Disconnected from socket'));
            socket.on('receiveMessage', (data) => {
                addMessage(data.msg, 'received', data.username);
            });

            if (uniqueId) {
                socket.emit("join_room", { "room": uniqueId, "username": "Guest" });
                fetchPreviousMessages(uniqueId);
            } else {
                initSession();
            }
        } catch (error) {
            console.error('Socket initialization error:', error);
        }
    }

    async function initSession() {
        try {
            const os = getOS();
            const ipResponse = await fetch("https://api.ipify.org/?format=json");
            const ipData = await ipResponse.json();

            const response = await fetch(`${config.apiURL}/v1/session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ os, ip: ipData.ip })
            });

            const data = await response.json();
            if (data.message === "success") {
                uniqueId = data.id;
                localStorage.setItem("unique-id", uniqueId);
                socket.emit("join_room", { "room": uniqueId, "username": "Guest" });

                // Fetch and send location details after session initialization
                getLocationDetails(uniqueId);
            }
        } catch (error) {
            console.error('Session initialization error:', error);
        }
    }

    async function fetchPreviousMessages(id) {
        try {
            const response = await fetch(`${config.apiURL}/v1/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "session_id": id })
            });
            const data = await response.json();
            if (data.message.length) {
                data.message.forEach(msg => {
                    addMessage(msg.message, msg.user === "Guest" ? 'sent' : 'received', msg.user);
                });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    function sendMessage() {
        const message = input.value.trim();
        console.log("Message: ", message);

        if (message && socket) {
            socket.emit('sendMessage', { msg: message, room: uniqueId, username: "Guest" });
            addMessage(message, 'sent');
            input.value = '';
        }
    }

    // Event Listeners
    chatBubble.addEventListener('click', () => {
        widgetOpen = !widgetOpen;
        chatWindow.style.display = widgetOpen ? 'flex' : 'none';
    });

    // const sendButton = document.querySelector('.send-button'); // Ensure this matches the Send button selector

    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        sendMessage();
    });



    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    clearSessionButton.addEventListener('click', () => {
        localStorage.clear();
        uniqueId = '';
        messagesContainer.innerHTML = '';
        initSession();
    });

    // Initialize socket connection
    initSocket();
}

    // Wait for DOM to be ready before initializing
    if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        createAndInjectCSS();
        initializeWidget();
    });
} else {
    createAndInjectCSS();
    initializeWidget();
}
}) ();