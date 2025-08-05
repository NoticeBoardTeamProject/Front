import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Carousel, InputGroup } from "react-bootstrap";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

import ButtonRight from "../../assets/icons/ButtonRight.svg?react";

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
        <div
            style={{
                width: "100%",
                padding: "0 14px",
                paddingBottom: "84px"
            }}
        >
            <div
                style={{
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
                    >
                        Enter title
                    </p>
                    <Form.Control
                        type="text"
                        placeholder="Enter new name"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        gap: "14px",
                        marginTop: "14px"
                    }}
                >
                    <Form.Group>
                        <Form.Label>Price</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="number"
                                min={0}
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                style={{
                                    width: "140px"
                                }}
                                placeholder="Enter price"
                            />
                            <InputGroup.Text style={{
                                width: "36px",
                                display: "flex",
                                justifyContent: "center",
                                userSelect: "none",
                                backgroundColor: "#F2F2F2",
                                color: "#0D0D0D",
                                border: "3px solid #D9A441",
                                boxShadow: "inset 0 0 12px rgba(0, 0, 0, 0.4)",
                                fontWeight: "600",
                                borderLeft: "none"
                            }}>₴</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Tags (comma-separated)</Form.Label>
                        <Form.Control
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Enter tags"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Select
                            options={categories}
                            onChange={(selectedOption) => setCategoryId(String(selectedOption?.value))}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    backgroundColor: "#F2F2F2",
                                    color: "#0D0D0D",
                                    border: "3px solid #D9A441",
                                    boxShadow: "inset 0 0 12px rgba(0, 0, 0, 0.4)",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    minWidth: "180px"
                                }),
                                valueContainer: (base) => ({
                                    ...base,
                                    padding: "0 8px",
                                    color: "#0D0D0D",
                                }),
                                indicatorSeparator: () => ({
                                    display: "none",
                                }),
                                indicatorsContainer: (base) => ({
                                    ...base,
                                    boxShadow: "inset 1px 0 0 rgb(217, 164, 65)",
                                }),
                                dropdownIndicator: (base) => ({
                                    ...base,
                                    color: "#D9A441",
                                    cursor: "pointer",
                                }),
                                input: (base) => ({
                                    ...base,
                                    margin: 0,
                                    padding: 0,
                                    color: "#0D0D0D",
                                    fontWeight: 600,
                                }),
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: "#F2F2F2",
                                    zIndex: 10,
                                    color: "#0D0D0D",
                                    fontWeight: 600,
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused ? "#D9A441" : "#F2F2F2",
                                    color: "#0D0D0D",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    fontWeight: 600,
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: "#0D0D0D",
                                    fontWeight: 600,
                                }),
                            }}
                            theme={(theme) => ({
                                ...theme,
                                borderRadius: 4,
                                colors: {
                                    ...theme.colors,
                                    primary25: "#D9A441",
                                    primary: "#D9A441",
                                    neutral0: "#F2F2F2",
                                    neutral80: "#0D0D0D",
                                },
                            })}
                        />
                    </Form.Group>
                </div>
            </div>
            <div
                style={{
                    padding: "28px 40px",
                    marginTop: "28px",
                    backgroundColor: "#0D0D0D"
                }}
            >
                <Form.Group
                    style={{
                        width: "320px",
                        marginBottom: "14px"
                    }}
                >
                    <Form.Label>Upload Images (up to 6)</Form.Label>
                    <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
                </Form.Group>

                {images.length > 0 && (
                    <div
                        style={{
                            position: "relative",
                            width: "320px"
                        }}
                    >
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
            <div
                style={{
                    padding: "28px 40px",
                    marginTop: "28px",
                    backgroundColor: "#0D0D0D"
                }}
            >
                <Form.Group>
                    <Form.Label>Caption</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        required
                        placeholder="Enter caption"
                    />
                </Form.Group>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "28px"
                }}
            >
                <Button type="submit" variant="success" disabled={loading} onClick={handleSubmit}>
                    {loading ? <Spinner animation="border" size="sm" /> : "Create Notice"}
                </Button>
            </div>
        </div>
    );
};

export default CreateNotice;
