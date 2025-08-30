import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";

import PageWrapper from "../../components/PageWrapper";

import AvatarPlaceholder from "../../assets/icons/AvatarPlaceholder.svg?react";
import DarkHexagon from "../../assets/icons/DarkHexagon.svg?react";
import OrangeHexagon from "../../assets/icons/OrangeHexagon.svg?react";

import CreateNotice from "../../components/tabs/CreateNotice";
import MyNotices from "../../components/tabs/MyNotices";
import Settings from "../../components/tabs/Settings";
import Verify from "../../components/tabs/Verify";
import ChatView from "../../components/tabs/ChatView";
import AdminPanel from "../../components/tabs/AdminPanel";
import Rating from "../../components/tabs/Rating";

interface UserData {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    avatarBase64: string;
    isVerified: string;
    isEmailConfirmed: boolean;
    role: string;
    createdAt: string;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<"my notices" | "chat" | "settings" | "create notice" | "verify" | "admin panel" | "rating">("my notices");

    const API_URL = import.meta.env.VITE_API_URL;

    const token = localStorage.getItem("token");
    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    useEffect(() => {
        if (location.state) {
            const { tab } = location.state as {
                tab?: "my notices" | "chat" | "settings" | "create notice" | "verify" | "admin panel" | "rating"
            };
            if (tab) setActiveTab(tab);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) return;

            try {
                const response = await axios.get(`${API_URL}/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const handleUsernameChange = () => {
            fetchUser();
        };

        window.addEventListener("changedUsernameData", handleUsernameChange);

        return () => {
            window.removeEventListener("changedUsernameData", handleUsernameChange);
        };
    }, [navigate, token]);

    if (!token) return null;

    if (loading) {
        return (
            <PageWrapper>
                <Spinner animation="border" variant="light" />
            </PageWrapper>
        );
    }

    const tabs = [
        { label: "MY NOTICES", key: "my notices" },
        { label: "CHAT", key: "chat" },
        { label: "SETTINGS", key: "settings" },
        user?.isVerified
            ? { label: "CREATE NOTICE", key: "create notice" }
            : { label: "VERIFY", key: "verify" },
        ...(user?.isVerified ? [{ label: "RATING", key: "rating" }] : []),
        ...(user?.role === "Admin" ? [{ label: "ADMIN PANEL", key: "admin panel" }] : [])
    ];

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
                {user.avatarBase64 ? (
                    <div
                        style={{
                            width: "180px",
                            height: "180px",
                            clipPath: "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                            overflow: "hidden",
                            border: "2px solid #ccc"
                        }}
                    >
                        <img
                            src={user.avatarBase64}
                            alt="Avatar Preview"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                            }}
                        />
                    </div>
                ) : (
                    <AvatarPlaceholder width={180} height={180} />
                )}
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
                {tabs.map(({ label, key }) => {
                    const isActive = activeTab === key;
                    return (
                        <div
                            key={key}
                            onClick={() => setActiveTab(key as "my notices" | "chat" | "settings" | "create notice" | "verify" | "admin panel" | "rating")}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                cursor: "pointer",
                                width: "164px"
                            }}
                        >
                            {isActive ? (
                                <OrangeHexagon
                                    width={180}
                                    height={180}
                                />
                            ) : (
                                <DarkHexagon
                                    width={180}
                                    height={180}
                                />
                            )}
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
            {activeTab === "chat" &&
                <ChatView />
            }
            {activeTab === "my notices" && (
                <MyNotices />
            )}
            {activeTab === "create notice" && (
                <CreateNotice />
            )}
            {activeTab === "settings" && (
                <Settings />
            )}
            {activeTab === "verify" && (
                <Verify />
            )}
            {activeTab === "admin panel" && (
                <AdminPanel />
            )}
            {activeTab === "rating" && (
                <Rating/>
            )}
        </PageWrapper>
    );
};

export default ProfilePage;

