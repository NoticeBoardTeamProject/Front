import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner, Carousel } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faChevronLeft, faChevronRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import PageWrapper from "../../components/PageWrapper/PageWrapper";

const Verify: React.FC = () => {
    const [images, setImages] = useState<File[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setSuccess(null);

        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            if (images.length + newFiles.length > 6) {
                setError("You can upload up to 6 images only.");
                return;
            }

            setImages(prev => [...prev, ...newFiles]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => {
            const newImages = [...prev];
            newImages.splice(index, 1);
            return newImages;
        });
        if (activeIndex >= images.length - 1 && activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (images.length === 0) {
            setError("Please select at least one image.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const API_URL = import.meta.env.VITE_API_URL;

        try {
            const formData = new FormData();
            images.forEach(image => formData.append("files", image));

            const token = localStorage.getItem("token");

            const response = await fetch(`${API_URL}/verification/request`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token || ""}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to submit verification request.");
            }

            setSuccess("Verification request submitted successfully.");
            setImages([]);
            setActiveIndex(0);
        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <Form onSubmit={handleSubmit} style={{width: "340px"}}>
                <Form.Label>Upload photos that confirm your identity.</Form.Label>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </Form.Group>

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

                        <Button
                            variant="dark"
                            size="sm"
                            style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                zIndex: 10,
                                borderRadius: "4px",
                                fontSize: "110%",
                                width: "30px",
                                height: "30px",
                            }}
                            onClick={() => removeImage(activeIndex)}
                            title="Delete current image"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </div>
                )}

                {error && <Alert variant="danger" style={{ marginTop: "1rem" }}>{error}</Alert>}
                {success && <Alert variant="success" style={{ marginTop: "1rem" }}>{success}</Alert>}

                <Button
                    type="submit"
                    disabled={loading}
                    variant="success"
                    style={{
                        width: "100%",
                        marginTop: "1rem"
                    }}
                >
                    {loading ? "Submitting..." : <><FontAwesomeIcon icon={faCheck} /> Submit Request</>}
                </Button>
            </Form>
        </PageWrapper>
    );
};

export default Verify;
