import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import PageWrapper from "../../components/PageWrapper/PageWrapper";

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    useEffect(() => {
        const storedEmail = localStorage.getItem("username");
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();

        localStorage.removeItem("token");
        localStorage.removeItem("username");

        window.dispatchEvent(new Event("loggedOut"));
        navigate("/login");
    };

    return (
        <PageWrapper>
            <div>
                <p style={{ color: "rgba(255, 255, 255, 0.251)", marginBottom: "8px" }}>
                    Logged in as <strong style={{color: "white"}}>{email}</strong>
                </p>
                <Form style={{ width: "300px" }} onSubmit={handleLogout}>
                    <Button className='w-100' variant='dark' type='submit'>
                        Exit account
                    </Button>
                </Form>
            </div>
        </PageWrapper>
    );
};

export default ProfilePage;
