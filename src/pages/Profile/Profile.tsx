import React, { useState, useEffect, CSSProperties } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import {
    faPerson,
    faInbox,
    faPhone,
    faClock,
    faScaleBalanced,
    faWrench,
    faXmark
} from "@fortawesome/free-solid-svg-icons";

import PageWrapper from "../../components/PageWrapper/PageWrapper";

interface InfoFieldProps {
    icon: FontAwesomeIconProps["icon"];
    text: string;
    value: string;
    style?: CSSProperties;
}

const InfoField: React.FC<InfoFieldProps> = ({ icon, text, value, style }) => {
    return (
        <li style={{
            marginBottom: "4px",
            ...style,
        }}>
            <FontAwesomeIcon icon={icon} style={{ marginRight: 6, width: "17px" }} />
            {text}: <strong style={{ color: "white" }}>{value}</strong>
        </li>
    );
};

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

    const handleLogoutOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
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
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            window.dispatchEvent(new Event("loggedOut"));
            navigate("/login");
        }
    };

    const toggleEdit = () => setIsEditing(!isEditing);

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
            <div>
                <ul style={{ color: "rgba(255, 255, 255, 0.25)", paddingLeft: 0, listStyle: "none" }}>
                    {isEditing ? (
                        <>
                            <li style={{ marginBottom: "4px", display: "flex", alignItems: "center" }}>
                                <FontAwesomeIcon icon={faPerson} style={{ marginRight: 6, width: "17px", position: "relative", top: "16px", fontSize: "120%" }} />
                                <Form.Control
                                    type='text'
                                    placeholder='Name'
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    required
                                />
                            </li>
                            <li style={{ marginBottom: "4px", display: "flex", alignItems: "center" }}>
                                <Form.Control
                                    style={{
                                        marginLeft: "22px"
                                    }}
                                    type='text'
                                    placeholder='Surname'
                                    value={editedSurname}
                                    onChange={(e) => setEditedSurname(e.target.value)}
                                    required
                                />
                            </li>
                            <li style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                                <FontAwesomeIcon icon={faPhone} style={{ marginRight: 6, width: "17px" }} />
                                <Form.Control
                                    type='text'
                                    placeholder='Phone'
                                    value={editedPhone}
                                    onChange={(e) => setEditedPhone(e.target.value)}
                                    required
                                />
                            </li>
                        </>
                    ) : (
                        <>
                            <InfoField style={{ fontSize: "120%", marginBottom: "6px" }} icon={faPerson} text={"Name"} value={`${user.name} ${user.surname}`} />
                            <InfoField icon={faPhone} text={"Phone"} value={user.phone} />
                        </>
                    )}
                    <InfoField icon={faInbox} text={"Email"} value={user.email} />
                    <InfoField icon={faScaleBalanced} text={"Role"} value={user.role} />
                    <InfoField
                        icon={faClock}
                        text={"Created"}
                        value={new Date(user.createdAt).toLocaleString("en-EN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    />
                </ul>

                <Form style={{ width: "300px", marginTop: "16px", display: "flex" }} onSubmit={handleLogoutOrUpdate}>
                    <Button className='w-100' variant={isEditing ? 'success' : 'dark'} type='submit'>
                        {isEditing ? "Confirm changes" : "Exit account"}
                    </Button>
                    <Button style={{ marginLeft: "12px" }} variant='secondary' onClick={toggleEdit}>
                        <FontAwesomeIcon style={isEditing ? {width: "13px", fontSize: "110%"} : {}} icon={isEditing ? faXmark : faWrench} />
                    </Button>
                </Form>
            </div>
        </PageWrapper>
    );
};

export default ProfilePage;
