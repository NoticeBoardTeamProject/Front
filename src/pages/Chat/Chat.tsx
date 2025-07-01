import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import PageWrapper from "../../components/PageWrapper/PageWrapper";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare } from "@fortawesome/free-solid-svg-icons";

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

const Chat: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();
    const postId = searchParams.get("postId");

    const [dialogue, setDialogue] = useState<DialogueDetailResponse | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const fetchMessages = async () => {
        if (!userId || !postId) {
            setError("User ID или Post ID не указаны");
            setLoading(false);
            return;
        }

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

            console.log(res.data);
        } catch (err) {
            setError("Failed to load chat.");
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !userId || !postId) return;

        try {
            const res = await axios.post(
                `${API_URL}/chat/send`,
                {
                    other_user_id: Number(userId),
                    post_id: Number(postId),
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
        return <p>Диалог не найден или данные отсутствуют.</p>;

    return (
        <PageWrapper>
            <Card style={{ background: "rgb(33, 37, 41)", width: "400px" }}>
                <Card.Header style={{ color: "rgb(137, 143, 150)" }}>
                    Chat with <span style={{fontWeight: "900", color: "white"}}>{dialogue.other_user.nickname}</span> about <span style={{fontWeight: "900", color: "white"}}>{dialogue.post.title}</span>
                </Card.Header>
                <Card.Body style={{ height: "400px", overflowY: "auto" }}>
                    {dialogue.messages.map((msg) => (
                        <div
                            key={msg.id}
                            style={{
                                textAlign:
                                    msg.user_id === dialogue.other_user.id ? "left" : "right",
                                marginBottom: "10px",
                            }}
                        >
                            <div
                                style={{
                                    display: "inline-block",
                                    padding: "8px 10px",
                                    backgroundColor:
                                        msg.user_id === dialogue.other_user.id
                                            ? "rgb(23, 25, 27)"
                                            : "rgb(25, 135, 84)",
                                    borderRadius: "12px",
                                    maxWidth: "80%",
                                    color: "white",
                                }}
                            >
                                {msg.message}
                            </div>
                            <div
                                style={{
                                    fontSize: "9px",
                                    color: "#6c757d",
                                    margin: "3px 8px",
                                }}
                            >
                                {new Date(msg.timestamp).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </Card.Body>
                <Card.Footer>
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
                                style={{
                                    backgroundColor: "rgb(23, 25, 27)",
                                }}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <Button type="submit" variant="success">
                                <FontAwesomeIcon icon={faShare} />
                            </Button>
                        </div>
                    </Form>
                </Card.Footer>
            </Card>
        </PageWrapper>
    );
};

export default Chat;
