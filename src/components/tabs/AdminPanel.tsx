import React, { useEffect, useState } from "react";
import { Button, Modal, Carousel } from "react-bootstrap";
import axios from "axios";

import Search from "../../assets/icons/Search.svg?react";
import ButtonRight from "../../assets/icons/ButtonRight.svg?react";

interface BlockedUser {
    id: number;
    email: string;
    name: string;
    surname: string;
    avatarBase64?: string;
    phone?: string;
    blockReason?: string;
    blockedAt: string;
}

interface VerificationRequest {
    id: number;
    user_id: number;
    email: string;
    name: string;
    surname: string;
    avatarBase64?: string;
    phone?: string;
    images: string[];
    status: string;
    created_at: string;
}

interface Complaint {
    id: number;
    post_id?: number;
    user_id?: number;
    message: string;
    created_at: string;
    complained_user_name?: string;
    complained_user_surname?: string;
    complained_post_title?: string;
}

const AdminPanel: React.FC = () => {
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
    const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);

    const [selectedBlockedUser, setSelectedBlockedUser] = useState<BlockedUser | null>(null);
    const [isBlockedUserModalOpen, setIsBlockedUserModalOpen] = useState(false);

    const [selectedVerificationRequest, setSelectedVerificationRequest] = useState<VerificationRequest | null>(null);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

    const [activeIndex, setActiveIndex] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const fetchData = async () => {
        try {
            const [blockedRes, verificationRes, complaintsRes] = await Promise.all([
                axios.get(`${API_URL}/blocked-users`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/verification/requests`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/complaints`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setBlockedUsers(blockedRes.data);
            setVerificationRequests(verificationRes.data);
            setComplaints(complaintsRes.data);
        } catch (err) {
            console.error("Failed to load admin data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const closeBlockedUserModal = () => {
        setIsBlockedUserModalOpen(false);
        setTimeout(() => setSelectedBlockedUser(null), 300);
    };

    const closeVerificationModal = () => {
        setIsVerificationModalOpen(false);
        setTimeout(() => {
            setSelectedVerificationRequest(null);
            setActiveIndex(0);
        }, 300);
    };

    const closeComplaintModal = () => {
        setIsComplaintModalOpen(false);
        setTimeout(() => setSelectedComplaint(null), 300);
    };

    const unblockUser = async (userId: number) => {
        try {
            await axios.put(`${API_URL}/users/block/${userId}`, {
                isBlocked: false,
                blockReason: null,
            }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
            closeBlockedUserModal();
        } catch (e) {
            alert("Failed to unblock user");
        }
    };

    const respondVerification = async (requestId: number, approve: boolean) => {
        try {
            await axios.put(`${API_URL}/verification/requests/${requestId}`, {
                status: approve ? "approved" : "rejected",
            }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
            closeVerificationModal();
        } catch (e) {
            alert("Failed to update verification request");
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const d = date.toLocaleDateString();
        const t = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return `${d} at ${t}`;
    };

    return (
        <div
            style={{
                display: "flex",
                gap: "14px",
                width: "100%",
                color: "white"
            }}
        >
            {/* Blocked Users */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    maxHeight: "80vh"
                }}
            >
                <h3>Blocked Users</h3>
                {blockedUsers.length === 0 && <p style={{ color: "#a6a6a6" }}>No blocked users</p>}
                {blockedUsers.map((user) => (
                    <div key={user.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px", padding: "6px 8px", backgroundColor: "#0D0D0D" }}>
                        <div style={{ flex: 1 }}>
                            <p>{user.name} {user.surname}</p>
                            <p style={{ fontSize: "70%", color: "#a6a6a6" }}>Blocked {formatDate(user.blockedAt)}</p>
                        </div>
                        <Button onClick={() => {
                            setSelectedBlockedUser(user);
                            setIsBlockedUserModalOpen(true);
                        }}>
                            <Search width={18} height={18} />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Verification Requests */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    maxHeight: "80vh"
                }}
            >
                <h3>Verification Requests</h3>
                {verificationRequests.length === 0 && <p style={{ color: "#a6a6a6" }}>No pending requests</p>}
                {verificationRequests.map((req) => (
                    <div key={req.id} style={{ display: "flex", alignItems: "center", marginBottom: "8px", padding: "6px 8px", backgroundColor: "#0D0D0D" }}>
                        <div style={{ flex: 1 }}>
                            <p>{req.name} {req.surname}</p>
                            <p style={{ fontSize: "70%", color: "#a6a6a6" }}>{formatDate(req.created_at)}</p>
                        </div>
                        <Button onClick={() => {
                            setSelectedVerificationRequest(req);
                            setIsVerificationModalOpen(true);
                        }}>
                            <Search width={18} height={18} />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Complaints */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    maxHeight: "80vh"
                }}
            >
                <h3>Complaints</h3>
                {complaints.length === 0 && <p style={{ color: "#a6a6a6" }}>No complaints</p>}
                {complaints.map((c) => {
                    const title = c.complained_post_title || `${c.complained_user_name || ""} ${c.complained_user_surname || ""}`.trim();
                    return (
                        <div key={c.id} style={{ display: "flex", alignItems: "center", borderRadius: "6px", marginBottom: "8px", padding: "6px 8px", backgroundColor: "#0D0D0D" }}>
                            <div style={{ flex: 1 }}>
                                <p><span style={{ color: "#a6a6a6" }}>About</span> {title}</p>
                                <p style={{ fontSize: "70%", color: "#a6a6a6" }}>{formatDate(c.created_at)}</p>
                            </div>
                            <Button onClick={() => {
                                setSelectedComplaint(c);
                                setIsComplaintModalOpen(true);
                            }}>
                                <Search width={18} height={18} />
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Blocked User Modal */}
            <Modal show={isBlockedUserModalOpen} onHide={closeBlockedUserModal}>
                <Modal.Body style={{ backgroundColor: "#0D0D0D", color: "white" }}>
                    <h4>Blocked User Info</h4>
                    <p>
                        <span style={{ color: "#a6a6a6" }}>User </span>: {selectedBlockedUser?.name} {selectedBlockedUser?.surname}
                    </p>
                    <div>
                        <p
                            style={{
                                backgroundColor: "#D9A441",
                                padding: "6px 8px",
                                borderRadius: "6px",
                                width: "fit-content",
                                margin: "8px 0",
                                color: "#0D0D0D"
                            }}
                        >
                            {selectedBlockedUser?.blockReason || "N/A"}
                        </p>
                    </div>
                    <div
                        style={{
                            color: "#a6a6a6",
                            marginBottom: "8px",
                            fontSize: "80%"
                        }}
                    >
                        <p>{selectedVerificationRequest?.email}</p>
                        <p>{selectedVerificationRequest?.phone}</p>
                    </div>
                    <p style={{ color: "#a6a6a6", marginTop: "8px", fontSize: "80%" }}>{selectedBlockedUser?.blockedAt ? formatDate(selectedBlockedUser.blockedAt) : "N/A"}</p>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: "#0D0D0D", color: "white", borderTop: "1px solid rgb(23, 25, 27)" }}>
                    <Button variant="success" onClick={() => unblockUser(selectedBlockedUser!.id)}>Unblock User</Button>
                </Modal.Footer>
            </Modal>

            {/* Verification Modal */}
            <Modal show={isVerificationModalOpen} onHide={closeVerificationModal}>
                <Modal.Body style={{ backgroundColor: "#0D0D0D", color: "white" }}>
                    <h4>Verification Request</h4>
                    <p>
                        <span style={{ color: "#a6a6a6" }}>From </span>{selectedVerificationRequest?.name} {selectedVerificationRequest?.surname}
                    </p>
                    <div
                        style={{
                            color: "#a6a6a6",
                            marginBottom: "8px",
                            fontSize: "80%"
                        }}
                    >
                        <p>{selectedVerificationRequest?.email}</p>
                        <p>{selectedVerificationRequest?.phone}</p>
                    </div>

                    <Carousel
                        activeIndex={activeIndex}
                        onSelect={(i) => setActiveIndex(i)}
                        prevIcon={
                            <span
                                style={{
                                    transform: "scaleX(-1)"
                                }}
                            >
                                <ButtonRight width={60} height={60} />
                            </span>
                        }
                        nextIcon={
                            <span style={{
                                position: "relative",
                                left: "20px"
                            }}>
                                <ButtonRight width={60} height={60} />
                            </span>
                        }
                    >
                        {selectedVerificationRequest?.images.map((imgBase64, idx) => (
                            <Carousel.Item key={idx}>
                                <div style={{ height: "350px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <img src={`data:image/png;base64,${imgBase64}`} style={{ height: "100%", objectFit: "cover" }} />
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                    <p style={{ color: "#a6a6a6", marginTop: "8px", fontSize: "80%" }}>{selectedVerificationRequest?.created_at ? formatDate(selectedVerificationRequest?.created_at) : "N/A"}</p>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: "#0D0D0D", color: "white", borderTop: "1px solid rgb(23, 25, 27)" }}>
                    <Button onClick={() => respondVerification(selectedVerificationRequest!.id, true)}>Approve</Button>
                    <Button onClick={() => respondVerification(selectedVerificationRequest!.id, false)}>Reject</Button>
                </Modal.Footer>
            </Modal>

            {/* Complaint Modal */}
            <Modal show={isComplaintModalOpen} onHide={closeComplaintModal}>
                <Modal.Body style={{ backgroundColor: "#0D0D0D", color: "white" }}>
                    <h4 style={{ marginBottom: "6px" }}>Complaint Details</h4>
                    {selectedComplaint?.post_id ? (
                        <p><span style={{ color: "#a6a6a6" }}>Complaint about post:</span> {selectedComplaint?.complained_post_title}</p>
                    ) : (
                        <p><span style={{ color: "#a6a6a6" }}>Complaint about user:</span> {selectedComplaint?.complained_user_name} {selectedComplaint?.complained_user_surname}</p>
                    )}
                    <div>
                        <p
                            style={{
                                backgroundColor: "#D9A441",
                                padding: "6px 8px",
                                borderRadius: "6px",
                                width: "fit-content",
                                margin: "8px 0",
                                color: "#0D0D0D"
                            }}
                        >
                            {selectedComplaint?.message}
                        </p>
                    </div>
                    <p
                        style={{
                            color: "#a6a6a6",
                            fontSize: "80%",
                        }}>
                        {selectedComplaint && formatDate(selectedComplaint.created_at)}
                    </p>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AdminPanel;
