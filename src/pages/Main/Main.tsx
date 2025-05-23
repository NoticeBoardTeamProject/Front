import React, { useState, useEffect } from "react";
import { Card, Spinner } from "react-bootstrap";
import axios from "axios";
import PageWrapper from "../../components/PageWrapper/PageWrapper";
import Masonry from "react-masonry-css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye
} from "@fortawesome/free-solid-svg-icons";

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

const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
};

const Main: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        setLoading(true);
        axios
            .get<Post[]>(`${API_URL}/posts`)
            .then((res) => {
                setPosts(res.data);
            })
            .catch((err) => {
                console.error("Error loading posts:", err);
            })
            .finally(() => setLoading(false));
    }, [API_URL]);

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

    return (
        <PageWrapper>
            {loading ? (
                <Spinner animation="border" />
            ) : posts.length === 0 ? (
                <p>Объявления не найдены.</p>
            ) : (
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {posts.map((post) => {
                        const images = getImageUrls(post.images);
                        return (
                            <Card
                                key={post.id}
                                className={post.isPromoted ? "border-success" : ""}
                                style={{
                                    backgroundColor: "rgb(33, 37, 41)",
                                    color: "white",
                                    marginBottom: "16px",
                                    width: "100%",
                                }}
                            >
                                {images.length > 0 && (
                                    <Card.Img
                                        variant="top"
                                        src={images[0]}
                                        style={{ objectFit: "cover" }}
                                        alt={post.title}
                                    />
                                )}
                                <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: "bold" }}>
                                            {post.title}
                                        </p>
                                        <p
                                            style={{
                                                marginBottom: "8px",
                                                fontWeight: "100",
                                                fontSize: "90%",
                                            }}
                                        >
                                            {post.caption.length > 100 ? post.caption.slice(0, 100) + "..." : post.caption}
                                        </p>
                                    </div>
                                    <h5 style={{ margin: 0, color: "rgb(25, 135, 84)", fontSize: "130%" }}>
                                        {post.price.toLocaleString('de-DE')}₴
                                    </h5>
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
        </PageWrapper>
    );
};

export default Main;
