import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Select from "react-select";
import axios from "axios";
import { Spinner, Alert, Button, Modal, Form } from "react-bootstrap";
import { Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";

import AvatarPlaceholder from "../../assets/icons/AvatarPlaceholder.svg?react";
import ButtonRight from "../../assets/icons/ButtonRight.svg?react";
import HollowStar from "../../assets/icons/HollowStar.svg?react";
import FullStar from "../../assets/icons/FullStar.svg?react";
import { formatDate } from "../../utils/FormatTime";

interface User {
    id: number;
    name: string;
    surname: string;
    phone?: string | null;
    email: string;
    avatarBase64?: string | null;
    createdAt: string;
    rating: number;
    reviewsCount: number;
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
    isUsed: boolean;
    currency: string;
    location: string;
    user: User;
}

function parseJwt(token: string) {
    try {
        const base64Payload = token.split('.')[1];
        const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodeURIComponent(escape(payload)));
    } catch {
        return null;
    }
}

const PostDetails: React.FC = () => {
    const navigate = useNavigate();
    const { postId } = useParams<{ postId: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportType, setReportType] = useState<"post" | "user" | null>(null);
    const [reportText, setReportText] = useState("");
    const [sendingReport, setSendingReport] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);
    const [reportSuccess, setReportSuccess] = useState<string | null>(null);

    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState("");
    const [blockingUser, setBlockingUser] = useState(false);
    const [blockError, setBlockError] = useState<string | null>(null);
    const [blockSuccess, setBlockSuccess] = useState<string | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingPost, setDeletingPost] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const [role, setRole] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const [showCloseModal, setShowCloseModal] = useState(false);
    const [closeReason, setCloseReason] = useState<"sold" | "not_relevant" | "mistake" | "">("");
    const [closingPost, setClosingPost] = useState(false);
    const [closeError, setCloseError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;

    const openCloseModal = () => {
        setCloseReason("");
        setCloseError(null);
        setShowCloseModal(true);
    };

    const closeCloseModal = () => {
        setShowCloseModal(false);
    };

    const sendClosePost = async () => {
        if (!closeReason) {
            setCloseError("Please select a reason");
            return;
        }

        setClosingPost(true);
        setCloseError(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setCloseError("You must be logged in");
            setClosingPost(false);
            return;
        }

        try {
            await axios.post(`${API_URL}/posts/${post?.id}/close`,
                new URLSearchParams({ reason: closeReason }),
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPost(prev => prev ? { ...prev, isClosed: true, closeReason } : prev);
            setShowCloseModal(false);
        } catch (err: any) {
            setCloseError(
                axios.isAxiosError(err) && err.response?.data?.detail
                    ? err.response.data.detail
                    : "Failed to close post"
            );
        } finally {
            setClosingPost(false);
        }
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get<Post>(`${API_URL}/posts/${postId}`);

                setPost({
                    ...res.data,
                    images: JSON.stringify(res.data.images ?? []),
                });
            } catch (err: any) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (postId) fetchPost();
    }, [postId, API_URL]);

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

    useEffect(() => {
        function updateUserState() {
            const token = localStorage.getItem("token");
            if (token) {
                const payload = parseJwt(token);
                setRole(payload?.role ?? null);
                setUserEmail(payload?.sub ?? null);
            } else {
                setRole(null);
                setUserEmail(null);
            }
        }

        updateUserState();

        window.addEventListener("loggedIn", updateUserState);
        window.addEventListener("loggedOut", () => {
            setRole(null);
            setUserEmail(null);
        });

        return () => {
            window.removeEventListener("loggedIn", updateUserState);
            window.removeEventListener("loggedOut", () => {
                setRole(null);
                setUserEmail(null);
            });
        };
    }, []);

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

    const [isAuthor, setIsAuthor] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        if (post) {
            try {
                const parsedImages = JSON.parse(post.images ?? "[]");
                setImages(Array.isArray(parsedImages) ? parsedImages.map(img => img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`) : []);
            } catch {
                setImages([]);
            }

            setIsAuthor(userEmail === post.user.email);
        } else {
            setImages([]);
            setIsAuthor(false);
        }
    }, [post, userEmail]);

    const openBlockModal = () => {
        setBlockReason("");
        setBlockError(null);
        setBlockSuccess(null);
        setShowBlockModal(true);
    };

    const closeBlockModal = () => {
        setShowBlockModal(false);
    };

    const sendBlockUser = async () => {
        if (!blockReason.trim()) {
            setBlockError("Please provide a reason for blocking.");
            return;
        }

        setBlockingUser(true);
        setBlockError(null);
        setBlockSuccess(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setBlockError("You must be logged in.");
            setBlockingUser(false);
            return;
        }

        try {
            await axios.put(
                `${API_URL}/users/block/${post?.userId}`,
                {
                    isBlocked: true,
                    blockReason: blockReason.trim(),
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setBlockSuccess("User has been blocked.");
            setBlockReason("");
            setTimeout(() => {
                setShowBlockModal(false);
            }, 1500);
        } catch (err: any) {
            setBlockError(
                axios.isAxiosError(err) && err.response?.data?.detail
                    ? err.response.data.detail
                    : "Failed to block user."
            );
        } finally {
            setBlockingUser(false);
        }
    };

    const handleDeletePost = () => {
        setDeleteError(null);
        setShowDeleteModal(true);
    };

    const confirmDeletePost = async () => {
        if (!post) return;

        setDeletingPost(true);
        setDeleteError(null);

        try {
            await axios.delete(`${API_URL}/posts/${post.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setShowDeleteModal(false);
            navigate("/");
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                setDeleteError(error.response?.data?.detail || "Failed to delete post");
            } else {
                setDeleteError("Failed to delete post");
            }
        } finally {
            setDeletingPost(false);
        }
    };

    const closeOptions = [
        { value: "sold", label: "Sold" },
        { value: "not_relevant", label: "Not relevant" },
        { value: "mistake", label: "Mistake" },
    ];

    return (
        <PageWrapper>
            {loading ? (
                <Spinner animation="border" />
            ) : !post ? (
                <p style={{
                    color: "white",
                    textAlign: "center",
                    marginTop: "20px",
                    fontSize: "1rem"
                }}>
                    The post has been deleted or does not exist.
                </p>
            ) : (
                <>
                    <div
                        style={{
                            display: "flex",
                            gap: "40px",
                            width: "100%",
                            alignItems: "flex-start"
                        }}
                    >
                        {images.length > 0 && (
                            <div
                                style={{
                                    flexShrink: 0,
                                    width: "100%",
                                    maxWidth: "40%",
                                    position: "relative",
                                }}
                            >
                                <Carousel
                                    activeIndex={activeIndex}
                                    onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                                    prevIcon={
                                        <span style={{
                                            transform: "scaleX(-1)"
                                        }}>
                                            <ButtonRight width={60} height={60} />
                                        </span>
                                    }
                                    nextIcon={
                                        <span style={{ width: "24px", height: "24px", display: "inline-block" }}>
                                            <ButtonRight width={60} height={60} />
                                        </span>
                                    }
                                >
                                    {images.map((src, index) => (
                                        <Carousel.Item key={index}>
                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
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
                        <div
                            style={{
                                flex: "1",
                                padding: "28px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                backgroundColor: "#0D0D0D"
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: "80%",
                                        color: "#a6a6a6"
                                    }}
                                >
                                    <p>{post.location} - {formatDate(post.createdAt)}</p>
                                    <div>
                                        Views: {post.views}
                                    </div>
                                </div>
                                <div style={{
                                    color: "#F2F2F2",
                                    marginTop: "12px"
                                }}>
                                    <p
                                        style={{
                                            fontWeight: "bold",
                                            textTransform: "uppercase",
                                            marginBottom: "6px"
                                        }}
                                    >
                                        {post.title}
                                    </p>
                                    <p
                                        style={{
                                            marginBottom: "8px",
                                            fontWeight: "lighter",
                                            fontSize: "90%"
                                        }}
                                    >
                                        {post.caption}
                                    </p>
                                </div>
                                <p
                                    style={{
                                        color: "#D9A441",
                                        fontWeight: "bold",
                                        fontSize: "120%",
                                        marginTop: "28px"
                                    }}
                                >
                                    {post.price.toLocaleString("de-DE")}{post.currency == "UAH" ? "₴" : post.currency == "USD" ? "$" : "€"}
                                </p>
                            </div>
                            <div
                                style={{
                                    color: "#F2F2F2",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-end"
                                }}
                            >
                                <div>
                                    <p>
                                        Contact seller
                                    </p>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginTop: "8px"
                                        }}
                                    >
                                        {post.user.avatarBase64 ? (
                                            <div
                                                className="hexagon"
                                                style={{
                                                    width: "90px",
                                                    height: "90px",
                                                    backgroundColor: "#D9A441",
                                                    overflow: "hidden",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <img
                                                    src={
                                                        post.user.avatarBase64.startsWith("data:")
                                                            ? post.user.avatarBase64
                                                            : `data:image/jpeg;base64,${post.user.avatarBase64}`
                                                    }
                                                    alt={`${post.user.name} avatar`}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        borderRadius: 0,
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <AvatarPlaceholder width={90} height={90} />
                                        )}

                                        <div style={{ marginLeft: "8px" }}>
                                            <p>{post.user.name} {post.user.surname}</p>
                                            <p style={{ fontSize: "80%" }}>{post.user.email}</p>
                                            <p style={{ fontSize: "80%" }}>{post.user.phone || "No phone"}</p>

                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                                <div style={{ display: "flex", gap: "4px" }}>
                                                    {[...Array(5)].map((_, i) =>
                                                        i < Math.round(post.user.rating)
                                                            ? <FullStar key={i} width={20} height={20} />
                                                            : <HollowStar key={i} width={20} height={20} />
                                                    )}
                                                </div>
                                                <span style={{ fontSize: "0.85rem", color: "#a6a6a6", position: "relative", top: "2px" }}>
                                                    ({post.user.reviewsCount ? post.user.reviewsCount : "0"})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "12px" }}>
                                    {isAuthor && (
                                        <Button
                                            onClick={openCloseModal}
                                            style={{
                                                height: '41px',
                                                padding: "0px 18px",
                                                borderRadius: '4px',
                                                backgroundColor: "#D9A441",
                                                border: "none",
                                                boxShadow: "inset 0 0 8px rgba(0, 0, 0, 0.3)"
                                            }}
                                        >
                                            Close Post
                                        </Button>
                                    )}

                                    {!isAuthor && role && (
                                        <>
                                            <Button
                                                onClick={() =>
                                                    navigate('/profile', {
                                                        state: { tab: 'chat', userId: post.userId, postId: post.id }
                                                    })
                                                }
                                                style={{
                                                    height: '41px',
                                                    padding: "0px 18px",
                                                    borderRadius: '4px',
                                                    backgroundColor: "#D9A441",
                                                    border: "none",
                                                    boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.3)',
                                                }}
                                            >
                                                Chat
                                            </Button>

                                            {(role === "Admin" || role === "Owner") ? (
                                                <>
                                                    <Button
                                                        onClick={openBlockModal}
                                                        style={{
                                                            height: '41px',
                                                            padding: "0px 18px",
                                                            borderRadius: '4px',
                                                            backgroundColor: "#D9A441",
                                                            border: "none",
                                                            boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.3)',
                                                        }}
                                                    >
                                                        Ban
                                                    </Button>

                                                    <Button
                                                        onClick={handleDeletePost}
                                                        style={{
                                                            height: '41px',
                                                            padding: "0px 18px",
                                                            borderRadius: '4px',
                                                            backgroundColor: "#D9A441",
                                                            border: "none",
                                                            boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.3)',
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    onClick={() => openReportModal("post")}
                                                    style={{
                                                        height: '41px',
                                                        padding: "0px 18px",
                                                        borderRadius: '4px',
                                                        backgroundColor: "#D9A441",
                                                        border: "none",
                                                        boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.3)',
                                                    }}
                                                >
                                                    Report
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Send Report Modal */}
                    <Modal show={showReportModal} onHide={closeReportModal} centered>
                        <Modal.Body style={{ backgroundColor: "#0D0D0D", color: "white", borderRadius: "5.5px 5.5px 0 0" }} >
                            <Modal.Title>
                                {reportType === "post" ? "Report Post" : "Report Seller"}
                            </Modal.Title>
                            {reportError && <Alert variant="danger">{reportError}</Alert>}
                            {reportSuccess && <Alert variant="success">{reportSuccess}</Alert>}
                            <Form.Group controlId="reportText">
                                <Form.Label style={{ color: "#a6a6a6" }}>Describe your complaint</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={reportText}
                                    style={{ backgroundColor: "#F2F2F2", height: "80px" }}
                                    onChange={(e) => setReportText(e.target.value)}
                                    disabled={sendingReport || !!reportSuccess}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer style={{ backgroundColor: "#0D0D0D", color: "white", borderTop: "1px solid rgb(23, 25, 27)" }}>
                            <Button
                                variant="success"
                                onClick={sendReport}
                                disabled={sendingReport || !!reportSuccess}
                            >
                                {sendingReport ? "Sending..." : "Send"}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Block User Modal */}
                    <Modal show={showBlockModal} onHide={closeBlockModal} centered>
                        <Modal.Body
                            style={{
                                backgroundColor: "#0D0D0D",
                                color: "white",
                                borderRadius: "5.5px 5.5px 0 0",
                            }}
                        >
                            <Modal.Title>Block User</Modal.Title>
                            {blockError && <Alert variant="danger">{blockError}</Alert>}
                            {blockSuccess && <Alert variant="success">{blockSuccess}</Alert>}
                            <Form.Group controlId="blockReason">
                                <Form.Label style={{ color: "#a6a6a6" }}>Reason for blocking</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={blockReason}
                                    style={{ backgroundColor: "#F2F2F2", height: "80px" }}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    disabled={blockingUser || !!blockSuccess}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer
                            style={{
                                backgroundColor: "#0D0D0D",
                                color: "white",
                                borderTop: "1px solid rgb(23, 25, 27)",
                            }}
                        >
                            <Button
                                variant="danger"
                                onClick={sendBlockUser}
                                disabled={blockingUser || !!blockSuccess}
                            >
                                {blockingUser ? "Blocking..." : "Block"}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Delete Post Modal */}
                    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                        <Modal.Body style={{ backgroundColor: "#0D0D0D", color: "white", borderRadius: "5.5px 5.5px 0 0" }}>
                            <Modal.Title>Confirm Deletion</Modal.Title>
                            <Form.Label style={{ color: "#a6a6a6" }}>Are you sure you want to delete this post?<br />This action cannot be undone.</Form.Label>
                            {deleteError && <Alert variant="danger">{deleteError}</Alert>}
                        </Modal.Body>
                        <Modal.Footer
                            style={{
                                backgroundColor: "#0D0D0D",
                                borderTop: "1px solid rgb(23, 25, 27)",
                            }}
                        >
                            <Button
                                variant="danger"
                                onClick={confirmDeletePost}
                                disabled={deletingPost}
                            >
                                {deletingPost ? "Deleting..." : "Delete"}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Close Post Modal */}
                    <Modal show={showCloseModal} onHide={closeCloseModal} centered>
                        <Modal.Body style={{ backgroundColor: "#0D0D0D", color: "white", borderRadius: "5.5px 5.5px 0 0" }}>
                            <Modal.Title>Close Post</Modal.Title>
                            {closeError && <Alert variant="danger">{closeError}</Alert>}
                            <Form.Group controlId="closeReason">
                                <Form.Label style={{ color: "#a6a6a6" }}>Select reason for closing</Form.Label>
                                <Select
                                    options={closeOptions}
                                    onChange={(selectedOption) =>
                                        setCloseReason(selectedOption ? (selectedOption.value as "sold" | "not_relevant" | "mistake") : "")
                                    }
                                    value={closeOptions.find((c) => c.value === closeReason) || null}
                                    isClearable
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            backgroundColor: "#F2F2F2",
                                            color: "black",
                                            border: "3px solid #D9A441",
                                            boxShadow: "inset 0 0 12px rgba(0, 0, 0, 0.4)",
                                            fontWeight: "600",
                                            "&:hover": { borderColor: "#D9A441" },
                                        }),
                                        valueContainer: (base) => ({ ...base, padding: "0 8px" }),
                                        indicatorSeparator: () => ({ display: "none" }),
                                        indicatorsContainer: (base) => ({ ...base, borderLeft: "2px solid #D9A441" }),
                                        dropdownIndicator: (base) => ({ ...base }),
                                        input: (base) => ({ ...base, margin: 0, padding: 0 }),
                                        menu: (base) => ({
                                            ...base,
                                            backgroundColor: "#F2F2F2",
                                            zIndex: 10,
                                            border: "3px solid #D9A441",
                                            boxShadow: "inset 0 0 12px rgba(0, 0, 0, 0.4)",
                                        }),
                                        option: (base) => ({
                                            ...base,
                                            color: "#0D0D0D",
                                            cursor: "pointer",
                                            height: "29.25px",
                                            display: "flex",
                                            alignItems: "center",
                                            fontWeight: "bold",
                                        }),
                                        singleValue: (base) => ({ ...base, color: "#0D0D0D" }),
                                    }}
                                    theme={(theme) => ({
                                        ...theme,
                                        borderRadius: 4,
                                        colors: { ...theme.colors, primary25: "#D9A441", primary: "#D9A441" },
                                    })}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer style={{ backgroundColor: "#0D0D0D", color: "white", borderTop: "1px solid rgb(23, 25, 27)" }}>
                            <Button
                                variant="danger"
                                onClick={sendClosePost}
                                disabled={closingPost || !closeReason}
                            >
                                {closingPost ? "Closing..." : "Close Post"}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </PageWrapper >
    );
};

export default PostDetails;
