import React, { useEffect, useState } from "react";
import { Button, Modal, Carousel } from "react-bootstrap";
import { faUserShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";

interface BlockedUser {
    id: number;
    email: string;
    name: string;
    surname: string;
    avatarBase64?: string;
    phone?: string;
    blockReason?: string;
    blockedAt?: string;
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

    const [modalData, setModalData] = useState<any>(null);
    const [modalType, setModalType] = useState<"blocked" | "verification" | "complaint" | null>(null);
    const [showModal, setShowModal] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const token = localStorage.getItem("token");

    const fetchData = async () => {
        try {
            const [blockedRes, verificationRes, complaintsRes] = await Promise.all([
                axios.get<BlockedUser[]>(`${API_URL}/blocked-users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                axios.get<VerificationRequest[]>(`${API_URL}/verification/requests`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                axios.get<Complaint[]>(`${API_URL}/complaints`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);
            setBlockedUsers(blockedRes.data);
            setVerificationRequests(verificationRes.data);
            setComplaints(complaintsRes.data);
        } catch (error) {
            console.error("Failed to load admin data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (type: typeof modalType, data: any) => {
        setModalType(type);
        setModalData(data);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalData(null);
        setModalType(null);
    };

    // Unblock user
    const unblockUser = async (userId: number) => {
        try {
            await axios.put(`/users/block/${userId}`, { isBlocked: false, blockReason: null });
            fetchData();
            closeModal();
        } catch (e) {
            alert("Failed to unblock user");
        }
    };

    // Approve or reject verification
    const respondVerification = async (requestId: number, approve: boolean) => {
        try {
            await axios.put(`/verification/requests/${requestId}`, { status: approve ? "approved" : "rejected" });
            fetchData();
            closeModal();
        } catch (e) {
            alert("Failed to update verification request");
        }
    };

    return (
        <div style={{ display: "flex", gap: "10px", padding: "10px" }}>
            {/* Blocked users column */}
            <div style={{ flex: 1, border: "1px solid #ccc", padding: "10px", overflowY: "auto", maxHeight: "80vh" }}>
                <h3>Blocked Users</h3>
                {blockedUsers.length === 0 && <p>No blocked users</p>}
                {blockedUsers.map(user => (
                    <div key={user.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                        <img src={user.avatarBase64 ? `data:image/png;base64,${user.avatarBase64}` : "/default-avatar.png"} alt="avatar" style={{ width: 50, height: 50, borderRadius: "50%", marginRight: 10 }} />
                        <div style={{ flex: 1 }}>
                            <strong>{user.name} {user.surname}</strong>
                        </div>
                        <Button variant="outline-primary" size="sm" onClick={() => openModal("blocked", user)}>Details</Button>
                    </div>
                ))}
            </div>

            {/* Verification requests column */}
            <div style={{ flex: 1, border: "1px solid #ccc", padding: "10px", overflowY: "auto", maxHeight: "80vh" }}>
                <h3>Verification Requests</h3>
                {verificationRequests.length === 0 && <p>No pending requests</p>}
                {verificationRequests.map(req => (
                    <div key={req.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                        <FontAwesomeIcon icon={faUserShield} size="lg" style={{ marginRight: 8 }} />
                        <div style={{ flex: 1 }}>
                            {req.name} {req.surname}
                        </div>
                        <Button variant="outline-primary" size="sm" onClick={() => openModal("verification", req)}>Details</Button>
                    </div>
                ))}
            </div>

            {/* Complaints column */}
            <div style={{ flex: 1, border: "1px solid #ccc", padding: "10px", overflowY: "auto", maxHeight: "80vh" }}>
                <h3>Complaints</h3>
                {complaints.length === 0 && <p>No complaints</p>}
                {complaints.map(c => {
                    const title = c.complained_post_title || `${c.complained_user_name || ""} ${c.complained_user_surname || ""}`.trim();
                    return (
                        <div key={c.id} style={{ marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>{title}</div>
                                <div style={{ fontSize: "0.8rem", color: "#666" }}>{new Date(c.created_at).toLocaleString()}</div>
                            </div>
                            <Button variant="outline-primary" size="sm" onClick={() => openModal("complaint", c)} style={{ marginTop: "4px" }}>Details</Button>
                        </div>
                    );
                })}
            </div>

            {/* Modal for details */}
            <Modal show={showModal} onHide={closeModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalType === "blocked" && `Blocked User: ${modalData?.name} ${modalData?.surname}`}
                        {modalType === "verification" && `Verification Request: ${modalData?.name} ${modalData?.surname}`}
                        {modalType === "complaint" && "Complaint Details"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalType === "blocked" && modalData && (
                        <>
                            <img src={modalData.avatarBase64 ? `data:image/png;base64,${modalData.avatarBase64}` : "/default-avatar.png"} alt="avatar" style={{ width: 100, height: 100, borderRadius: "50%", marginBottom: 10 }} />
                            <p><b>Email:</b> {modalData.email}</p>
                            <p><b>Phone:</b> {modalData.phone || "N/A"}</p>
                            <p><b>Blocked At:</b> {modalData.blockedAt ? new Date(modalData.blockedAt).toLocaleString() : "N/A"}</p>
                            <p><b>Reason:</b> {modalData.blockReason || "N/A"}</p>
                            <Button variant="danger" onClick={() => unblockUser(modalData.id)}>Unblock User</Button>
                        </>
                    )}

                    {modalType === "verification" && modalData && (
                        <>
                            <p><b>Email:</b> {modalData.email}</p>
                            <p><b>Phone:</b> {modalData.phone || "N/A"}</p>
                            <div style={{ marginBottom: "10px" }}>
                                <Carousel>
                                    {modalData.images.map((imgBase64: string, idx: number) => (
                                        <Carousel.Item key={idx}>
                                            <img
                                                className="d-block w-100"
                                                src={`data:image/png;base64,${imgBase64}`}
                                                alt={`Verification image ${idx + 1}`}
                                                style={{ maxHeight: "350px", objectFit: "contain" }}
                                            />
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                            </div>
                            <div>
                                <Button variant="success" onClick={() => respondVerification(modalData.id, true)} style={{ marginRight: "10px" }}>Approve</Button>
                                <Button variant="danger" onClick={() => respondVerification(modalData.id, false)}>Reject</Button>
                            </div>
                        </>
                    )}

                    {modalType === "complaint" && modalData && (
                        <>
                            <p><b>Message:</b></p>
                            <p>{modalData.message}</p>
                            <p><b>Created at:</b> {new Date(modalData.created_at).toLocaleString()}</p>
                            <p><b>Related to:</b> {modalData.complained_post_title || `${modalData.complained_user_name || ""} ${modalData.complained_user_surname || ""}`}</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminPanel;
