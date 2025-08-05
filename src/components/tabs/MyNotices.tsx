import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";

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

const Notices: React.FC = () => {
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    const [activeTab, setActiveTab] = useState<string>('All');

    const API_URL = import.meta.env.VITE_API_URL;

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
        loadMyPosts();
    }, []);

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

    const getFilteredPosts = (): Post[] => {
        switch (activeTab) {
            case "Popular":
                return [...posts]
                    .sort((a, b) => b.views - a.views)
            case "New":
                return [...posts].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            case "Cheapest":
                return [...posts].sort((a, b) => a.price - b.price);
            case "Expensive":
                return [...posts].sort((a, b) => b.price - a.price);
            default:
                return posts;
        }
    };

    return (
        <div
            style={{
                width: "100%"
            }}
        >
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "flex-end",
                    marginBottom: "28px"
                }}
            >
                <p
                    style={{
                        paddingRight: "14px",
                        color: "white",
                        fontSize: "120%",
                        textTransform: "uppercase"
                    }}
                >
                    My Notices
                </p>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: "1"
                    }}
                >
                    <div style={{ display: "flex", gap: "28px" }}>
                        {["All", "Popular", "New", "Cheapest", "Expensive"].map((tab) => (
                            <div
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    color: activeTab === tab ? "#D9A441" : "#525252",
                                    cursor: "pointer",
                                    position: "relative",
                                    transition: "color 0.2s",
                                    padding: "0 6px 2px 6px"
                                }}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            height: "1px",
                                            width: "100%",
                                            backgroundColor: "#E9E9E9",
                                            transition: "all 0.3s ease-in-out",
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div
                        style={{
                            height: "1px",
                            backgroundColor: "#525252"
                        }}
                    />
                </div>
            </div>
            {loadingPosts ? (
                <Spinner animation="border" variant="light" />
            ) : posts.length === 0 ? (
                <p
                    style={{
                        marginTop: "28px",
                        color: "white",
                        textAlign: "center"
                    }}
                >You don't have any notices.</p>
            ) : (
                getFilteredPosts().map((post) => {
                    const images = getImageUrls(post.images);
                    return (
                        <div key={post.id} style={{ display: "flex", marginBottom: "28px" }}>
                            <div
                                onClick={() => navigate(`/post/${post.id}`)}
                                key={post.id}
                                style={{
                                    backgroundColor: "#0D0D0D",
                                    color: "white",
                                    marginBottom: "16px",
                                    width: "100%",
                                    display: "flex",
                                    transition: "background-color 0.2s",
                                    cursor: "pointer"
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
                                <div style={{
                                    position: "relative"
                                }}>
                                    <div style={{
                                        width: 0,
                                        height: 0,
                                        borderLeft: '120px solid transparent',
                                        borderBottom: '100px solid #101211',
                                        zIndex: "100",
                                        position: "absolute",
                                        top: "140px",
                                        left: "-120px"
                                    }} />
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default Notices;

