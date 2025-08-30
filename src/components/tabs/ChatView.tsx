import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Form, Button, InputGroup, Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";

import SentMessageIcon from "../../assets/icons/SentMessageIcon.svg?react";
import AvatarPlaceholder from "../../assets/icons/AvatarPlaceholder.svg?react";
import Review from "../../assets/icons/Review.svg?react";
import HollowStar from "../../assets/icons/HollowStar.svg?react";
import FullStar from "../../assets/icons/FullStar.svg?react";

const API_URL = import.meta.env.VITE_API_URL;

interface ChatMessage {
    id: number;
    dialogue_id: number;
    user_id: number;
    message: string;
    timestamp: string;
}

interface UserShort {
    id: number;
    nickname: string;
    avatarBase64?: string;
}

interface PostShort {
    id: number;
    title: string;
}

interface Dialogue {
    id: number;
    other_user: UserShort;
    post: PostShort;
    last_message?: string;
    last_message_time?: string;
}

interface DialogueDetailResponse {
    other_user: UserShort;
    post: PostShort;
    messages: ChatMessage[];
}

const ChatView: React.FC = () => {
    const location = useLocation();

    const [dialogs, setDialogs] = useState<Dialogue[]>([]);
    const [selectedChat, setSelectedChat] = useState<{ userId: number; postId: number } | null>(null);
    const [dialogue, setDialogue] = useState<DialogueDetailResponse | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(3);

    const token = localStorage.getItem("token");

    const fetchChatList = async () => {
        try {
            const res = await axios.get<Dialogue[]>(`${API_URL}/chat/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const sortedDialogs = res.data.sort((a, b) => {
                const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
                const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
                return timeB - timeA;
            });

            setDialogs(sortedDialogs);

            if (
                sortedDialogs.length > 0 &&
                !selectedChat &&
                !(location.state && (location.state as any).userId && (location.state as any).postId)
            ) {
                setSelectedChat({
                    userId: sortedDialogs[0].other_user.id,
                    postId: sortedDialogs[0].post.id,
                });
            }
        } catch {
            setError("Failed to load chat list.");
        }
    };

    useEffect(() => {
        if (location.state && (location.state as any).userId && (location.state as any).postId) {
            const { userId, postId } = location.state as { userId: number; postId: number };
            setSelectedChat({ userId, postId });
        }
    }, [location.state]);

    const fetchMessages = async (userId: number, postId: number) => {
        try {
            const res = await axios.get<DialogueDetailResponse>(`${API_URL}/chat/with/${userId}?post_id=${postId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDialogue(res.data);
        } catch {
            setError("Failed to load chat.");
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const res = await axios.post(
                `${API_URL}/chat/send`,
                {
                    other_user_id: selectedChat.userId,
                    post_id: selectedChat.postId,
                    message: newMessage,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
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

    const sendReview = async () => {
        if (!reviewText.trim() || rating === 0 || !selectedChat) return;

        try {
            const formData = new FormData();
            formData.append("sellerId", String(selectedChat.userId));
            formData.append("text", reviewText);
            formData.append("rating", String(rating));

            await axios.post(`${API_URL}/reviews`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setReviewText("");
            setRating(0);
            setShowReviewModal(false);
        } catch (err: any) {
            console.error(err.response?.data || err.message);
            alert("Failed to submit review");
        }
    };

    useEffect(() => {
        fetchChatList();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.userId, selectedChat.postId);
        }
    }, [selectedChat]);

    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div style={{ display: "flex", gap: "12px", minHeight: "560px" }}>
            {/* Ліва колонка */}
            <div
                style={{
                    width: "360px",
                    height: "560px",
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {dialogs.length === 0 ? (
                    <p style={{ color: "white", textAlign: "center" }}>No chats found.</p>
                ) : (
                    dialogs.map((dialog) => (
                        <div
                            key={dialog.id}
                            style={{
                                color: "white",
                                padding: "10px 15px",
                                marginBottom: "16px",
                                cursor: dialog.post.title === "Deleted post" ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "#0D0D0D",
                                transition: "background-color 0.2s",
                            }}
                            onClick={() => {
                                if (dialog.post.title !== "Deleted post") {
                                    setSelectedChat({ userId: dialog.other_user.id, postId: dialog.post.id });
                                }
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1a1a1a")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0D0D0D")}
                        >
                            {dialog.other_user.avatarBase64 ? (
                                <div
                                    style={{
                                        width: "60px",
                                        height: "58px",
                                        clipPath: "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                                        overflow: "hidden",
                                        border: "2px solid #ccc",
                                    }}
                                >
                                    <img
                                        src={dialog.other_user.avatarBase64}
                                        alt="Avatar"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                </div>
                            ) : (
                                <AvatarPlaceholder width={60} height={60} />
                            )}

                            <div style={{ flex: 1, marginLeft: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <p style={{ color: "rgb(137, 143, 150)" }}>
                                        <span style={{ fontWeight: 900, color: "white" }}>{dialog.other_user.nickname}</span>
                                    </p>
                                    <small style={{ color: "rgb(137, 143, 150)", fontSize: "0.75rem" }}>
                                        {dialog.last_message_time ? new Date(dialog.last_message_time).toLocaleString() : ""}
                                    </small>
                                </div>

                                <p style={{ fontStyle: "italic", color: "rgb(137, 143, 150)", marginTop: "6px" }}>
                                    {dialog.last_message && dialog.last_message.length > 100
                                        ? dialog.last_message.slice(0, 100) + "..."
                                        : dialog.last_message || "No messages yet"}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Права колонка */}
            {selectedChat && dialogue && (
                <div style={{ width: "480px" }}>
                    <div
                        style={{
                            color: "rgb(137, 143, 150)",
                            padding: "12px",
                            marginBottom: "12px",
                            backgroundColor: "#0D0D0D",
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <p>
                            Chat with <span style={{ fontWeight: 900, color: "white" }}>{dialogue.other_user.nickname}</span> about {" "}
                            <span style={{ fontWeight: 900, color: "white" }}>{dialogue.post.title}</span>
                        </p>
                        <Button type="button" variant="success" onClick={() => setShowReviewModal(true)}>
                            <Review width={22} height={22} />
                        </Button>
                    </div>

                    <div style={{ height: "400px", overflowY: "auto", padding: "12px", backgroundColor: "#0D0D0D" }}>
                        {dialogue.messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    textAlign: msg.user_id === dialogue.other_user.id ? "left" : "right",
                                    marginBottom: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: msg.user_id === dialogue.other_user.id ? "flex-start" : "flex-end",
                                }}
                            >
                                {msg.user_id !== dialogue.other_user.id && (
                                    <div style={{ fontSize: "9px", color: "#6c757d", margin: "3px 8px" }}>
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </div>
                                )}
                                <div
                                    style={{
                                        display: "inline-block",
                                        padding: "8px 10px",
                                        backgroundColor: msg.user_id === dialogue.other_user.id ? "#D9A441" : "none",
                                        borderRadius: "6px",
                                        maxWidth: "70%",
                                        color: msg.user_id === dialogue.other_user.id ? "#0D0D0D" : "white",
                                        border: msg.user_id === dialogue.other_user.id ? "none" : "1.4px solid #D9A441",
                                    }}
                                >
                                    {msg.message}
                                </div>
                                {msg.user_id === dialogue.other_user.id && (
                                    <div style={{ fontSize: "9px", color: "#6c757d", margin: "3px 8px" }}>
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: "12px", backgroundColor: "#0D0D0D" }}>
                        <Form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage();
                            }}
                        >
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Type a message"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <Button type="submit" variant="success">
                                    <SentMessageIcon width={22} height={22} />
                                </Button>
                            </InputGroup>
                        </Form>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
                <Modal.Body style={{ backgroundColor: "#0D0D0D", color: "white", borderRadius: "5.5px 5.5px 0 0" }} >
                    <Modal.Title>Leave a Review</Modal.Title>
                    <p style={{ fontSize: "0.9rem", color: "rgb(180, 180, 180)", marginTop: "6px", marginBottom: "16px" }}>
                        Your review helps other users understand how reliable and trustworthy this person is.
                        Please share your experience and rate your communication.
                    </p>
                    <div style={{ display: "flex", marginBottom: "12px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <div key={star} onClick={() => setRating(star)} style={{ cursor: "pointer" }}>
                                {star <= rating ? <FullStar width={28} height={28} /> : <HollowStar width={28} height={28} />}
                            </div>
                        ))}
                    </div>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Write your review..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: "#0D0D0D", color: "white", borderTop: "1px solid rgb(23, 25, 27)" }}>
                    <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={sendReview}>
                        Submit Review
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ChatView;