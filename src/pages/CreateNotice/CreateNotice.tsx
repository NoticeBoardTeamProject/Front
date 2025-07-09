import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Carousel, InputGroup } from "react-bootstrap";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import "./CreateNotice.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
    faChevronLeft,
    faChevronRight
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
    const [categories, setCategories] = useState<{ value: number; label: string }[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/categories`);
                const options = response.data.map((cat: any) => ({
                    value: cat.id,
                    label: cat.name,
                }));
                setCategories(options);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selected = Array.from(e.target.files);
        const combined = [...images, ...selected].slice(0, 6);
        setImages(combined);
    };

    const removeImage = (indexToRemove: number) => {
        const updated = images.filter((_, i) => i !== indexToRemove);
        if (activeIndex - 1 != -1) {
            setActiveIndex(activeIndex - 1);
        }
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
                <div style={{ width: "240px" }}>
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
                            <InputGroup>
                                <Form.Control
                                    type="number"
                                    min={0}
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                                <InputGroup.Text style={{
                                    boxShadow: "inset 1.7px 0 0 rgb(63, 68, 74)",
                                    width: "36px",
                                    display: "flex",
                                    justifyContent: "center",
                                    userSelect: "none"
                                }}>₴</InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Tags (comma-separated)</Form.Label>
                            <Form.Control value={tags} onChange={(e) => setTags(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Select
                                options={categories}
                                onChange={(selectedOption) => setCategoryId(String(selectedOption?.value))}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: "rgb(33, 37, 41)",
                                        border: "none",
                                        color: "white",
                                        minHeight: "29.25px",
                                        height: "29.25px",
                                    }),
                                    valueContainer: (base) => ({
                                        ...base,
                                        height: "29.25px",
                                        padding: "0 8px",
                                    }),
                                    indicatorSeparator: () => ({
                                        display: "none",
                                    }),
                                    indicatorsContainer: (base) => ({
                                        ...base,
                                        height: "29.25px",
                                        boxShadow: "inset 1px 0 0 rgb(63, 68, 74)"
                                    }),
                                    dropdownIndicator: (base) => ({
                                        ...base,
                                        color: "rgb(137, 143, 150)"
                                    }),
                                    input: (base) => ({
                                        ...base,
                                        margin: 0,
                                        padding: 0,
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: "rgb(33, 37, 41)",
                                        zIndex: 10,
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused
                                            ? "rgb(25, 135, 84)"
                                            : "rgb(33, 37, 41)",
                                        color: "white",
                                        cursor: "pointer",
                                        height: "29.25px",
                                        display: "flex",
                                        alignItems: "center",
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: "white",
                                    }),
                                }}
                                theme={(theme) => ({
                                    ...theme,
                                    borderRadius: 4,
                                    colors: {
                                        ...theme.colors,
                                        primary25: "rgb(25, 135, 84)",
                                        primary: "rgb(25, 135, 84)",
                                    },
                                })}
                            />
                        </Form.Group>
                        <Button className="w-100" type="submit" variant="success" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : "Create Notice"}
                        </Button>
                    </Form>
                </div>

                <div style={{ width: "340px" }}>
                    <Form.Group className="mb-3">
                        <Form.Label>Upload Images (up to 6)</Form.Label>
                        <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
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
                </div>
            </div>
        </PageWrapper>
    );
};

export default CreateNotice;
