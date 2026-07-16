import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { useLeaveConfig } from '../hooks/useLeaveConfig';


import { FaMicrophone, FaStop, FaVolumeMute } from "react-icons/fa";

const MIN_MENU_QUERY_LENGTH = 3;

const findMatchingMenu = (menuOptions, query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length < MIN_MENU_QUERY_LENGTH || !menuOptions) {
        return null;
    }

    let bestMatch = null;
    let bestScore = 0;

    Object.entries(menuOptions).forEach(([menuName, items = []]) => {
        const menuLower = menuName.toLowerCase();
        let score = 0;

        if (menuLower === normalizedQuery) {
            score = 100;
        } else if (menuLower.startsWith(normalizedQuery)) {
            score = 90;
        } else if (
            menuLower.split(/\s+/).some((word) => word.startsWith(normalizedQuery))
        ) {
            score = 80;
        } else if (menuLower.includes(normalizedQuery)) {
            score = 70;
        } else if (normalizedQuery.includes(menuLower)) {
            score = 75;
        } else if (
            menuLower.split(/\s+/).some(
                (word) => word.length >= MIN_MENU_QUERY_LENGTH && normalizedQuery.includes(word)
            )
        ) {
            score = 65;
        } else if (
            items.some((item) =>
                item.label.toLowerCase().includes(normalizedQuery)
            )
        ) {
            score = 60;
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = menuName;
        }
    });

    return bestMatch;
};

function Chatbot({ chatOpen, setChatOpen, setSelectedMenu, menuOptions = {} }) {
    const navigate = useNavigate();


    
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hello! How can I help you today?"
        }
    ]);
    const [userName, setUserName] = useState("");
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [userDetails, setUserDetails] = useState(null);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const inputRef = useRef(null);
    const recognitionRef = useRef(null);
    const isListeningRef = useRef(false);
    const skipResultRef = useRef(false);
    const utteranceRef = useRef(null);
    const chatbotRef = useRef(null);
    const messagesEndRef = useRef(null);
useEffect(() => {
    const handleClickOutside = (event) => {
        if (
            chatOpen &&
            chatbotRef.current &&
            !chatbotRef.current.contains(event.target)
        ) {
            stopSpeaking();
            stopListening(true);

            setChatOpen(false);
            setInput("");
            setSelectedMenu(null);
            setIsListening(false);
            setIsSpeaking(false);

            setMessages([
                {
                    role: "assistant",
                    content: "Hello! How can I help you today?"
                }
            ]);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        document.removeEventListener(
            "mousedown",
            handleClickOutside
        );
    };
}, [chatOpen, setChatOpen, setSelectedMenu]);
useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
        behavior: "smooth"
    });
}, [messages]);

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.log("Speech Recognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isListeningRef.current = true;
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            if (skipResultRef.current) return;

            let interimText = "";
            let finalText = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalText += transcript;
                } else {
                    interimText += transcript;
                }
            }

            const speechText = (finalText || interimText).trim();

            if (!speechText) return;

            setInput(speechText);

            if (finalText) {
                setTimeout(() => {
                    if (skipResultRef.current) return;

                    inputRef.current?.focus();
                    document.dispatchEvent(
                        new KeyboardEvent("keydown", {
                            key: "Enter"
                        })
                    );
                }, 300);
            }
        };

        recognition.onerror = (event) => {
            // "aborted" / "no-speech" are normal when user stops the mic
            if (event.error !== "aborted" && event.error !== "no-speech") {
                console.log(event.error);
            }
            isListeningRef.current = false;
            setIsListening(false);
        };

        recognition.onend = () => {
            isListeningRef.current = false;
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            skipResultRef.current = true;
            try {
                recognition.abort();
            } catch {
                /* already stopped */
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    const userNameRef = useRef(userName);

    const { leaveTypes, balances } = useLeaveConfig();

    userNameRef.current = userName;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const username = localStorage.getItem("username");

                const res = await API.get(
                    `/users/username/${username}`
                );

                setUserName(
                    `${res.data.firstname} ${res.data.lastname}`
                );

                setUserDetails(res.data);

                const leaveRes = await API.get(
                    `/leave/my/${username}`
                );

                setLeaveHistory(leaveRes.data || []);

            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        if (!chatOpen) {
            window.speechSynthesis.cancel();
            utteranceRef.current = null;
            setIsSpeaking(false);
            skipResultRef.current = true;
            if (recognitionRef.current && isListeningRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch {
                    /* already stopped */
                }
            }
            isListeningRef.current = false;
            setIsListening(false);
            return;
        }

        setMessages([
            {
                role: "assistant",
                content: `Hi ${userNameRef.current}, How can I help you today?`
            }
        ]);
        setInput("");
    }, [chatOpen]);

    const stopSpeaking = () => {
        // Chrome sometimes needs cancel + resume to fully cut audio
        window.speechSynthesis.cancel();
        try {
            window.speechSynthesis.resume();
        } catch {
            /* ignore */
        }
        utteranceRef.current = null;
        setIsSpeaking(false);
    };

    const stopListening = (cancel = false) => {
        if (!recognitionRef.current || !isListeningRef.current) return;

        skipResultRef.current = cancel;

        try {
            if (cancel) {
                recognitionRef.current.abort();
            } else {
                recognitionRef.current.stop();
            }
        } catch {
            /* already stopped */
        }

        isListeningRef.current = false;
        setIsListening(false);
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech Recognition is not supported.");
            return;
        }

        // Clicking the mic always mutes AI speech first (like a real assistant)
        stopSpeaking();

        if (isListeningRef.current) {
            // Second tap: stop / cancel listening without auto-sending
            stopListening(true);
            return;
        }

        skipResultRef.current = false;

        try {
            recognitionRef.current.start();
        } catch {
            // Restart if the previous session did not release yet
            try {
                recognitionRef.current.abort();
                setTimeout(() => {
                    skipResultRef.current = false;
                    try {
                        recognitionRef.current?.start();
                    } catch (err) {
                        console.log(err);
                    }
                }, 200);
            } catch (err) {
                console.log(err);
            }
        }
    };

    const getLeaveBalanceByType = (leaveTypeName) => {
        if (!userDetails) return 0;

        const filtered = leaveHistory.filter(
            l => l.leaveType === leaveTypeName
        );

        const used = filtered
            .filter(l =>
                ["APPROVED", "PENDING", "APPLIED"]
                    .includes(l.status)
            )
            .reduce(
                (sum, l) => sum + Number(l.days || 0),
                0
            );

        let opening;

        if (leaveTypeName === "Adoption Leave") {
            const gender =
                (userDetails.gender || "")
                    .toUpperCase();

            opening =
                gender === "MALE"
                    ? 5
                    : gender === "FEMALE"
                        ? 84
                        : 0;

        } else {
            opening =
                balances?.[leaveTypeName] ?? 0;
        }

        return Math.max(0, opening - used);
    };

    const speak = (text) => {
        if (!text) return;

        stopSpeaking();

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 1;
        speech.pitch = 1;

        speech.onstart = () => {
            setIsSpeaking(true);
        };

        speech.onend = () => {
            utteranceRef.current = null;
            setIsSpeaking(false);
        };

        speech.onerror = () => {
            utteranceRef.current = null;
            setIsSpeaking(false);
        };

        utteranceRef.current = speech;

        // Small delay after cancel so the next utterance reliably starts
        setTimeout(() => {
            if (utteranceRef.current !== speech) return;
            window.speechSynthesis.speak(speech);
        }, 50);
    };

    const handleSendMessage = () => {
        if (!input.trim()) return;

        const userMessage = {
            role: "user",
            content: input
        };

        const text = input.toLowerCase().trim();

        let botResponse = "";

        if (
            text.includes("casual") ||
            text.includes("sick")
        ) {
            botResponse =
                `Your Casual / Sick Leave balance is ${getLeaveBalanceByType("Casual / Sick Leave")} Days`;
        }
        else if (text.includes("paternity")) {
            const gender =
                (userDetails?.gender || "")
                    .trim()
                    .toUpperCase();

            if (gender !== "MALE") {
                botResponse =
                    "Paternity Leave is not applicable for you.";
            } else {
                botResponse =
                    `Your Paternity Leave balance is ${getLeaveBalanceByType("Paternity Leave")} Days`;
            }
        }
        else if (text.includes("maternity")) {
            const gender =
                (userDetails?.gender || "")
                    .trim()
                    .toUpperCase();

            if (gender !== "FEMALE") {
                botResponse =
                    "Maternity Leave is not applicable for you.";
            } else {
                botResponse =
                    `Your Maternity Leave balance is ${getLeaveBalanceByType("Maternity Leave")} Days`;
            }
        }
        else if (text.includes("bereavement")) {
            botResponse =
                `Your Bereavement Leave balance is ${getLeaveBalanceByType("Bereavement Leave")} Days`;
        }
        else if (text.includes("adoption")) {
            botResponse =
                `Your Adoption Leave balance is ${getLeaveBalanceByType("Adoption Leave")} Days`;
        }
        else if (text.includes("lop")) {
            botResponse =
                "LOP Balance : 365 Days";
        }
        else if (
            text.includes("leave types") ||
            text.includes("which leave can i apply") ||
            text.includes("what leaves can i apply") ||
            text.includes("what leave types do i have") ||
            text.includes("eligible leaves") ||
            text.includes("available leaves")
        ) {
            const gender =
                (userDetails?.gender || "")
                    .trim()
                    .toUpperCase();

            const eligibleLeaveTypes = leaveTypes.filter((leaveType) => {
                const leaveName = (leaveType.name || "").toLowerCase();

                // Show Maternity only for Female
                if (leaveName.includes("maternity")) {
                    return gender === "FEMALE";
                }

                // Show Paternity only for Male
                if (leaveName.includes("paternity")) {
                    return gender === "MALE";
                }

                return true;
            });

            botResponse =
                "You are eligible for the following leave types:\n\n" +
                eligibleLeaveTypes
                    .map((leaveType) => `• ${leaveType.name}`)
                    .join("\n");
        }
        else if (
            text.includes("leave balance") ||
            text.includes("leave balances") ||
            text.includes("all leaves") ||
            text.includes("show my leave balance")
        ) {
            let balanceText = "Your Leave Balances:\n\n";

            const gender =
                (userDetails?.gender || "")
                    .trim()
                    .toUpperCase();

            const filteredLeaveTypes =
                leaveTypes.filter((lt) => {
                    const leaveName =
                        (lt.name || "")
                            .toLowerCase();

                    if (leaveName.includes("maternity")) {
                        return gender === "FEMALE";
                    }

                    if (leaveName.includes("paternity")) {
                        return gender === "MALE";
                    }

                    return true;
                });

            filteredLeaveTypes.forEach(type => {
                balanceText +=
                    `${type.name} : ${getLeaveBalanceByType(type.name)} Days\n`;
            });

            botResponse = balanceText;
        }
        else if (
            text.includes("hi") ||
            text.includes("hello") ||
            text.includes("hey") ||
            text.includes("hlo")
        ) {
            botResponse =
                `Hi ${userName}, How can I help you today?`;
        }
        else if (
            text.includes("profile") ||
            text.includes("account") ||
            text.includes("employee details") ||
            text.includes("my details") ||
            text.includes("my information")
        ) {
            botResponse = {
                type: "menu",
                title: "Profile Options",
                items: [
                    {
                        label: "My Profile",
                        path: "/profile"
                    }
                ]
            };

            setSelectedMenu("Core HR");
        }
        else {
            const matchedMenu = findMatchingMenu(menuOptions, text);

            if (matchedMenu) {
                botResponse = {
                    type: "menu",
                    title: matchedMenu,
                    items: menuOptions[matchedMenu] || []
                };

                setSelectedMenu(matchedMenu);
            } else {
                botResponse =
                    "Sorry, I don't have information about that.";
            }
        }

        setMessages(prev => [
            ...prev,
            userMessage,
            {
                role: "assistant",
                content: botResponse
            }
        ]);
        if (typeof botResponse === "string") {

            speak(botResponse);

        }

        setInput("");
        inputRef.current?.focus();
    };

    const handleClose = () => {
        stopSpeaking();
        stopListening(true);
        setChatOpen(false);
        setInput("");
        setSelectedMenu(null);
        setIsListening(false);
        setIsSpeaking(false);
        setMessages([
            {
                role: "assistant",
                content: "Hello! How can I help you today?"
            }
        ]);
    };

    return (
        <div
    ref={chatbotRef}
    className={`chatbot-panel ${chatOpen ? "open" : ""}`}
>
            <style>{`
                @keyframes chatbot-mic-pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.08); opacity: 0.85; }
                }
                @keyframes chatbot-speak-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.12); }
                }
            `}</style>
            <div className="chatbot-header">


                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img
                         src={`${process.env.PUBLIC_URL}/Logo-white.png`}
                        alt="Bizx Logo"
                        style={{
                            width: "28px",
                            height: "28px",
                            objectFit: "contain"
                        }}
                    />

                    <span>AI Assistant</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {isSpeaking && (
                        <button
                            type="button"
                            className="chatbot-close"
                            onClick={stopSpeaking}
                            title="Mute AI speech"
                            aria-label="Mute AI speech"
                            style={{
                                color: "#c62828",
                                animation: "chatbot-speak-pulse 1s ease-in-out infinite"
                            }}
                        >
                            <FaVolumeMute />
                        </button>
                    )}

                    <button
                        className="chatbot-close"
                        onClick={handleClose}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* <div className="chatbot-body">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={
                            msg.role === "user"
                                ? "user-message"
                                : "bot-message"
                        }
                    >
                        {typeof msg.content === "object" &&
                            msg.content.type === "menu" ? (
                            <>
                                <div>{msg.content.title}</div>

                                <div className="chatbot-links">
                                    {msg.content.items.map((item, i) => (
                                        <button
                                            key={i}
                                            className="chatbot-menu-link"
                                            onClick={() => navigate(item.path)}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            msg.content
                        )}
                    </div>
                ))}
            </div> */}

            <div className="chatbot-body">
    {messages.map((msg, index) => (
        <div
            key={index}
            className={
                msg.role === "user"
                    ? "user-message"
                    : "bot-message"
            }
        >
            {typeof msg.content === "object" &&
            msg.content.type === "menu" ? (
                <>
                    <div>{msg.content.title}</div>

                    <div className="chatbot-links">
                        {msg.content.items.map((item, i) => (
                            <button
                                key={i}
                                className="chatbot-menu-link"
                                onClick={() => navigate(item.path)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                msg.content
            )}
        </div>
    ))}

    {/* Auto-scroll target */}
    <div ref={messagesEndRef} />
</div>

            <div className="chatbot-footer">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    placeholder={
                        isListening
                            ? "Listening... tap stop to cancel"
                            : isSpeaking
                                ? "AI speaking... tap mute to stop"
                                : "Type your message..."
                    }
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSendMessage();
                        }
                    }}
                />

                <button
                    type="button"
                    onClick={isSpeaking ? stopSpeaking : toggleListening}
                    title={
                        isSpeaking
                            ? "Mute AI speech"
                            : isListening
                                ? "Stop listening"
                                : "Start voice input"
                    }
                    aria-label={
                        isSpeaking
                            ? "Mute AI speech"
                            : isListening
                                ? "Stop listening"
                                : "Start voice input"
                    }
                    aria-pressed={isListening || isSpeaking}
                    style={
                        isSpeaking
                            ? {
                                color: "#1565c0",
                                background: "#e3f2fd",
                                animation: "chatbot-speak-pulse 1s ease-in-out infinite"
                            }
                            : isListening
                                ? {
                                    color: "#c62828",
                                    background: "#ffebee",
                                    animation: "chatbot-mic-pulse 1.2s ease-in-out infinite"
                                }
                                : undefined
                    }
                >
                    {isSpeaking ? (
                        <FaVolumeMute />
                    ) : isListening ? (
                        <FaStop />
                    ) : (
                        <FaMicrophone />
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleSendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chatbot;
