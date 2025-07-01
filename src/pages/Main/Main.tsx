import React, { useState, useEffect } from "react";
import { Card, Spinner, Form, Button } from "react-bootstrap";
import axios from "axios";
import PageWrapper from "../../components/PageWrapper/PageWrapper";
import Masonry from "react-masonry-css";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

interface Post {
    id: number;
    title: string;
    caption: string;
    price: number;
    images: string;
    tags: string;
    views: number;
    isPromoted: boolean;
    createdAt: string;
    userId: number;
    category_id: number;
}

interface CategoryOption {
    value: number;
    label: string;
}

const getBreakpointColumns = (postCount: number) => {
    const maxCols = 4;
    const cols = Math.min(postCount, maxCols);
    return {
        default: cols,
        1100: Math.min(cols, 3),
        700: Math.min(cols, 2),
        500: 1,
    };
};

const Main: React.FC = () => {
    const navigate = useNavigate();
    
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [categories, setCategories] = useState<CategoryOption[]>([]);

    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("");

    const API_URL = import.meta.env.VITE_API_URL;

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
    }, [API_URL]);

    useEffect(() => {
        loadPosts();
    }, [API_URL]);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get<Post[]>(`${API_URL}/posts`);
            setPosts(res.data);
        } catch (err) {
            console.error("Error loading posts:", err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrls = (images: string): string[] => {
        try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed)) {
                return parsed.map((imgBase64: string) =>
                    imgBase64.startsWith("data:") ? imgBase64 : `data:image/jpeg;base64,${imgBase64}`
                );
            }
            return [];
        } catch {
            return [];
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}.${month}.${year} at ${hours}:${minutes}`;
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (title.trim()) params.title = title.trim();
            if (minPrice.trim()) params.min_price = Number(minPrice);
            if (maxPrice.trim()) params.max_price = Number(maxPrice);
            if (categoryId) {
                const cat = categories.find((c) => c.value === Number(categoryId));
                if (cat) params.category_name = cat.label;
            }

            const res = await axios.get<Post[]>(`${API_URL}/posts/filter`, { params });

            const postsWithSerializedImages: Post[] = res.data.map(post => ({
                ...post,
                images: JSON.stringify(post.images ?? []),
            }));

            setPosts(postsWithSerializedImages);

            console.log(postsWithSerializedImages);
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setPosts([]);
            } else {
                console.error("Error searching posts:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <>
                <Form style={{ display: "flex", gap: "10px", width: "100%" }}>
                    <Form.Group className="mb-3" controlId="titleInput">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group style={{ width: "80px" }} controlId="minPriceInput">
                        <Form.Label>From</Form.Label>
                        <Form.Control
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            min={0}
                        />
                    </Form.Group>

                    <Form.Group style={{ width: "80px" }} controlId="maxPriceInput">
                        <Form.Label>To</Form.Label>
                        <Form.Control
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            min={0}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="categorySelect">
                        <Form.Label>Category</Form.Label>
                        <Select
                            options={categories}
                            onChange={(selectedOption) => setCategoryId(selectedOption ? String(selectedOption.value) : null)}
                            value={categories.find((c) => c.value === Number(categoryId)) || null}
                            isClearable
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
                                    boxShadow: "inset 1px 0 0 rgb(63, 68, 74)",
                                }),
                                dropdownIndicator: (base) => ({
                                    ...base,
                                    color: "rgb(137, 143, 150)",
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
                                    backgroundColor: state.isFocused ? "rgb(25, 135, 84)" : "rgb(33, 37, 41)",
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

                    <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "13px" }}>
                        <Button variant="success" onClick={handleSearch} style={{ width: "120px" }} disabled={loading}>
                            {loading ? "Loading..." : "Search"}
                        </Button>
                    </div>
                </Form>

                {loading ? (
                    <Spinner animation="border" />
                ) : posts.length === 0 ? (
                    <p style={{ color: "rgb(137, 143, 150)" }}>No posts found.</p>
                ) : (
                    <Masonry
                        breakpointCols={getBreakpointColumns(posts.length)}
                        className="my-masonry-grid"
                        columnClassName="my-masonry-grid_column"
                    >
                        {posts.map((post) => {
                            const images = getImageUrls(post.images);
                            return (
                                <Card
                                    key={post.id}
                                    className={`shadow-sm ${post.isPromoted ? "border-success" : ""}`}
                                    style={{
                                        backgroundColor: "rgb(33, 37, 41)",
                                        color: "white",
                                        marginBottom: "16px",
                                        minWidth: "250px",
                                        maxWidth: "400px",
                                        borderRadius: "12px",
                                    }}
                                >
                                    {images.length > 0 && (
                                        <Card.Img
                                            variant="top"
                                            src={images[0]}
                                            style={{
                                                objectFit: "cover",
                                            }}
                                            alt={post.title}
                                        />
                                    )}
                                    <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: "bold" }}>{post.title}</p>
                                            <p style={{ marginBottom: "8px", fontWeight: "100", fontSize: "90%" }}>
                                                {post.caption.length > 100 ? post.caption.slice(0, 100) + "..." : post.caption}
                                            </p>
                                        </div>
                                        <div style={{display: "flex", alignItems: "flex-end", justifyContent: "space-between"}}>
                                            <h5 style={{ margin: 0, color: "rgb(25, 135, 84)", fontSize: "130%" }}>
                                                {post.price.toLocaleString("de-DE")}₴
                                            </h5>
                                            <Button variant="success" onClick={() => navigate(`/post/${post.id}`)} style={{ width: "60px" }} disabled={loading}>View</Button>
                                        </div>
                                    </Card.Body>
                                    <Card.Footer>
                                        <div
                                            style={{
                                                color: "rgb(137, 143, 150)",
                                                display: "flex",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <div>{formatDate(post.createdAt)}</div>
                                            <div>
                                                <FontAwesomeIcon icon={faEye} /> {post.views}
                                            </div>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            );
                        })}
                    </Masonry>
                )}
            </>
        </PageWrapper>
    );
};

export default Main;