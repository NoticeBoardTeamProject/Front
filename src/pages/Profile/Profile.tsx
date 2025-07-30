import React, { useState, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";

import PageWrapper from "../../components/PageWrapper/PageWrapper";
import MyChats from "../MyChats/MyChats";
import Chat from "../Chat/Chat";

import Polygon from "../../assets/icons/Polygon.svg?react";

interface UserData {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    isEmailConfirmed: boolean;
    role: string;
    createdAt: string;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedSurname, setEditedSurname] = useState("");
    const [editedPhone, setEditedPhone] = useState("");

    const [activeTab, setActiveTab] = useState<"my notices" | "chat" | "settings">("my notices");
    const [selectedChat, setSelectedChat] = useState<{ userId: number, postId: number } | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const userData = response.data;
                setUser(userData);
                setEditedName(userData.name);
                setEditedSurname(userData.surname);
                setEditedPhone(userData.phone);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.dispatchEvent(new Event("loggedOut"));
        navigate("/login");
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            await axios.put(`${API_URL}/update-profile`, {
                name: editedName,
                surname: editedSurname,
                phone: editedPhone
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            setUser((prev) => prev ? {
                ...prev,
                name: editedName,
                surname: editedSurname,
                phone: editedPhone
            } : null);

            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update profile", err);
        }
    };

    if (loading) {
        return (
            <PageWrapper>
                <Spinner animation="border" variant="light" />
            </PageWrapper>
        );
    }

    if (!user) return null;

    return (
        <PageWrapper>
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    padding: "0 104px"
                }}
            >
                <Polygon width={180} height={180} fill="#D9A441" />
                <div
                    style={{
                        padding: "60px 12px"
                    }}
                >
                    <p
                        style={{
                            color: "white",
                            textTransform: "uppercase",
                            fontSize: "120%"
                        }}
                    >{user.name} {user.surname}</p>
                    <p
                        style={{
                            color: "#a6a6a6"
                        }}
                    >{user.email}</p>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    padding: "0 30px",
                    position: "relative",
                    top: "-36px"
                }}
            >
                {[
                    { label: "MY NOTICES", key: "my notices" },
                    { label: "CHAT", key: "chat" },
                    { label: "SETTINGS", key: "settings" }
                ].map(({ label, key }) => {
                    const isActive = activeTab === key;
                    return (
                        <div
                            key={key}
                            onClick={() => setActiveTab(key as "my notices" | "chat" | "settings")}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                cursor: "pointer",
                                width: "164px"
                            }}
                        >
                            <Polygon
                                width={180}
                                height={180}
                                style={{
                                    fill: isActive ? "#D9A441" : "none"
                                }}
                            />
                            <p
                                style={{
                                    position: "relative",
                                    top: "-100px",
                                    fontWeight: isActive ? "bold" : "normal",
                                    color: isActive ? "#000" : "#fff",
                                    textAlign: "center",
                                    width: "100%",
                                    textTransform: "uppercase"
                                }}
                            >
                                {label}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "flex-end"
                }}
            >
                <p
                    style={{
                        padding: "0px 14px",
                        color: "white",
                        fontSize: "120%",
                        textTransform: "uppercase"
                    }}
                >
                    {activeTab.replace(/^\w/, c => c.toUpperCase())}
                </p>
                <div
                    style={{
                        flex: "1",
                        height: "1px",
                        backgroundColor: "#E9E9E9",
                        marginBottom: "5px"
                    }}
                />
            </div>
            {activeTab === "chat" && (
                <div style={{ display: "flex", gap: "32px", padding: "20px 30px" }}>
                    <div style={{ flex: 1 }}>
                        <MyChats onSelectChat={(userId, postId) => setSelectedChat({ userId, postId })} />
                    </div>
                    {selectedChat && (
                        <Chat userId={selectedChat.userId} postId={selectedChat.postId} />
                    )}
                </div>
            )}
            {activeTab === "settings" && (
                <div
                    style={{
                        width: "100%",
                        padding: "0 14px",
                        marginTop: "28px"
                    }}
                >
                    <div
                        className="noise-overlay"
                        style={{
                            display: "flex",
                            gap: "14px",
                            padding: "28px 40px"
                        }}
                    >
                        <div>
                            <p
                                style={{
                                    color: "white",
                                    margin: "0 0 8px 4px"
                                }}
                            >Change name</p>
                            <Form.Control
                                type="text"
                                placeholder="Enter new name"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                            />
                        </div>
                        <div>
                            <p
                                style={{
                                    color: "white",
                                    margin: "0 0 8px 4px"
                                }}
                            >Change surname</p>
                            <Form.Control
                                type="text"
                                placeholder="Enter new surname"
                                value={editedSurname}
                                onChange={(e) => setEditedSurname(e.target.value)}
                            />
                        </div>
                        <div>
                            <p
                                style={{
                                    color: "white",
                                    margin: "0 0 8px 4px"
                                }}
                            >Change phone number</p>
                            <Form.Control
                                type="text"
                                placeholder="Enter new phone"
                                value={editedPhone}
                                onChange={(e) => setEditedPhone(e.target.value)}
                            />
                        </div>
                    </div>
                    <Form
                        style={{
                            marginTop: "16px",
                            display: "flex",
                            padding: "0 28px",
                            justifyContent: "space-between"
                        }}
                    >
                        <Button variant={isEditing ? 'success' : 'dark'} onClick={handleLogout}>
                            Exit account
                        </Button>
                        <Button style={{ marginLeft: "12px" }} variant='secondary' onClick={handleUpdate}>
                            Save changes
                        </Button>
                    </Form>
                </div>
            )}
        </PageWrapper>
    );
};

export default ProfilePage;

