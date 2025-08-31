import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Spinner } from "react-bootstrap";
import "./Rating.css";

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
        <div className="rating-container">
            {/* Top Info */}
            <div className="rating-stats">
                <div className="stat-item">
                    <div className="stat-label">Rating</div>
                    <p className="stat-value">{rating.toFixed(1)} ({reviewsCount})</p>
                    <div className="stars-container">
                        <div className="stars">
                            {[...Array(5)].map((_, i) =>
                                i < roundedRating ? <FullStar key={i} width={28} height={28} /> : <HollowStar key={i} width={28} height={28} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="stat-item">
                    <div className="stat-label">Number of <br />notices created</div>
                    <div className="stat-value-large">{postsCount}</div>
                </div>
            </div>

            {/* Reviews Grid */}
            {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet.</p>
            ) : (
                <>
                    <p className="reviews-title">Last 10 reviews</p>

                    <div className="reviews-grid">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="review-card"
                            >
                                <div className="review-header">
                                    <div className="review-stars">
                                        {[...Array(5)].map((_, i) =>
                                            i < review.rating ? <FullStar key={i} width={18} height={18} /> : <HollowStar key={i} width={18} height={18} />
                                        )}
                                    </div>
                                    <div className="review-date">
                                        {formatDate(review.createdAt)}
                                    </div>
                                </div>
                                <p className="review-text">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Rating;
