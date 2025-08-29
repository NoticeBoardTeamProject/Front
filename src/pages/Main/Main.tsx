import React, { useState, useEffect } from "react";
import { Spinner, Form, Button } from "react-bootstrap";
import axios from "axios";
import PageWrapper from "../../components/PageWrapper";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";

import Search from "../../assets/icons/Search.svg?react";

import ButtonRight from "../../assets/icons/ButtonRight.svg?react";
import { formatTime } from "../../utils/FormatTime";

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
    isUsed: boolean;
    currency: string;
    location: string;
}

interface CategoryOption {
    value: number;
    label: string;
}

type PageButtonProps = {
    page: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
};

const PageButton: React.FC<PageButtonProps> = ({ page, currentPage, setCurrentPage }) => (
    <button
        onClick={() => setCurrentPage(page)}
        style={{
            width: "40px",
            height: "40px",
            backgroundColor: page === currentPage ? "#D9A441" : "#0D0D0D",
            color: "white",
            border: page === currentPage ? "none" : "2px solid #D9A441",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
        }}
    >
        {page}
    </button>
);

const Dots = () => (
    <span
        style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            border: "2px solid #D9A441",
            borderRadius: "8px"
        }}
    >
        ...
    </span>
);

const Main: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [categories, setCategories] = useState<CategoryOption[]>([]);

    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("");
    const [activeTab, setActiveTab] = useState<string>('All');

    const [currentPage, setCurrentPage] = useState<number>(1);
    const postsPerPage = 6;

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
    }, []);

    useEffect(() => {
        if (location.state && location.state.title) {
            setTitle(location.state.title);
            handleSearch(location.state.title);
        } else {
            loadPosts();
        }
    }, [location.state]);

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

    const handleSearch = async (customTitle?: string) => {
        setLoading(true);
        try {
            const params: any = {};

            const searchTitle = customTitle?.trim() || title.trim();
            if (searchTitle) params.title = searchTitle;
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

            setCurrentPage(1);
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

    const getFilteredPosts = (): Post[] => {
        switch (activeTab) {
            case "Popular":
                return [...posts]
                    .sort((a, b) => b.views - a.views)
            case "New":
                return [...posts].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            case "Cheapest":
                return [...posts].sort((a, b) => a.price - b.price);
            case "Expensive":
                return [...posts].sort((a, b) => b.price - a.price);
            default:
                return posts;
        }
    };

    const filteredPosts = getFilteredPosts();
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const currentPosts = filteredPosts.slice(
        (currentPage - 1) * postsPerPage,
        currentPage * postsPerPage
    );

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
                                    fontWeight: "600",
                                    "&:hover": {
                                        borderColor: "#D9A441",
                                    },
                                }),
                                valueContainer: (base) => ({
                                    ...base,
                                    padding: "0 8px",
                                }),
                                indicatorSeparator: () => ({
                                    display: "none",
                                    backgroundColor: "#D9A441",
                                }),
                                indicatorsContainer: (base) => ({
                                    ...base,
                                    borderLeft: "2px solid #D9A441",
                                }),
                                dropdownIndicator: (base) => ({
                                    ...base,
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
                                    border: "3px solid #D9A441",
                                    boxShadow: "inset 0 0 12px rgba(0, 0, 0, 0.4)",
                                }),
                                option: (base) => ({
                                    ...base,
                                    color: "#0D0D0D",
                                    cursor: "pointer",
                                    height: "29.25px",
                                    display: "flex",
                                    alignItems: "center",
                                    fontWeight: "bold"
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: "#0D0D0D",
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
                        <Button onClick={() => handleSearch()} disabled={loading}>
                            <Search width={22} height={22} />
                        </Button>
                        <Button
                            onClick={() =>
                                navigate('/profile', {
                                    state: { tab: 'create notice' }
                                })
                            }
                            style={{
                                height: '41px',
                                padding: "0px 18px",
                                borderRadius: '4px',
                                backgroundColor: "#D9A441",
                                border: "none",
                                boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.3)',
                            }}
                        >
                            Create notice
                        </Button>
                    </div>
                </Form>
                <p
                    style={{
                        color: "#D9A441",
                        width: "100%",
                        margin: "28px 0"
                    }}
                >Found {getFilteredPosts().length} notice{getFilteredPosts().length > 1 && "s"}</p>

                <div
                    style={{
                        display: "flex",
                        width: "100%",
                        alignItems: "flex-end"
                    }}
                >
                    <p
                        style={{
                            paddingRight: "14px",
                            color: "white",
                            fontSize: "120%",
                            textTransform: "uppercase"
                        }}
                    >
                        Notices
                    </p>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            flex: "1"
                        }}
                    >
                        <div style={{ display: "flex", gap: "28px" }}>
                            {["All", "Popular", "New", "Cheapest", "Expensive"].map((tab) => (
                                <div
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        color: activeTab === tab ? "#D9A441" : "#525252",
                                        cursor: "pointer",
                                        position: "relative",
                                        transition: "color 0.2s",
                                        padding: "0 6px 2px 6px"
                                    }}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                bottom: 0,
                                                left: 0,
                                                height: "1px",
                                                width: "100%",
                                                backgroundColor: "#E9E9E9",
                                                transition: "all 0.3s ease-in-out",
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div
                            style={{
                                height: "1px",
                                backgroundColor: "#525252"
                            }}
                        />
                    </div>
                </div>
                <div
                    style={{
                        width: "100%",
                        color: "#F2F2F2",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}
                >
                    {loading ? (
                        <Spinner animation="border" />
                    ) : posts.length === 0 ? (
                        <p
                            style={{
                                marginTop: "28px"
                            }}
                        >No notices found.</p>
                    ) : (
                        <div
                            style={{
                                width: "100%"
                            }}
                        >
                            {currentPosts.map((post) => {
                                const images = getImageUrls(post.images);
                                return (
                                    <div
                                        onClick={() => navigate(`/post/${post.id}`)}
                                        style={{
                                            display: "flex",
                                            marginTop: "28px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <div
                                            key={post.id}
                                            style={{
                                                backgroundColor: "#0D0D0D",
                                                color: "white",
                                                marginBottom: "16px",
                                                width: "100%",
                                                display: "flex",
                                                height: "240px",
                                                transition: "background-color 0.2s",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1a1a1a")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0D0D0D")}
                                        >
                                            {images.length > 0 && (
                                                <img
                                                    src={images[0]}
                                                    style={{
                                                        objectFit: "cover",
                                                        height: "240px",
                                                        width: "300px"
                                                    }}
                                                    alt={post.title}
                                                />
                                            )}
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
                                                                width: "600px",
                                                                color: "#d7d7d7"
                                                            }}
                                                        >
                                                            {post.caption.length > 300 ? post.caption.slice(0, 100) + "..." : post.caption}
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
                                                        {post.price.toLocaleString("de-DE")}{post.currency == "UAH" ? "₴" : post.currency == "USD" ? "$" : "€"}
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
                                                    <p>{post.location} - {formatTime(post.createdAt)}</p>
                                                    <p> Views: {post.views}</p>
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
                                                borderBottom: '100px solid #101211',
                                                zIndex: "100",
                                                position: "absolute",
                                                top: "140px",
                                                left: "-120px"
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                            {totalPages > 1 && (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        marginTop: "28px",
                                        gap: "16px"
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: 'space-between',
                                            width: "440px"
                                        }}
                                    >
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: currentPage === 1 ? "default" : "pointer",
                                                padding: 0,
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <ButtonRight
                                                width={50}
                                                height={50}
                                                style={{ transform: "scaleX(-1)" }}
                                            />
                                        </button>

                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <PageButton page={1} currentPage={currentPage} setCurrentPage={setCurrentPage} />

                                            {currentPage > 3 && <Dots />}

                                            {currentPage > 2 && (
                                                <PageButton page={currentPage - 1} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                                            )}

                                            {currentPage !== 1 && currentPage !== totalPages && (
                                                <PageButton page={currentPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                                            )}

                                            {currentPage < totalPages - 1 && (
                                                <PageButton page={currentPage + 1} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                                            )}

                                            {currentPage < totalPages - 2 && <Dots />}

                                            {totalPages > 1 && <PageButton page={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: currentPage === totalPages ? "default" : "pointer",
                                                padding: 0,
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <ButtonRight width={50} height={50} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </>
        </PageWrapper>
    );
};

export default Main;
