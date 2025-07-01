import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Spinner, Card, Alert, Button, Modal, Form } from "react-bootstrap";
import { Carousel } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faEye, faMessage, faPhone, faEnvelope, faUser, faFlag, faShare } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper/PageWrapper";

interface User {
    id: number;
    name: string;
    surname: string;
    phone?: string | null;
    email: string;
    avatarBase64?: string | null;
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
    user: User;
}

const PostDetails: React.FC = () => {
    const navigate = useNavigate();
    const { postId } = useParams<{ postId: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportType, setReportType] = useState<"post" | "user" | null>(null);
    const [reportText, setReportText] = useState("");
    const [sendingReport, setSendingReport] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);
    const [reportSuccess, setReportSuccess] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get<Post>(`${API_URL}/posts/${postId}`);
                setPost({
                    ...res.data,
                    images: JSON.stringify(res.data.images ?? []),
                });
            } catch (err: any) {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    setError("Post not found.");
                } else {
                    setError("Failed to load post.");
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        };

        if (postId) fetchPost();
    }, [postId, API_URL]);

    const getImageUrls = (images: string): string[] => {
        try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed)) {
                return parsed.map((img: string) =>
                    img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`
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

    const openReportModal = (type: "post" | "user") => {
        setReportType(type);
        setReportText("");
        setReportError(null);
        setReportSuccess(null);
        setShowReportModal(true);
    };

    const closeReportModal = () => {
        setShowReportModal(false);
    };

    const sendReport = async () => {
        if (!reportText.trim()) {
            setReportError("Please describe the nature of the complaint.");
            return;
        }

        setSendingReport(true);
        setReportError(null);
        setReportSuccess(null);

        const token = localStorage.getItem("token");

        try {
            const payload =
                reportType === "post"
                    ? { post_id: post?.id, message: reportText.trim() }
                    : { user_id: post?.userId, message: reportText.trim() };

            await axios.post(`${API_URL}/complaints`, payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

            setReportSuccess("Complaint sent successfully. Thank you!");
            setReportText("");

            setTimeout(() => {
                setShowReportModal(false);
            }, 2000);
        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response?.data?.detail) {
                setReportError(`${err.response.data.detail}`);
            } else {
                setReportError("Failed to submit your complaint. Please try again later.");
            }
        } finally {
            setSendingReport(false);
        }
    };

    if (!post) return null;

    const images = getImageUrls(post.images);

    return (
        <PageWrapper>
            {loading ? (
                <Spinner animation="border" />
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <Card
                            style={{
                                backgroundColor: "rgb(33, 37, 41)",
                                color: "white",
                                borderRadius: "12px",
                                width: "420px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            {images.length > 0 && (
                                <div style={{ position: "relative" }}>
                                    <Carousel
                                        activeIndex={activeIndex}
                                        onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                                        prevIcon={
                                            <span style={{ color: "rgb(23, 25, 27)", fontSize: "2rem" }}>
                                                <FontAwesomeIcon icon={faChevronLeft} />
                                            </span>
                                        }
                                        nextIcon={
                                            <span style={{ color: "rgb(23, 25, 27)", fontSize: "2rem" }}>
                                                <FontAwesomeIcon icon={faChevronRight} />
                                            </span>
                                        }
                                    >
                                        {images.map((src, index) => (
                                            <Carousel.Item key={index}>
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        height: "350px",
                                                        backgroundColor: "#000",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <img
                                                        src={src}
                                                        alt={`Image ${index + 1}`}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                </div>
                                            </Carousel.Item>
                                        ))}
                                    </Carousel>
                                </div>
                            )}

                            <Card.Body>
                                <div>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontWeight: "bold",
                                            fontSize: "140%",
                                        }}
                                    >
                                        {post.title}
                                    </p>
                                    <p
                                        style={{
                                            marginBottom: "8px",
                                            fontWeight: "100",
                                            fontSize: "90%",
                                        }}
                                    >
                                        {post.caption.length > 100
                                            ? post.caption.slice(0, 100) + "..."
                                            : post.caption}
                                    </p>
                                </div>
                                <h5
                                    style={{
                                        margin: 0,
                                        color: "rgb(25, 135, 84)",
                                        fontSize: "130%",
                                    }}
                                >
                                    {post.price.toLocaleString("de-DE")}₴
                                </h5>
                            </Card.Body>

                            <Card.Footer>
                                <div
                                    style={{
                                        color: "rgb(137, 143, 150)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <div>Posted {formatDate(post.createdAt)}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                        <div>
                                            <FontAwesomeIcon icon={faEye} /> {post.views}
                                        </div>
                                        <Button variant="danger" onClick={() => openReportModal("post")}>
                                            <FontAwesomeIcon icon={faFlag} />
                                        </Button>
                                    </div>
                                </div>
                            </Card.Footer>
                        </Card>
                        <Card
                            style={{
                                backgroundColor: "rgb(33, 37, 41)",
                                color: "white",
                                borderRadius: "12px",
                                flex: 1,
                                padding: "1rem",
                                height: "fit-content",
                                alignSelf: "start",
                            }}
                        >
                            <p style={{ fontSize: "90%", color: "rgb(137, 143, 150)" }}>Posted by:</p>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    marginBottom: "1rem",
                                    marginTop: "1rem"
                                }}
                            >
                                {post.user.avatarBase64 ? (
                                    <img
                                        src={
                                            post.user.avatarBase64.startsWith("data:")
                                                ? post.user.avatarBase64
                                                : `data:image/jpeg;base64,${post.user.avatarBase64}`
                                        }
                                        alt={`${post.user.name} avatar`}
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            marginBottom: "0.5rem",
                                        }}
                                    />
                                ) : (
                                    <FontAwesomeIcon icon={faUser} size="6x" style={{ marginBottom: "0.5rem" }} />
                                )}

                                <h5 style={{ fontSize: "140%", marginBottom: "2px" }}>
                                    {post.user.name} {post.user.surname}
                                </h5>
                                <p style={{ fontSize: "90%", color: "rgb(137, 143, 150)" }}>Joined {formatDate(post.user.createdAt)}</p>
                            </div>

                            <div style={{ fontSize: "0.9rem", color: "rgb(137, 143, 150)" }}>
                                {post.user.phone && (
                                    <p>
                                        <FontAwesomeIcon icon={faPhone} /> {post.user.phone}
                                    </p>
                                )}
                                <p>
                                    <FontAwesomeIcon icon={faEnvelope} /> {post.user.email}
                                </p>
                            </div>
                            <div style={{ display: "flex", marginTop: "12px", gap: "10px" }}>
                                <Button
                                    variant="success"
                                    style={{
                                        flex: "1"
                                    }}
                                    onClick={() => navigate(`/chat/${post.userId}?postId=${post.id}`)}
                                >
                                    <FontAwesomeIcon icon={faMessage} /> Contact
                                </Button>
                                <Button variant="danger" onClick={() => openReportModal("user")}>
                                    <FontAwesomeIcon icon={faFlag} />
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <Modal show={showReportModal} onHide={closeReportModal} centered>
                        <Modal.Body style={{ backgroundColor: "rgb(33, 37, 41)", color: "white", borderRadius: "5.5px 5.5px 0 0" }} >
                            <Modal.Title>
                                {reportType === "post" ? "Report Post" : "Report Seller"}
                            </Modal.Title>
                            {reportError && <Alert variant="danger">{reportError}</Alert>}
                            {reportSuccess && <Alert variant="success">{reportSuccess}</Alert>}
                            <Form.Group controlId="reportText">
                                <Form.Label>Describe your complaint</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={reportText}
                                    style={{ backgroundColor: "rgb(23, 25, 27)", height: "80px" }}
                                    onChange={(e) => setReportText(e.target.value)}
                                    disabled={sendingReport || !!reportSuccess}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer style={{ backgroundColor: "rgb(33, 37, 41)", color: "white", borderTop: "1px solid rgb(23, 25, 27)" }}>
                            <Button
                                variant="success"
                                onClick={sendReport}
                                disabled={sendingReport || !!reportSuccess}
                            >
                                <FontAwesomeIcon icon={faShare} /> {sendingReport ? "Sending..." : "Send"}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </PageWrapper>
    );
};

export default PostDetails;
