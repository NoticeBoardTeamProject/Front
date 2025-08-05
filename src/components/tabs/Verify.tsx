import React, { useState, } from "react";
import { Form, Button, Alert, Carousel } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import ButtonRight from "../../assets/icons/ButtonRight.svg?react";

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
        <div>
            <Form
                onSubmit={handleSubmit}
                style={{
                    width: "400px",
                    backgroundColor: "#0D0D0D",
                    padding: "28px 40px"
                }}
            >
                <Form.Label>Please upload a photo where you are holding or standing next to the item you want to post.</Form.Label>
                <Form.Label>We use this to confirm that the person and item are real.</Form.Label>
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
            </Form>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center"
                }}
            >
                <Button
                    disabled={loading || images.length == 0}
                    style={{
                        marginTop: "12px"
                    }}
                    onClick={handleSubmit}
                >
                    {loading ? "Submitting..." : images.length == 0 ? "Attach at least one photo!" : "Submit Request"}
                </Button>
            </div>
        </div>
    );
};

export default Verify;
