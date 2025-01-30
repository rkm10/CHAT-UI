// Chat Widget Implementation with proper DOM loading

(function () {
    const config = {
        socketURL: "http://localhost:4040",
        apiURL: "http://localhost:4040/api",
        color: '#ffffff',
        backgroundColor: '#39B3BA',
        title: 'Need help? Start a conversation'
    };

    // Global state variables
    let hasMessages = false;
    let socket = null;
    let uniqueId = localStorage.getItem("unique-id");
    let widgetOpen = false;

    // This array holds messages that the user sent while there was no socket connection
    // Once a connection is established, we send them automatically.
    let pendingMessages = [];

    /**
     * Injects the necessary CSS into the <head>.
     */
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
                background-color: ${config.backgroundColor};
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
                color: ${config.color};
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
                color: ${config.color};
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
                transition: max-height 250ms ease-in-out, width 250ms ease-in-out;
                bottom: 24px;
                left: initial;
                right: 12px;
                z-index: 10000000;
                overflow: hidden;
                border-radius: 12px;
                box-shadow: rgba(0, 0, 0, 0.16) 0px 5px 40px;
                max-height: 672px;
                width: 380px;
                height: calc(100% - 40px);
                position: fixed;
                display: none;
            }

            .chatbox-header {
                padding: 10px;
                background-color: ${config.backgroundColor};
                border-radius: 8px 8px 0 0;
            }

            .chatbox-header-1 {
                display: flex;
                justify-content: space-between;
            }

            .chatbox-header-3 {
                display: flex;
                color: ${config.color};
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
                background-color: ${config.backgroundColor};
                color: ${config.color};
                height: 2rem;
                width: 2rem;
                border: none;
                border-radius: 9999px;
                padding: 0.25rem;
                font-size: 1.125rem;
                line-height: 1.75rem;
                cursor: pointer;
            }
                
            .chatbox-header-btn:hover {
                background-color: rgb(40 139 145) !important;
            }

            .chatbox-content {
                height: calc(100% - 100px);
                overflow-y: auto;
                padding: 10px;
                background-color: #f5f5f5;
            }

            .message {
                margin-bottom: 10px;
                clear: both;
            }

            .message-text {
                background-color: #e0f7fa;
                padding: 8px;
                border-radius: 5px;
                display: inline-block;
                max-width: 80%;
            }

            .message.sent .message-text {
                background-color: ${config.backgroundColor};
                color: ${config.color};
                float: right;
            }

            /* New chat input styles */
            .chatbox-input {
                position: absolute;
                bottom: 0;
                display: flex;
                align-items: center;
                padding: 16px;
                border-top: 1px solid #ddd;
                background: white;
                border-radius: 0 0 8px 8px;
                width: 94%;
                transition: width 0.5s ease;
            }

            .chatbox-input-wrapper {
                display: flex;
                align-items: center;
                width: 100%;
                background: #f5f5f5;
                border-radius: 24px;
                padding: 8px 16px;
                transition: all 0.3s ease;
            }

            .chatbox-input-wrapper:focus-within {
                background: #ffffff;
                box-shadow: 0 0 0 2px ${config.backgroundColor}40;
            }

            .chatbox-input input {
                flex: 1;
                border: none;
                background: transparent;
                padding: 8px;
                font-size: 14px;
                outline: none;
            }

            .send-button {
                opacity: 0;
                visibility: hidden;
                transform: scale(0.8);
                transition: all 0.3s ease;
                background: transparent;
                border: none;
                padding: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${config.backgroundColor};
            }

            .send-button.visible {
                opacity: 1;
                visibility: visible;
                transform: scale(1);
            }

            .send-button:hover {
                background: ${config.backgroundColor}20;
                border-radius: 50%;
            }

            .options {
                position: absolute;
                width: 100%;
                height: 100%;
                background: white;
                z-index: 1000;
                bottom: 0;
                border-radius: 12px;
                transition: all 0.3s ease;
                overflow-y: auto;
            }

            .options-header {
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
                position: sticky;
                top: 0;
                background: white;
                z-index: 1;
            }

            .options-name h2 {
                font-size: 1.5rem;
                font-weight: 600;
                color: #111827;
                margin: 0;
            }

            .options-body {
                padding: 1.5rem;
            }

            .options-section {
                margin-bottom: 2rem;
            }

            .options-section h3 {
                font-size: 1.1rem;
                font-weight: 600;
                color: #374151;
                margin-bottom: 1rem;
            }

            .color-picker-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding: 0.75rem;
                background: #f9fafb;
                border-radius: 8px;
            }

            .toggle-container {
                padding: 0.75rem;
                background: #f9fafb;
                border-radius: 8px;
            }

            .toggle {
                display: flex;
                align-items: center;
                cursor: pointer;
            }

            .toggle input {
                display: none;
            }

            .toggle-slider {
                position: relative;
                width: 48px;
                height: 24px;
                background-color: #e5e7eb;
                border-radius: 24px;
                transition: 0.3s;
                margin-right: 12px;
            }

            .toggle-slider:before {
                content: "";
                position: absolute;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: white;
                top: 2px;
                left: 2px;
                transition: 0.3s;
            }

            .toggle input:checked + .toggle-slider {
                background-color: #39B3BA;
            }

            .toggle input:checked + .toggle-slider:before {
                transform: translateX(24px);
            }

            .options-action-btn {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                width: 100%;
                padding: 0.75rem;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                color: #374151;
                cursor: pointer;
                transition: all 0.2s;
            }

            .options-action-btn.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            @media screen and (max-width: 768px) {
                button.chatbox-header-btn.expand-btn {
                    visibility: hidden;
                }

                .chatbox {
                    width: 100vw;
                    height: 100vh;
                    position: fixed;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border-radius: 0;
                }
                
                .chatbox-header {
                    border-radius: 0;
                }
                
                .chatbox-content {
                    height: calc(100vh - 100px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Creates the main widget HTML that will be injected into the DOM.
     */
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
                            <span class="maximize-icon" style="display:block;">
                            <svg width="24" height="24" viewBox="0 0 24 24" version="1.1" 
                                 xmlns="http://www.w3.org/2000/svg" 
                                 xmlns:xlink="http://www.w3.org/1999/xlink" 
                                 fill-rule="evenodd" clip-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                                <g transform="matrix(1,0,0,-1,-2,22)">
                                    <path d="M15,3L21,3L21,9" style="fill:none;fill-rule:nonzero;stroke:currentColor;stroke-width:2px;"></path>
                                </g>
                                <g transform="matrix(1,0,0,-1,2,26)">
                                    <path d="M9,21L3,21L3,15" style="fill:none;fill-rule:nonzero;stroke:currentColor;stroke-width:2px;"></path>
                                </g>
                                <g transform="matrix(0.857864,-0.142136,0.142136,-0.857864,0.558456,24.5585)">
                                    <path d="M21,3L14,10" style="fill:none;fill-rule:nonzero;stroke:currentColor;stroke-width:2px;"></path>
                                </g>
                                <g transform="matrix(0.858562,-0.141438,0.141438,-0.858562,-0.545877,23.4541)">
                                    <path d="M3,21L10,14" style="fill:none;fill-rule:nonzero;stroke:currentColor;stroke-width:2px;"></path>
                                </g>
                            </svg>
                            </span>
                            <span class="minimize-icon" style="display:none;">
                            <svg width="24" height="24" viewBox="0 0 24 24" version="1.1" 
                                 xmlns="http://www.w3.org/2000/svg" 
                                 xmlns:xlink="http://www.w3.org/1999/xlink" 
                                 fill-rule="evenodd" clip-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                                <g transform="matrix(-1,0.000780613,0.000780613,1,33.9953,9.98595)">
                                    <path d="M15,3L21,3L21,9" style="fill:none;fill-rule:nonzero;stroke:currentColor;stroke-width:2px;"></path>
                                </g>
                                <g transform="matrix(-1,-0.000254637,-0.000254637,1,14.0046,-9.99847)">
                                    <path d="M9,21L3,21L3,15" style="fill:none;fill-rule:nonzero;stroke:currentColor;stroke-width:2px;"></path>
                                </g>
                                <g transform="matrix(0.857864,-0.142136,0.142136,-0.857864,0.558456,24.5585)">
                                    <path d="M21,3L14,10" style="fill:none;fill-rule:nonzero;stroke:currentColor;stroke-width:2px;"></path>
                                </g>
                                <g transform="matrix(0.858562,-0.141438,0.141438,-0.858562,-0.545877,23.4541)">
                                    <path d="M3,21L10,14" style="fill:none;fill-rule:nonzero;stroke:currentColor;stroke-width:2px;"></path>
                                </g>
                            </svg>
                            </span>
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
                            <span class="options-close-btn">
                                <svg viewBox="0 0 24 24" width="1em" height="1em">
                                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" 
                                          stroke-width="2" d="M18 6L6 18M6 6l12 12"></path>
                                </svg>
                            </span>
                            <div class="options-name">
                                <h2>Chat Settings</h2>
                            </div>
                        </div>
                        <div class="options-body">
                            <div class="options-section">
                                <h3>Appearance</h3>
                                <div class="color-picker-container">
                                    <label for="color-picker">Widget Background Color</label>
                                    <input type="color" id="color-picker" 
                                           value="${localStorage.getItem('chatWidgetBackground') || '#39B3BA'}">
                                </div>
                                <div class="color-picker-container">
                                    <label for="bg-color-picker">Widget Text Color</label>
                                    <input type="color" id="bg-color-picker" 
                                           value="${localStorage.getItem('chatWidgetColor') || '#ffffff'}">
                                </div>
                            </div>
                            
                            <div class="options-section">
                                <h3>Notifications</h3>
                                <div class="toggle-container">
                                    <label class="toggle">
                                        <input type="checkbox" id="sound-toggle" 
                                               ${localStorage.getItem('soundEnabled') === 'true' ? 'checked' : ''}>
                                        <span class="toggle-slider"></span>
                                        <span class="toggle-label">Play notification sounds</span>
                                    </label>
                                </div>
                            </div>

                            <div class="options-section">
                                <h3>Chat History</h3>
                                <button class="options-action-btn download-transcript disabled" disabled>
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5 5l5-5m-5 5V3">
                                        </path>
                                    </svg>
                                    Download Chat Transcript
                                </button>
                            </div>

                            <div class="options-section">
                                <h3>Privacy</h3>
                                <button class="options-action-btn privacy-btn">
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z">
                                            </path>
                                        </g>
                                    </svg>
                                    GDPR and Privacy Policy
                                </button>
                            </div>

                            <div class="options-actions">
                                <button class="reset-button">Reset to Default</button>
                                <button class="save-button">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Dynamically load Socket.IO if it's not already available.
     */
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

    /**
     * Detect the user's operating system from the user agent.
     */
    function getOS() {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf("Windows NT") !== -1) return "Windows";
        if (userAgent.indexOf("Macintosh") !== -1) return "macOS";
        if (userAgent.indexOf("Android") !== -1) return "Android";
        if (userAgent.indexOf("iPhone") !== -1 || userAgent.indexOf("iPad") !== -1) return "iOS";
        if (userAgent.indexOf("X11") !== -1 || userAgent.indexOf("Linux") !== -1) return "Linux";
        return "Unknown OS";
    }

    /**
     * Attempt to send location details to the server if the user allows geolocation.
     */
    function getLocationDetails(sessionID) {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            async function (position) {
                try {
                    let res = await fetch(`${config.apiURL}/v1/location`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            sessionID: sessionID,
                            accuracy: position.coords.accuracy,
                            longitude: position.coords.longitude,
                            latitude: position.coords.latitude
                        })
                    });
                    console.log("Location data sent", res);
                } catch (err) {
                    console.error("Failed to send location data:", err);
                }
            },
            function (error) {
                console.error("Geolocation error", error);
            }
        );
    }

    /**
     * Initialize the entire chat widget once the DOM is ready.
     */
    function initializeWidget() {
        const container = document.createElement('div');
        container.className = 'chat-widget-container';
        container.innerHTML = createWidgetHTML();
        document.body.appendChild(container);

        // DOM Elements
        const chatButton = container.querySelector('.chat-button');
        const chatbox = container.querySelector('.chatbox');
        const messagesContainer = container.querySelector('.chatbox-content');
        const input = container.querySelector('.chatbox-input input');
        const sendButton = container.querySelector('.send-button');
        const optionsBtn = container.querySelector('.options-btn');
        const closeBtn = container.querySelector('.close-btn');
        const expandBtn = container.querySelector('.expand-btn');
        const overlay = container.querySelector('.overlay');
        const optionsPanel = container.querySelector('.options');
        const maximizeIcon = container.querySelector('.maximize-icon');
        const minimizeIcon = container.querySelector('.minimize-icon');
        const optionsCloseBtn = container.querySelector('.options-close-btn');
        const widgetBgColorPicker = document.getElementById('color-picker');
        const widgetTextColorPicker = document.getElementById('bg-color-picker');
        const saveButton = document.querySelector('.save-button');
        const resetThemeButton = document.querySelector('.reset-button');
        const soundToggle = document.getElementById('sound-toggle');
        const downloadTranscriptBtn = document.querySelector('.download-transcript');

        let newWidgetBg = widgetBgColorPicker.value;
        let newWidgetText = widgetTextColorPicker.value;

        // --- THEME HANDLERS ---
        widgetBgColorPicker.addEventListener('input', (e) => {
            newWidgetBg = e.target.value;
        });

        widgetTextColorPicker.addEventListener('input', (e) => {
            newWidgetText = e.target.value;
        });

        saveButton.addEventListener('click', () => {
            // Save selected colors to localStorage
            localStorage.setItem('chatWidgetBackground', newWidgetBg);
            localStorage.setItem('chatWidgetColor', newWidgetText);

            // Apply the saved colors
            updateBgColor(newWidgetBg);
            updateColor(newWidgetText);
        });

        resetThemeButton.addEventListener('click', () => {
            // Reset to default colors
            newWidgetBg = '#39B3BA';
            newWidgetText = '#ffffff';
            widgetBgColorPicker.value = newWidgetBg;
            widgetTextColorPicker.value = newWidgetText;
            updateBgColor(newWidgetBg);
            updateColor(newWidgetText);
        });

        function loadSettings() {
            const savedColor = localStorage.getItem('chatWidgetBackground');
            const savedBg = localStorage.getItem('chatWidgetColor');
            if (savedColor) {
                newWidgetBg = savedColor;
                updateBgColor(savedColor);
            }
            if (savedBg) {
                newWidgetText = savedBg;
                updateColor(savedBg);
            }
        }

        function updateBgColor(color) {
            const elementsToUpdate = document.querySelectorAll(
                '.chat-button, .chatbox-header, .chatbox-header-btn, .send-button, .save-button, .icon'
            );
            elementsToUpdate.forEach(el => el.style.backgroundColor = color);
        }

        function updateColor(color) {
            const elementsToUpdate = document.querySelectorAll(
                '.chat-button, .chatbox-header, .chatbox-header-btn, .send-button, .save-button, .icon, .chatbox-header-3'
            );
            elementsToUpdate.forEach(el => el.style.color = color);
        }

        loadSettings(); // load theme on startup

        // --- WIDGET TOGGLE / EXPAND / CLOSE ---
        function toggleChatbox() {
            chatbox.style.display = (chatbox.style.display === 'block') ? 'none' : 'block';
        }

        function toggleOptions() {
            overlay.classList.toggle('show');
            optionsPanel.style.height = (optionsPanel.style.height === '0%') ? '100%' : '0%';
        }

        function toggleExpand() {
            if (chatbox.style.width === '') {
                // expand
                chatbox.style.width = '35vw';
                chatbox.style.maxHeight = '878px';
                maximizeIcon.style.display = 'none';
                minimizeIcon.style.display = 'block';
            } else {
                // collapse
                chatbox.style.width = '';
                chatbox.style.maxHeight = '672px';
                maximizeIcon.style.display = 'block';
                minimizeIcon.style.display = 'none';
            }
        }

        chatButton.addEventListener('click', toggleChatbox);
        optionsBtn.addEventListener('click', toggleOptions);
        closeBtn.addEventListener('click', toggleChatbox);
        expandBtn.addEventListener('click', toggleExpand);
        optionsCloseBtn.addEventListener('click', toggleOptions);

        // --- SOUND TOGGLE ---
        soundToggle.addEventListener('change', (e) => {
            localStorage.setItem('soundEnabled', e.target.checked);
        });

        // --- DOWNLOAD TRANSCRIPT ---
        function handleDownloadTranscript() {
            if (!hasMessages) return;
            const allMessages = Array.from(document.querySelectorAll('.message'))
                .map(msg => msg.textContent)
                .join('\n');
            const blob = new Blob([allMessages], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'chat-transcript.txt';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        downloadTranscriptBtn.addEventListener('click', handleDownloadTranscript);

        // --- MESSAGE DOM MANIPULATION ---
        function addMessageToDOM(text, type, username = '') {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            let displayText;
            if (type === 'sent') {
                displayText = `You: ${text}`;
            } else if (type === 'received') {
                displayText = `${username}: ${text}`;
            } else {
                displayText = text;
            }
            messageDiv.innerHTML = `<div class="message-text">${displayText}</div>`;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            hasMessages = true;
            if (downloadTranscriptBtn) {
                downloadTranscriptBtn.classList.remove('disabled');
                downloadTranscriptBtn.disabled = false;
            }
        }

        // --- INPUT AND SENDING ---
        function sendMessage() {
            const message = input.value.trim();
            if (!message) return;

            // Show in UI immediately
            addMessageToDOM(message, 'sent');
            input.value = '';
            sendButton.classList.remove('visible');

            // If socket is connected, send it immediately
            if (socket && socket.connected && uniqueId) {
                socket.emit('sendMessage', { msg: message, room: uniqueId, username: "Guest" });
            } else {
                // Otherwise, queue for later
                pendingMessages.push(message);
            }
        }

        // Show/hide the "Send" button based on input
        input.addEventListener('input', function () {
            if (this.value.trim()) {
                sendButton.classList.add('visible');
            } else {
                sendButton.classList.remove('visible');
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
        sendButton.addEventListener('click', sendMessage);
    }

    /**
     * Initialize or re-initialize the socket connection.
     */
    async function initSocket() {
        try {
            const io = await loadSocketIO();
            socket = io(config.socketURL);

            socket.on('connect', async () => {
                console.log('Connected to socket, ID:', socket.id);

                // If we have an existing session, join the room
                if (uniqueId) {
                    socket.emit("join_room", { room: uniqueId, username: "Guest" });
                }

                // Send any messages that were queued while offline
                if (pendingMessages.length > 0 && uniqueId) {
                    console.log('Sending pending messages:', pendingMessages);
                    pendingMessages.forEach(msg => {
                        socket.emit('sendMessage', { msg, room: uniqueId, username: "Guest" });
                    });
                    pendingMessages = [];
                }
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            socket.on('receiveMessage', (data) => {
                // 'data' contains msg, username, etc.
                addMessageToDOM(data.msg, 'received', data.username || 'Agent');
                // Play sound if enabled
                if (localStorage.getItem('soundEnabled') === 'true') {
                    const notificationSound = new Audio('https://rajkumarmalluri.vercel.app/images/pyk-toon-n-n.mp3');
                    notificationSound.play().catch(err => console.log('Error playing sound:', err));
                }
            });

            // If no uniqueId, let's create a new session
            if (!uniqueId) {
                await initSession();
            } else {
                // If we already have a session, fetch old messages
                const olderMessages = await fetchPreviousMessages(uniqueId);
                olderMessages.forEach(msg => {
                    const isSent = (msg.user === "Guest") ? 'sent' : 'received';
                    addMessageToDOM(msg.message, isSent, msg.user);
                });
            }
        } catch (error) {
            console.error('Socket initialization error:', error);
        }
    }

    /**
     * Creates a new session on the server, stores uniqueId in localStorage,
     * and attempts to gather location info.
     */
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
                if (socket) {
                    socket.emit("join_room", { room: uniqueId, username: "Guest" });
                }
                getLocationDetails(uniqueId);
            }
        } catch (error) {
            console.error('Session initialization error:', error);
            throw error;
        }
    }

    /**
     * Fetch old messages for a given session ID.
     */
    async function fetchPreviousMessages(sessionId) {
        try {
            const response = await fetch(`${config.apiURL}/v1/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId })
            });
            const data = await response.json();
            return data.message || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    /**
     * Helper: add message to the DOM (to be used by socket events).
     * We define it outside so socket events can call it,
     * but the main usage is in initSocket.
     */
    function addMessageToDOM(text, type, username) {
        // We'll find the container from the DOM
        const container = document.querySelector('.chatbox-content');
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        let displayText = text;
        if (type === 'sent') {
            displayText = `You: ${text}`;
        } else if (type === 'received') {
            displayText = `${username}: ${text}`;
        }
        messageDiv.innerHTML = `<div class="message-text">${displayText}</div>`;
        container.appendChild(messageDiv);

        container.scrollTop = container.scrollHeight;

        // Enable transcript download
        hasMessages = true;
        const dlBtn = document.querySelector('.download-transcript');
        if (dlBtn) {
            dlBtn.classList.remove('disabled');
            dlBtn.disabled = false;
        }
    }

    // ------------- MAIN ENTRY POINTS -------------
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            createAndInjectCSS();
            initializeWidget();
            initSocket(); // start the socket connection attempt
        });
    } else {
        createAndInjectCSS();
        initializeWidget();
        initSocket(); // start the socket connection attempt
    }
})();

