import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper/PageWrapper";

interface Dialog {
    id: number;
    other_user: {
        id: number;
        nickname: string;
    };
    post: {
        id: number;
        title: string;
    };
    last_message?: string | null;
    last_message_time?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL;

const MyChats: React.FC = () => {
    const [dialogs, setDialogs] = useState<Dialog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyChats = async () => {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");

            try {
                const res = await axios.get<Dialog[]>(`${API_URL}/chat/my`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setDialogs(res.data);
            } catch (e) {
                setError("Failed to load chats.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyChats();
    }, []);

    if (loading) return <Spinner animation="border" />;
    if (error) return <p>{error}</p>;

    return (
        <PageWrapper>
            {dialogs.length === 0 ? (
                <p>No chats found.</p>
            ) : (
                dialogs.map((dialog) => (
                    <Card
                        key={dialog.id}
                        style={{
                            backgroundColor: "rgb(33, 37, 41)",
                            color: "white",
                            padding: "10px 15px",
                            marginBottom: "12px",
                            width: "400px"
                        }}
                    >
                        <p style={{ color: "rgb(137, 143, 150)" }}>
                            Chat with <span style={{ fontWeight: "900", color: "white" }}>{dialog.other_user.nickname}</span> about <span style={{ fontWeight: "900", color: "white" }}>{dialog.post.title}</span>
                        </p>
                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "flex-end",
                            }}
                        >
                            <div style={{ flex: 1, marginRight: "15px" }}>
                                <p
                                    style={{
                                        fontStyle: "italic",
                                        color: "rgb(137, 143, 150)",
                                        marginTop: "6px",
                                    }}
                                >
                                    {dialog.last_message && dialog.last_message.length > 100
                                        ? dialog.last_message.slice(0, 100) + "..."
                                        : dialog.last_message || "No messages yet"}
                                </p>
                                <small
                                    style={{
                                        color: "rgb(137, 143, 150)",
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    {dialog.last_message_time
                                        ? `at ${new Date(dialog.last_message_time).toLocaleString()}`
                                        : ""}
                                </small>
                            </div>

                            <div>
                                <Button
                                    variant="success"
                                    style={{ whiteSpace: "nowrap" }}
                                    onClick={() =>
                                        navigate(
                                            `/chat/${dialog.other_user.id}?postId=${dialog.post.id}`
                                        )
                                    }
                                >
                                    Go to chat
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </PageWrapper>
    );
};

export default MyChats;
