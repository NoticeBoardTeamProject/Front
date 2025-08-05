import React, { useEffect, useState } from "react";
import { Button, Modal, Carousel } from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faXmark,
    faChevronLeft,
    faChevronRight,
    faPhone,
    faEnvelope,
    faMagnifyingGlass,
    faUnlock
} from "@fortawesome/free-solid-svg-icons";
import PageWrapper from "../../components/PageWrapper";

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
        <PageWrapper>
            <div style={{ display: "flex", gap: "10px", padding: "10px", width: "100%", color: "white" }}>
                {/* Blocked Users */}
                <div style={{ flex: 1, padding: "10px", overflowY: "auto", maxHeight: "80vh" }}>
                    <h3>Blocked Users</h3>
                    {blockedUsers.length === 0 && <p style={{color: "rgb(137, 143, 150)"}}>No blocked users</p>}
                    {blockedUsers.map((user) => (
                        <div key={user.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px", padding: "6px 8px", backgroundColor: "rgb(33, 37, 41)" }}>
                            <div style={{ flex: 1 }}>
                                <p>{user.name} {user.surname}</p>
                                <p style={{ fontSize: "70%", color: "rgb(137, 143, 150)" }}>Blocked {formatDate(user.blockedAt)}</p>
                            </div>
                            <Button variant="success" size="sm" onClick={() => {
                                setSelectedBlockedUser(user);
                                setIsBlockedUserModalOpen(true);
                            }}><FontAwesomeIcon icon={faMagnifyingGlass} /></Button>
                        </div>
                    ))}
                </div>

                {/* Verification Requests */}
                <div style={{ flex: 1, padding: "10px", overflowY: "auto", maxHeight: "80vh" }}>
                    <h3>Verification Requests</h3>
                    {verificationRequests.length === 0 && <p style={{color: "rgb(137, 143, 150)"}}>No pending requests</p>}
                    {verificationRequests.map((req) => (
                        <div key={req.id} style={{ display: "flex", alignItems: "center", borderRadius: "6px", marginBottom: "8px", padding: "6px 8px", backgroundColor: "rgb(33, 37, 41)" }}>
                            <div style={{ flex: 1 }}>
                                <p>{req.name} {req.surname}</p>
                                <p style={{ fontSize: "70%", color: "rgb(137, 143, 150)" }}>{formatDate(req.created_at)}</p>
                            </div>
                            <Button variant="success" size="sm" onClick={() => {
                                setSelectedVerificationRequest(req);
                                setIsVerificationModalOpen(true);
                            }}><FontAwesomeIcon icon={faMagnifyingGlass} /></Button>
                        </div>
                    ))}
                </div>

                {/* Complaints */}
                <div style={{ flex: 1, padding: "10px", overflowY: "auto", maxHeight: "80vh" }}>
                    <h3>Complaints</h3>
                    {complaints.length === 0 && <p style={{color: "rgb(137, 143, 150)"}}>No complaints</p>}
                    {complaints.map((c) => {
                        const title = c.complained_post_title || `${c.complained_user_name || ""} ${c.complained_user_surname || ""}`.trim();
                        return (
                            <div key={c.id} style={{ display: "flex", alignItems: "center", borderRadius: "6px", marginBottom: "8px", padding: "6px 8px", backgroundColor: "rgb(33, 37, 41)" }}>
                                <div style={{ flex: 1 }}>
                                    <p><span style={{ color: "rgb(137, 143, 150)" }}>About</span> {title}</p>
                                    <p style={{ fontSize: "70%", color: "rgb(137, 143, 150)" }}>{formatDate(c.created_at)}</p>
                                </div>
                                <Button variant="success" size="sm" onClick={() => {
                                    setSelectedComplaint(c);
                                    setIsComplaintModalOpen(true);
                                }}><FontAwesomeIcon icon={faMagnifyingGlass} /></Button>
                            </div>
                        );
                    })}
                </div>

                {/* Blocked User Modal */}
                <Modal show={isBlockedUserModalOpen} onHide={closeBlockedUserModal}>
                    <Modal.Body style={{ backgroundColor: "rgb(33, 37, 41)", color: "white" }}>
                        <h4>Blocked User: {selectedBlockedUser?.name} {selectedBlockedUser?.surname}</h4>
                        <p><b>Reason:</b> </p>
                        <div><p style={{ backgroundColor: "rgb(23, 25, 27)", padding: "6px 8px", borderRadius: "6px", width: "fit-content" }}>{selectedBlockedUser?.blockReason || "N/A"}</p></div>
                        <div style={{ color: "rgb(137, 143, 150)", marginTop: "6px" }}>
                            <p><FontAwesomeIcon icon={faEnvelope} /> {selectedBlockedUser?.email}</p>
                            <p><FontAwesomeIcon icon={faPhone} /> {selectedBlockedUser?.phone}</p>
                        </div>
                        <p style={{ color: "rgb(137, 143, 150)" }}>{selectedBlockedUser?.blockedAt ? formatDate(selectedBlockedUser.blockedAt) : "N/A"}</p>
                    </Modal.Body>
                    <Modal.Footer style={{ backgroundColor: "rgb(33, 37, 41)", color: "white", borderTop: "1px solid rgb(23, 25, 27)" }}>
                        <Button variant="success" onClick={() => unblockUser(selectedBlockedUser!.id)}><FontAwesomeIcon icon={faUnlock} /> Unblock User</Button>
                    </Modal.Footer>
                </Modal>

                {/* Verification Modal */}
                <Modal show={isVerificationModalOpen} onHide={closeVerificationModal}>
                    <Modal.Body style={{ backgroundColor: "rgb(33, 37, 41)", color: "white" }}>
                        <h4>Verification Request: {selectedVerificationRequest?.name} {selectedVerificationRequest?.surname}</h4>
                        <div style={{ color: "rgb(137, 143, 150)", marginBottom: "8px" }}>
                            <p><FontAwesomeIcon icon={faEnvelope} /> {selectedVerificationRequest?.email}</p>
                            <p><FontAwesomeIcon icon={faPhone} /> {selectedVerificationRequest?.phone}</p>
                        </div>
                        <Carousel
                            activeIndex={activeIndex}
                            onSelect={(i) => setActiveIndex(i)}
                            prevIcon={<FontAwesomeIcon icon={faChevronLeft} size="2x" color="rgb(23, 25, 27)" />}
                            nextIcon={<FontAwesomeIcon icon={faChevronRight} size="2x" color="rgb(23, 25, 27)" />}
                        >
                            {selectedVerificationRequest?.images.map((imgBase64, idx) => (
                                <Carousel.Item key={idx}>
                                    <div style={{ height: "350px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <img src={`data:image/png;base64,${imgBase64}`} style={{ height: "100%", objectFit: "cover" }} />
                                    </div>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                        <p style={{ color: "rgb(137, 143, 150)", marginTop: "4px" }}>{selectedVerificationRequest?.created_at ? formatDate(selectedVerificationRequest?.created_at) : "N/A"}</p>
                    </Modal.Body>
                    <Modal.Footer style={{ backgroundColor: "rgb(33, 37, 41)", color: "white", borderTop: "1px solid rgb(23, 25, 27)" }}>
                        <Button variant="success" onClick={() => respondVerification(selectedVerificationRequest!.id, true)}><FontAwesomeIcon icon={faCheck} /> Approve</Button>
                        <Button variant="danger" onClick={() => respondVerification(selectedVerificationRequest!.id, false)}><FontAwesomeIcon icon={faXmark} /> Reject</Button>
                    </Modal.Footer>
                </Modal>

                {/* Complaint Modal */}
                <Modal show={isComplaintModalOpen} onHide={closeComplaintModal}>
                    <Modal.Body style={{ backgroundColor: "rgb(33, 37, 41)", color: "white" }}>
                        <h4>Complaint Details</h4>
                        <p><b>Message:</b></p>
                        <div><p style={{ backgroundColor: "rgb(23, 25, 27)", padding: "6px 8px", borderRadius: "6px", width: "fit-content" }}>{selectedComplaint?.message}</p></div>
                        {selectedComplaint?.post_id ? (
                            <p style={{ marginTop: "6px" }}><b style={{ color: "rgb(137, 143, 150)" }}>Complaint about post:</b> {selectedComplaint?.complained_post_title}</p>
                        ) : (
                            <p style={{ marginTop: "6px" }}><b style={{ color: "rgb(137, 143, 150)" }}>Complaint about user:</b> {selectedComplaint?.complained_user_name} {selectedComplaint?.complained_user_surname}</p>
                        )}
                        <p style={{ color: "rgb(137, 143, 150)" }}>{selectedComplaint && formatDate(selectedComplaint.created_at)}</p>
                    </Modal.Body>
                </Modal>
            </div>
        </PageWrapper>
    );
};

export default AdminPanel;
