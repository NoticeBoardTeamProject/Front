import React, { useState, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
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

interface Post {
    id: number;
    title: string;
    caption: string;
    price: number;
    images: string;
    tags: string;
    views: number;
    isPromoted: boolean;
    createdAt: string;
    userId: number;
    category_id: number;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedSurname, setEditedSurname] = useState("");
    const [editedPhone, setEditedPhone] = useState("");

    const [activeTab, setActiveTab] = useState<"my notices" | "chat" | "settings">("my notices");
    const [selectedChat, setSelectedChat] = useState<{ userId: number, postId: number } | null>(null);

    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (location.state) {
            const { tab, userId, postId } = location.state as {
                tab?: "my notices" | "chat" | "settings",
                userId?: number,
                postId?: number
            };
            if (tab) setActiveTab(tab);
            if (userId && postId) setSelectedChat({ userId, postId });
        }
    }, [location.state]);

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

    const loadMyPosts = async () => {
        setLoadingPosts(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setPosts([]);
                setLoadingPosts(false);
                return;
            }
            const res = await axios.get<Post[]>(`${API_URL}/my/posts`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const postsWithSerializedImages = res.data.map(post => ({
                ...post,
                images: JSON.stringify(post.images ?? []),
            }));

            setPosts(postsWithSerializedImages);
        } catch (err) {
            console.error("Error loading my posts:", err);
            setPosts([]);
        } finally {
            setLoadingPosts(false);
        }
    };

    useEffect(() => {
        if (activeTab === "my notices") {
            loadMyPosts();
        }
    }, [activeTab]);

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

    const getImageUrls = (images: string): string[] => {
        try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed)) {
                return parsed.map((imgBase64: string) =>
                    imgBase64.startsWith("data:") ? imgBase64 : `data:image/jpeg;base64,${imgBase64}`
                );
            }
            return [];
        } catch {
            return [];
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}.${month}.${year} at ${hours}:${minutes}`;
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
            {activeTab === "my notices" && (
                <div
                    style={{
                        width: "100%",
                        marginTop: "28px"
                    }}
                >
                    {loadingPosts ? (
                        <Spinner animation="border" variant="light" />
                    ) : posts.length === 0 ? (
                        <p style={{ color: "white" }}>You don't have any posts.</p>
                    ) : (
                        posts.map((post) => {
                            const images = getImageUrls(post.images);
                            return (
                                <div key={post.id} style={{ display: "flex", marginBottom: "28px" }}>
                                    <div
                                        onClick={() => navigate(`/post/${post.id}`)}
                                        className="noise-overlay"
                                        style={{
                                            backgroundColor: "#0D0D0D",
                                            color: "white",
                                            width: "100%",
                                            display: "flex",
                                            cursor: "pointer",
                                            transition: "background-color 0.2s",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1a1a1a")}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0D0D0D")}
                                    >
                                        <img
                                            src={images[0]}
                                            style={{ objectFit: "cover", height: "240px", width: "300px" }}
                                            alt={post.title}
                                        />
                                        <div
                                            style={{
                                                width: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                padding: "28px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <div>
                                                    <p
                                                        style={{
                                                            fontWeight: "bold",
                                                            textTransform: "uppercase",
                                                            marginBottom: "12px",
                                                        }}
                                                    >
                                                        {post.title}
                                                    </p>
                                                    <p
                                                        style={{
                                                            marginBottom: "8px",
                                                            fontWeight: "lighter",
                                                            fontSize: "90%",
                                                            color: "#d7d7d7",
                                                        }}
                                                    >
                                                        {post.caption.length > 100
                                                            ? post.caption.slice(0, 100) + "..."
                                                            : post.caption}
                                                    </p>
                                                </div>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontWeight: "bold",
                                                        fontSize: "18px",
                                                        padding: "6px 18px",
                                                        borderRadius: "6px",
                                                        background:
                                                            "linear-gradient(to bottom,#d9a441 0%,#c6a974 50%,#cc8d18 100%)",
                                                        color: "#0D0D0D",
                                                        boxShadow:
                                                            "inset 2px 2px 5px #c78200, inset -2px -2px 5px #ad7307",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        height: "41.32px",
                                                    }}
                                                >
                                                    {post.price.toLocaleString("de-DE")}₴
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    fontSize: "80%",
                                                    color: "#a6a6a6",
                                                    paddingRight: "150px",
                                                }}
                                            >
                                                <p>Published {formatDate(post.createdAt)}</p>
                                                <div>Views: {post.views}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
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

