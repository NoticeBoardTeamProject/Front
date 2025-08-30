import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Spinner } from "react-bootstrap";

import HollowStar from "../../assets/icons/HollowStar.svg?react";
import FullStar from "../../assets/icons/FullStar.svg?react";
import { formatDate } from "../../utils/FormatTime";

const API_URL = import.meta.env.VITE_API_URL;

interface Review {
    id: number;
    authorId: number;
    text: string;
    rating: number;
    createdAt: string;
}

interface RatingResponse {
    rating: number;
    reviewsCount: number;
    postsCount: number;
    reviews: Review[];
}

const Rating: React.FC = () => {
    const [ratingData, setRatingData] = useState<RatingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchRating = async () => {
            try {
                const res = await axios.get<RatingResponse>(`${API_URL}/my/rating`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRatingData(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load rating data");
            } finally {
                setLoading(false);
            }
        };

        fetchRating();
    }, [token]);

    if (loading) {
        return <Spinner animation="border" variant="light" />;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!ratingData) return null;

    const { rating, reviewsCount, postsCount, reviews } = ratingData;
    const roundedRating = Math.floor(rating);

    return (
        <div style={{ padding: "16px", color: "white", width: "100%" }}>
            {/* Top Info */}
            <div style={{ display: "flex", justifyContent: "space-around" }}>
                <div style={{ textAlign: "center", fontWeight: "bold" }}>
                    <div style={{ textTransform: "uppercase", marginBottom: "16px" }}>Rating</div>
                    <p style={{ color: "#d4af37" }}>{rating.toFixed(1)} ({reviewsCount})</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "4px" }}>
                            {[...Array(5)].map((_, i) =>
                                i < roundedRating ? <FullStar key={i} width={28} height={28} /> : <HollowStar key={i} width={28} height={28} />
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "bold", textTransform: "uppercase", marginBottom: "16px" }}>Number of <br />notices created</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#d4af37" }}>{postsCount}</div>
                </div>
            </div>

            <p style={{
                margin: "16px 16px 8px 16px",
                color: "rgb(166, 166, 166)"
            }}>Last 10 reviews</p>

            {/* Reviews Grid */}
            {reviews.length === 0 ? (
                <p style={{ color: "#a6a6a6" }}>No reviews yet.</p>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "12px"
                }}>
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            style={{
                                backgroundColor: "#0D0D0D",
                                padding: "12px",
                                borderRadius: "12px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                            }}
                        >
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                                    {[...Array(5)].map((_, i) =>
                                        i < review.rating ? <FullStar key={i} width={18} height={18} /> : <HollowStar key={i} width={18} height={18} />
                                    )}
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "#a6a6a6" }}>
                                    {formatDate(review.createdAt)}
                                </div>
                            </div>
                            <p style={{ margin: 0, fontSize: "0.9rem" }}>{review.text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Rating;
