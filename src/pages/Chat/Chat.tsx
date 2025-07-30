import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, Spinner, Alert } from "react-bootstrap";

import SentMessageIcon from "../../assets/icons/SentMessageIcon.svg?react";

interface ChatProps {
    userId: number;
    postId: number;
}

interface UserShort {
    id: number;
    nickname: string;
}

interface PostShort {
    id: number;
    title: string;
}

interface ChatMessage {
    id: number;
    dialogue_id: number;
    user_id: number;
    message: string;
    timestamp: string;
}

interface DialogueDetailResponse {
    other_user: UserShort;
    post: PostShort;
    messages: ChatMessage[];
}

const Chat: React.FC<ChatProps> = ({ userId, postId }) => {
    const [dialogue, setDialogue] = useState<DialogueDetailResponse | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const fetchMessages = async () => {
        try {
            const res = await axios.get<DialogueDetailResponse>(
                `${API_URL}/chat/with/${userId}?post_id=${postId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setDialogue(res.data);
        } catch (err) {
            setError("Failed to load chat.");
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const res = await axios.post(
                `${API_URL}/chat/send`,
                {
                    other_user_id: userId,
                    post_id: postId,
                    message: newMessage,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (dialogue) {
                setDialogue({
                    ...dialogue,
                    messages: [
                        ...dialogue.messages,
                        {
                            id: res.data.message_id || Date.now(),
                            dialogue_id: 0,
                            user_id: Number(localStorage.getItem("userId")),
                            message: newMessage,
                            timestamp: new Date().toISOString(),
                        },
                    ],
                });
            }
            setNewMessage("");
        } catch {
            alert("Failed to send message");
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [userId, postId]);

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!dialogue)
        return <p>Unexpected error.</p>;

    return (
        <div
            style={{
                width: "400px",
                borderRadius: "12px",
                border: "1px solid #D9A441",
            }}
        >
            <div
                className="noise-overlay"
                style={{
                    color: "rgb(137, 143, 150)",
                    padding: "12px",
                    borderBottom: "1px solid #D9A441"
                }}
            >
                Chat with <span style={{ fontWeight: "900", color: "white" }}>{dialogue.other_user.nickname}</span> about <span style={{ fontWeight: "900", color: "white" }}>{dialogue.post.title}</span>
            </div>
            <div
                style={{
                    height: "400px",
                    overflowY: "auto",
                    padding: "12px",

                }}
            >
                {dialogue.messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            textAlign: msg.user_id === dialogue.other_user.id ? "left" : "right",
                            marginBottom: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: msg.user_id === dialogue.other_user.id ? "flex-start" : "flex-end"
                        }}
                    >
                        {msg.user_id != dialogue.other_user.id && (
                            <div
                                style={{
                                    fontSize: "9px",
                                    color: "#6c757d",
                                    margin: "3px 8px",
                                }}
                            >
                                {new Date(msg.timestamp).toLocaleString()}
                            </div>
                        )}
                        <div
                            style={{
                                display: "inline-block",
                                padding: "8px 10px",
                                backgroundColor: msg.user_id === dialogue.other_user.id ? "#D9A441" : "none",
                                borderRadius: "12px",
                                maxWidth: "70%",
                                color: msg.user_id === dialogue.other_user.id ? "#0D0D0D" : "white",
                                border: msg.user_id === dialogue.other_user.id ? "none" : "1.4px solid #D9A441"
                            }}
                        >
                            {msg.message}
                        </div>
                        {msg.user_id === dialogue.other_user.id && (
                            <div
                                style={{
                                    fontSize: "9px",
                                    color: "#6c757d",
                                    margin: "3px 8px",
                                }}
                            >
                                {new Date(msg.timestamp).toLocaleString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div
                style={{
                    padding: "12px"
                }}
            >
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                    }}
                >
                    <div style={{ display: "flex", gap: "8px" }}>
                        <Form.Control
                            type="text"
                            placeholder="Type a message"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button type="submit" variant="success">
                            <SentMessageIcon />
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Chat;
