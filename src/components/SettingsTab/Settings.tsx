import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Settings.css"

import "bootstrap/dist/css/bootstrap.min.css";

const Settings: React.FC = () => {
    const navigate = useNavigate();

    const [editedName, setEditedName] = useState("");
    const [editedSurname, setEditedSurname] = useState("");
    const [editedPhone, setEditedPhone] = useState("");
    const [editedAvatar, setEditedAvatar] = useState("");
    const [email, setEmail] = useState(""); // збережемо email для reset
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
            setEmail(userData.email); // <-- збережемо email
        };

        fetchUser();
    }, []);

    const handleLogout = (e: React.FormEvent) => {
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

            const payload = {
                name: editedName,
                surname: editedSurname,
                phone: editedPhone,
                avatarBase64: editedAvatar,
            };

            await axios.put(`${API_URL}/update-profile`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            setEditedAvatar("");

            window.dispatchEvent(new Event("changedUsernameData"));
        } catch (err) {
            console.error("Failed to update profile", err);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/forgot-password`, { email });
            alert("If this email exists, instructions have been sent.");
        } catch (err) {
            console.error("Failed to request password reset", err);
            alert("Failed to request password reset.");
        }
    }

    return (
        <div className="settings-container">
            <div className="settings-section">
                <div className="form-grid">
                    <div className="form-field">
                        <p className="field-label">Change name</p>
                        <Form.Control
                            type="text"
                            placeholder="Enter new name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="settings-input"
                        />
                    </div>
                    <div className="form-field">
                        <p className="field-label">Change surname</p>
                        <Form.Control
                            type="text"
                            placeholder="Enter new surname"
                            value={editedSurname}
                            onChange={(e) => setEditedSurname(e.target.value)}
                            className="settings-input"
                        />
                    </div>
                    <div className="form-field">
                        <p className="field-label">Change phone number</p>
                        <Form.Control
                            type="text"
                            placeholder="Enter new phone"
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                            className="settings-input"
                        />
                    </div>
                </div>
            </div>

            <div className="settings-section avatar-section">
                <div className="avatar-upload">
                    <p className="field-label">Upload new avatar</p>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        className="avatar-file-input"
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
                    <div className="avatar-preview">
                        <p className="field-label">New avatar:</p>
                        <div className="avatar-preview-container">
                            <img
                                src={editedAvatar}
                                alt="Avatar Preview"
                                className="avatar-preview-image"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="settings-actions">
                <Button onClick={handleLogout} className="logout-button">
                    Exit account
                </Button>
                <Button variant='secondary' onClick={handleUpdate} className="save-button">
                    Save changes
                </Button>
                <Button variant='warning' onClick={handlePasswordReset} className="reset-button">
                    Reset password
                </Button>
            </div>
        </div>
    );
};

export default Settings;