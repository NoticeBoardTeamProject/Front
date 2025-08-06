import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";

import ButtonRight from "../../assets/icons/ButtonRight.svg?react";

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

type PageButtonProps = {
    page: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
};

const PageButton: React.FC<PageButtonProps> = ({ page, currentPage, setCurrentPage }) => (
    <button
        onClick={() => setCurrentPage(page)}
        style={{
            width: "40px",
            height: "40px",
            backgroundColor: page === currentPage ? "#D9A441" : "#0D0D0D",
            color: "white",
            border: page === currentPage ? "none" : "2px solid #D9A441",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
        }}
    >
        {page}
    </button>
);

const Dots = () => (
    <span
        style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            border: "2px solid #D9A441",
            borderRadius: "8px"
        }}
    >
        ...
    </span>
);

const Notices: React.FC = () => {
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    const [activeTab, setActiveTab] = useState<string>('All');

    const [currentPage, setCurrentPage] = useState<number>(1);
    const postsPerPage = 6;

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

    const filteredPosts = getFilteredPosts();
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const currentPosts = filteredPosts.slice(
        (currentPage - 1) * postsPerPage,
        currentPage * postsPerPage
    );

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
                <>
                    {currentPosts.map((post) => {
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
                    })}
                    {totalPages > 1 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "28px",
                                gap: "16px"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: 'space-between',
                                    width: "440px"
                                }}
                            >
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: currentPage === 1 ? "default" : "pointer",
                                        padding: 0,
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <ButtonRight
                                        width={50}
                                        height={50}
                                        style={{ transform: "scaleX(-1)" }}
                                    />
                                </button>

                                <div style={{ display: "flex", gap: "8px" }}>
                                    <PageButton page={1} currentPage={currentPage} setCurrentPage={setCurrentPage} />

                                    {currentPage > 3 && <Dots />}

                                    {currentPage > 2 && (
                                        <PageButton page={currentPage - 1} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                                    )}

                                    {currentPage !== 1 && currentPage !== totalPages && (
                                        <PageButton page={currentPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                                    )}

                                    {currentPage < totalPages - 1 && (
                                        <PageButton page={currentPage + 1} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                                    )}

                                    {currentPage < totalPages - 2 && <Dots />}

                                    {totalPages > 1 && <PageButton page={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
                                </div>

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: currentPage === totalPages ? "default" : "pointer",
                                        padding: 0,
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <ButtonRight width={50} height={50} />
                                </button>
                            </div>
                        </div>
                    )}
                </>

            )}
        </div>
    );
};

export default Notices;

