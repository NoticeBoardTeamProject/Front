import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";

const Settings: React.FC = () => {
    const navigate = useNavigate();

    const [editedName, setEditedName] = useState("");
    const [editedSurname, setEditedSurname] = useState("");
    const [editedPhone, setEditedPhone] = useState("");
    const [editedAvatar, setEditedAvatar] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(`${API_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const userData = response.data;

            setEditedName(userData.name);
            setEditedSurname(userData.surname);
            setEditedPhone(userData.phone);
        };

        fetchUser();
    }, []);

    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.dispatchEvent(new Event("loggedOut"));
        navigate("/login");
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            await axios.put(`${API_URL}/update-profile`, {
                name: editedName,
                surname: editedSurname,
                phone: editedPhone,
                avatarBase64: editedAvatar,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            window.dispatchEvent(new Event("changedUsernameData"));
        } catch (err) {
            console.error("Failed to update profile", err);
        }
    };

    return (
        <div
            style={{
                width: "100%",
                padding: "0 14px"
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: "14px",
                    padding: "28px 40px",
                    backgroundColor: "#0D0D0D"
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
            <div
                style={{
                    padding: "28px 40px",
                    backgroundColor: "#0D0D0D",
                    marginTop: "28px",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <div>
                    <p style={{ color: "white", marginBottom: "8px" }}>Upload new avatar</p>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        style={{
                            width: "320px"
                        }}
                        onChange={(e) => {
                            const input = e.target as HTMLInputElement;
                            const file = input.files?.[0];
                            if (!file) return;

                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setEditedAvatar(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                        }}
                    />
                </div>
                {editedAvatar && (
                    <div>
                        <p
                            style={{
                                color: "white",
                                marginBottom: "8px",
                                marginTop: "12px"
                            }}
                        >
                            New avatar:
                        </p>
                        <div
                            style={{
                                width: "120px",
                                height: "120px",
                                clipPath: "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                                overflow: "hidden",
                                border: "2px solid #ccc"
                            }}
                        >
                            <img
                                src={editedAvatar}
                                alt="Avatar Preview"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover"
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
            <Form
                style={{
                    marginTop: "16px",
                    display: "flex",
                    padding: "0 28px",
                    justifyContent: "space-between"
                }}
            >
                <Button onClick={handleLogout}>
                    Exit account
                </Button>
                <Button style={{ marginLeft: "12px" }} variant='secondary' onClick={handleUpdate}>
                    Save changes
                </Button>
            </Form>
        </div>
    );
};

export default Settings;

