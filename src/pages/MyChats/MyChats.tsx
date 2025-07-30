import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";

import Polygon from "../../assets/icons/Polygon.svg?react";
import UserIcon from "../../assets/icons/UserIcon.svg?react";

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

interface MyChatsProps {
    onSelectChat: (userId: number, postId: number) => void;
}

const MyChats: React.FC<MyChatsProps> = ({ onSelectChat }) => {
    const [dialogs, setDialogs] = useState<Dialog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

                const sortedDialogs = res.data.sort((a, b) => {
                    const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
                    const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
                    return timeB - timeA;
                });

                setDialogs(sortedDialogs);
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
        <div>
            {dialogs.length === 0 ? (
                <p style={{ color: "white" }}>No chats found.</p>
            ) : (
                dialogs.map((dialog) => (
                    <div
                        key={dialog.id}
                        className="noise-overlay"
                        style={{
                            color: "white",
                            padding: "10px 15px",
                            marginBottom: "12px",
                            border: "1px solid #D9A441",
                            width: "360px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "12px"
                        }}
                        onClick={() => {
                            if (dialog.post.title !== "Deleted post") {
                                onSelectChat(dialog.other_user.id, dialog.post.id);
                            }
                        }}
                    >
                        <Polygon width={58} height={58} fill="#D9A441"/>
                        <UserIcon
                            style={{
                                position: "relative",
                                left: "-33px"
                            }}
                            width={24}
                            height={24}
                            aria-label="Default user icon"
                        />
                        <div
                            style={{
                                width: "100%"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <p style={{ color: "rgb(137, 143, 150)" }}>
                                    <span style={{ fontWeight: "900", color: "white" }}>{dialog.other_user.nickname}</span>
                                </p>
                                <small
                                    style={{
                                        color: "rgb(137, 143, 150)",
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    {dialog.last_message_time
                                        ? `${new Date(dialog.last_message_time).toLocaleString()}`
                                        : ""}
                                </small>
                            </div>
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
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default MyChats;
