import React, { useState } from "react";
import { Form, Button, Spinner, Carousel, Row, Col, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./CreateNotice.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";
import PageWrapper from "../../components/PageWrapper/PageWrapper";

const CreateNotice: React.FC = () => {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const [title, setTitle] = useState("");
    const [caption, setCaption] = useState("");
    const [price, setPrice] = useState("");
    const [tags, setTags] = useState("");
    const [categoryId, setCategoryId] = useState("0");
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const [activeIndex, setActiveIndex] = useState(0);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const selected = Array.from(e.target.files);
        const combined = [...images, ...selected].slice(0, 6);
        setImages(combined);
    };

    const removeImage = (indexToRemove: number) => {
        const updated = images.filter((_, i) => i !== indexToRemove);
        setImages(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("caption", caption);
        formData.append("price", price);
        formData.append("tags", tags);
        formData.append("category_id", categoryId);

        images.forEach((img) => {
            formData.append("images", img);
        });

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_URL}/posts`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            navigate("/");
        } catch (error) {
            console.error("Error creating notice:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div style={{ gap: "40px", justifyContent: "center", display: "flex" }}>
                <div style={{width: "240px"}}>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Caption</Form.Label>
                            <Form.Control as="textarea" rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Tags (comma-separated)</Form.Label>
                            <Form.Control value={tags} onChange={(e) => setTags(e.target.value)} />
                        </Form.Group>

                        <Button className='w-100' type="submit" variant="success" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : "Create Notice"}
                        </Button>
                    </Form>
                </div>

                <div style={{width: "340px"}}>
                    <Form.Group className="mb-3">
                        <Form.Label>Upload Images (up to {6})</Form.Label>
                        <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
                    </Form.Group>

                    {images.length > 0 && (
                        <div style={{ position: "relative" }}>
                            <Carousel>
                                {images.map((file, index) => (
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
                                                src={URL.createObjectURL(file)}
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

                            {images.length > 0 && (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    style={{
                                        position: "absolute",
                                        top: 10,
                                        right: 10,
                                        zIndex: 10,
                                        borderRadius: "4px",
                                        fontSize: "110%",
                                        width: "30px",
                                        height: "30px"
                                    }}
                                    onClick={() => removeImage(activeIndex)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default CreateNotice;
