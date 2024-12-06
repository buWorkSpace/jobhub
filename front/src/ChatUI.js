import React, { useState, useRef, useEffect } from "react";

const ChatUI = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messageEndRef = useRef(null);

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = async () => {
        const trimmedInput = input.trim();
        const UserInput=input;
        
        if (!trimmedInput) return;

        if (trimmedInput.length > 1000) {
            alert("메시지가 너무 깁니다. 1000자 이하로 입력해주세요.");
            return;
        }

        const userMessage = { sender: "user", text: UserInput };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            // const response = await fetch("http://localhost:8000/llm/invoke", {
            const response = await fetch(
                "https://giving-sunny-earwig.ngrok-free.app/llm/invoke",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        input: { human_input: input },
                        config: { configurable: { session_id: "dddddaaa" } },
                        kwargs: {},
                    }),
                }
            );
            

            const data = await response.json();
            const serverMessage = {
                sender: "server",
                text: data.output.content || "응답이 없습니다.",
            };

            setMessages((prev) => [...prev, serverMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = {
                sender: "server",
                text: "서버와의 연결에 실패했습니다.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        }

        
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.messageContainer}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                justifyContent:
                                    msg.sender === "user"
                                        ? "flex-end"
                                        : "flex-start",
                                marginBottom: "1rem",
                            }}
                        >
                            <div
                                style={{
                                    ...styles.message,
                                    ...(msg.sender === "user"
                                        ? styles.userMessage
                                        : styles.serverMessage),
                                }}
                            >
                                <p style={styles.messageText}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messageEndRef}></div>
                </div>

                <div style={styles.inputContainer}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        style={styles.textarea}
                        rows={1}
                    />
                    <button onClick={sendMessage} style={styles.sendButton}>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "1rem",
        backgroundColor: "rgb(240, 249, 255)", // sky-50
    },
    card: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        maxWidth: "48rem",
        margin: "0 auto",
        width: "100%",
        backgroundColor: "white",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        border: "1px solid rgb(224, 242, 254)", // sky-100
        overflowY: "auto",
    },
    messageContainer: {
        flex: 1,
        overflowY: "auto",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    message: {
        maxWidth: "80%",
        padding: "0.75rem",
        borderRadius: "1rem",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    },
    userMessage: {
        backgroundColor: "rgb(14, 165, 233)", // sky-500
        color: "white",
        borderBottomRightRadius: "0",
    },
    serverMessage: {
        backgroundColor: "rgb(240, 249, 255)", // sky-50
        color: "rgb(17, 24, 39)", // gray-900
        border: "1px solid rgb(224, 242, 254)", // sky-100
        borderBottomLeftRadius: "0",
    },
    messageText: {
        fontSize: "0.875rem",
        lineHeight: "1.5",
        whiteSpace: "pre-wrap",
        textAlign: "left",
        margin: 0,
    },
    inputContainer: {
        padding: "1rem",
        borderTop: "1px solid rgb(224, 242, 254)", // sky-100
        backgroundColor: "rgba(240, 249, 255, 0.3)", // sky-50 with opacity
        display: "flex",
        gap: "0.5rem",
    },
    textarea: {
        flex: 1,
        resize: "none",
        padding: "0.5rem",
        borderRadius: "0.375rem",
        border: "1px solid rgb(224, 242, 254)", // sky-200
        backgroundColor: "white",
        fontSize: "0.875rem",
        outline: "none",
        transition:
            "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
        ":focus": {
            borderColor: "rgb(56, 189, 248)", // sky-400
            boxShadow: "0 0 0 2px rgba(56, 189, 248, 0.3)", // sky-400 with opacity
        },
    },
    sendButton: {
        padding: "0.5rem",
        backgroundColor: "rgb(14, 165, 233)", // sky-500
        color: "white",
        border: "none",
        borderRadius: "9999px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.15s ease-in-out",
        ":hover": {
            backgroundColor: "rgb(2, 132, 199)", // sky-600
        },
    },
};

export default ChatUI;
