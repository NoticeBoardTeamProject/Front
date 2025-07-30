import React, { useState, useEffect } from "react";
import { Spinner, Form, Button } from "react-bootstrap";
import axios from "axios";
import PageWrapper from "../../components/PageWrapper/PageWrapper";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

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

            const postsWithSerializedImages: Post[] = res.data.map(post => ({
                ...post,
                images: JSON.stringify(post.images ?? []),
            }));

            setPosts(postsWithSerializedImages);
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
                <Form style={{ display: "flex", gap: "28px", width: "100%" }}>
                    <Form.Group controlId="categorySelect">
                        <Form.Label>Category</Form.Label>
                        <Select
                            options={categories}
                            onChange={(selectedOption) => setCategoryId(selectedOption ? String(selectedOption.value) : null)}
                            value={categories.find((c) => c.value === Number(categoryId)) || null}
                            isClearable
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    backgroundColor: "#F2F2F2",
                                    color: "black",
                                    border: "3px solid #D9A441",
                                    boxShadow: "inset 0 0 12px rgba(0, 0, 0, 0.4)",
                                    fontWeight: "600"
                                }),
                                valueContainer: (base) => ({
                                    ...base,
                                    padding: "0 8px",
                                }),
                                indicatorSeparator: () => ({
                                    display: "none",
                                }),
                                indicatorsContainer: (base) => ({
                                    ...base,
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
                                    backgroundColor: "#F2F2F2",
                                    zIndex: 10,
                                }),
                                option: (base) => ({
                                    ...base,
                                    backgroundColor: "#F2F2F2",
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
                                    primary25: "#D9A441",
                                    primary: "#D9A441",
                                },
                            })}
                        />
                    </Form.Group>

                    <Form.Group controlId="titleInput">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group
                        style={{
                            width: "120px"
                        }}
                        controlId="minPriceInput"
                    >
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            min={0}
                            placeholder="From"
                            className="no-spinner"
                        />
                    </Form.Group>

                    <Form.Group
                        style={{
                            width: "120px",
                            display: "flex",
                            alignItems: "flex-end"
                        }}
                        controlId="maxPriceInput"
                    >
                        <Form.Control
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            min={0}
                            placeholder="To"
                            className="no-spinner"
                        />
                    </Form.Group>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            flex: "1"
                        }}
                    >
                        <Button variant="success" onClick={handleSearch} disabled={loading}>
                            {loading ? "Loading..." : "Search"}
                        </Button>
                        <Button
                            variant="success"
                            onClick={() => navigate("/create-notice")}
                            disabled={loading}
                        >
                            Create notice
                        </Button>
                    </div>
                </Form>

                <div
                    style={{
                        width: "100%",
                        paddingTop: "28px",
                        color: "#F2F2F2"
                    }}
                >
                    {loading ? (
                        <Spinner animation="border" />
                    ) : posts.length === 0 ? (
                        <p style={{ color: "rgb(137, 143, 150)" }}>No posts found.</p>
                    ) : (
                        <div>
                            {posts.map((post) => {
                                const images = getImageUrls(post.images);
                                return (
                                    <div style={{ display: "flex", marginTop: "28px" }}>
                                        <div
                                            key={post.id}
                                            onClick={() => navigate(`/post/${post.id}`)}
                                            className="noise-overlay"
                                            style={{
                                                backgroundColor: "#0D0D0D",
                                                color: "white",
                                                marginBottom: "16px",
                                                width: "100%",
                                                display: "flex",
                                                cursor: "pointer",
                                                transition: "background-color 0.2s",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1a1a1a")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0D0D0D")}
                                        >
                                            <img
                                                src={images[0]}
                                                style={{
                                                    objectFit: "cover",
                                                    height: "240px",
                                                    width: "300px"
                                                }}
                                                alt={post.title}
                                            />
                                            <div
                                                style={{
                                                    width: "100%",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "space-between",
                                                    padding: "28px"
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "flex-start"
                                                    }}
                                                >
                                                    <div>
                                                        <p
                                                            style={{
                                                                fontWeight: "bold",
                                                                textTransform: "uppercase",
                                                                marginBottom: "12px"
                                                            }}
                                                        >
                                                            {post.title}
                                                        </p>
                                                        <p
                                                            style={{
                                                                marginBottom: "8px",
                                                                fontWeight: "lighter",
                                                                fontSize: "90%",
                                                                color: "#d7d7d7"
                                                            }}
                                                        >
                                                            {post.caption.length > 100 ? post.caption.slice(0, 100) + "..." : post.caption}
                                                        </p>
                                                    </div>
                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            fontWeight: 'bold',
                                                            fontSize: '18px',
                                                            padding: '6px 18px',
                                                            borderRadius: '6px',
                                                            background: 'linear-gradient(to bottom,#d9a441 0%,#c6a974 50%,#cc8d18 100%)',
                                                            color: '#0D0D0D',
                                                            boxShadow: "inset 2px 2px 5px #c78200, inset -2px -2px 5px #ad7307",
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            height: '41.32px'
                                                        }}
                                                    >
                                                        {post.price.toLocaleString("de-DE")}₴
                                                    </p>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        fontSize: "80%",
                                                        color: "#a6a6a6",
                                                        paddingRight: "150px"
                                                    }}
                                                >
                                                    <p>Published {formatDate(post.createdAt)}</p>
                                                    <div>
                                                        Views: {post.views}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{
                                            position: "relative"
                                        }}>
                                            <div style={{
                                                width: 0,
                                                height: 0,
                                                borderLeft: '120px solid transparent',
                                                borderBottom: '100px solid #0D0D0D',
                                                zIndex: "100",
                                                position: "absolute",
                                                top: "140px",
                                                left: "-120px"
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </>
        </PageWrapper>
    );
};

export default Main;