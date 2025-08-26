import { useState, useEffect, useRef } from 'react';
import { Star, MessageCircle, Heart, HeartOff } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { api } from '../../stores/api.js';
const RatingComponent = ({ 
  targetType, 
  targetId, 
  currentRating = 0, 
  totalRatings = 0,
  totalLikes = 0,
  totalFavorites = 0,
  totalComments = 0,
  showActions = true,
  onRatingChange,
  onLikeChange,
  onFavoriteChange
}) => {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  
  const [userRating, setUserRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ref to track recent notifications to prevent duplicates
  const recentNotificationRef = useRef({});

  // Helper function to prevent duplicate notifications
  const showNotification = (notification) => {
    const key = `${notification.title}-${notification.message}`;
    const now = Date.now();
    const lastShown = recentNotificationRef.current[key] || 0;
    
    // Prevent showing the same notification within 10 seconds (increased from 5)
    if (now - lastShown < 10000) {
      return;
    }
    
    recentNotificationRef.current[key] = now;
    recentNotificationRef.current.renderCount = (recentNotificationRef.current.renderCount || 0) + 1;
    addNotification(notification);
  };



  useEffect(() => {
    if (user) {
      checkUserStatus();
    }
  }, [user, targetId]);

  // Track component re-renders for debugging
  useEffect(() => {
    // Debug logging removed to reduce console noise
  });

  // Track when functions are called
  const checkUserStatus = async () => {
    if (!user) return;
    
    try {
      // Check user's rating for this target
      const ratingResponse = await api.get(`/ratings/user/${targetType}/${targetId}`);
      if (ratingResponse.data?.success && ratingResponse.data?.data?.rating) {
        const userRatingData = ratingResponse.data.data.rating;
        setUserRating(userRatingData.rating || 0);
        setComment(userRatingData.comment || '');
      }

      // Check like status
      const likeResponse = await api.get(`/likes/status/${targetType}/${targetId}`);
      if (likeResponse.data?.success) {
        setIsLiked(likeResponse.data.data?.isLiked || false);
      }

      // Check favorite status
      const favoriteResponse = await api.get(`/favorites/status/${targetType}/${targetId}`);
      if (favoriteResponse.data?.success) {
        setIsFavorited(favoriteResponse.data.data?.isFavorited || false);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      // Don't show error notification for status checks
    }
  };

  const handleRatingClick = (rating) => {
    if (!user) {
      showNotification({ 
        type: 'warning', 
        title: 'Login Required', 
        message: 'Please login to rate this item', 
        icon: 'alert-circle' 
      });
      return;
    }
    setUserRating(rating);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!userRating) return;
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Create a unique submission ID to prevent duplicate notifications
    const submissionId = `${targetType}-${targetId}-${userRating}-${Date.now()}`;
    
    try {
      const response = await api.post('/ratings/add', {
        targetType, 
        targetId, 
        rating: userRating, 
        comment: comment.trim() || undefined 
      });

      if (response.data?.success) {
        showNotification({ 
          id: submissionId, // Use unique ID to prevent duplicates
          type: 'success', 
          title: 'Rating Submitted', 
          message: 'Thank you for your rating!', 
          icon: 'check-circle' 
        });
        
        if (onRatingChange) {
          onRatingChange(response.data.data);
        }
        
        setShowRatingModal(false);
        setComment('');
        
        // Don't call checkUserStatus here as it can cause re-renders
        // The parent component should handle updating the rating display
      } else {
        throw new Error(response.data?.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Rating submission error:', error);
      showNotification({ 
        id: `${submissionId}-error`, // Use unique error ID
        type: 'error', 
        title: 'Error', 
        message: error.response?.data?.message || 'Failed to submit rating. Please try again.', 
        icon: 'x-circle' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      showNotification({ 
        type: 'warning', 
        title: 'Login Required', 
        message: 'Please login to like this item', 
        icon: 'alert-circle' 
      });
      return;
    }
    
    try {
      const response = await api.post('/likes/toggle', { targetType, targetId });
      
      if (response.data?.success) {
        const newLikeStatus = response.data.data.isLiked;
        setIsLiked(newLikeStatus);
        
        if (onLikeChange) {
          onLikeChange(newLikeStatus);
        }
        
        showNotification({ 
          id: `${targetType}-${targetId}-like-${Date.now()}`, // Unique ID
          type: 'success', 
          title: newLikeStatus ? 'Liked!' : 'Unliked', 
          message: newLikeStatus ? 'Added to your likes' : 'Removed from likes', 
          icon: newLikeStatus ? 'heart' : 'heart-off' 
        });
      } else {
        throw new Error(response.data?.message || 'Failed to update like');
      }
    } catch (error) {
      console.error('Like toggle error:', error);
      showNotification({ 
        id: `${targetType}-${targetId}-like-error-${Date.now()}`, // Unique error ID
        type: 'error', 
        title: 'Error', 
        message: error.response?.data?.message || 'Failed to update like. Please try again.', 
        icon: 'x-circle' 
      });
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      showNotification({ 
        type: 'warning', 
        title: 'Login Required', 
        message: 'Please login to favorite this item', 
        icon: 'alert-circle' 
      });
      return;
    }
    
    try {
      const response = await api.post('/favorites/toggle', { targetType, targetId });
      
      if (response.data?.success) {
        const newFavoriteStatus = response.data.data.isFavorited;
        setIsFavorited(newFavoriteStatus);
        
        if (onFavoriteChange) {
          onFavoriteChange(newFavoriteStatus);
        }
        
        showNotification({ 
          id: `${targetType}-${targetId}-favorite-${Date.now()}`, // Unique ID
          type: 'success', 
          title: newFavoriteStatus ? 'Added to Favorites!' : 'Removed from Favorites', 
          message: newFavoriteStatus ? 'Added to your favorites' : 'Removed from favorites', 
          icon: newFavoriteStatus ? 'heart' : 'heart-off' 
        });
      } else {
        throw new Error(response.data?.message || 'Failed to update favorite');
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      showNotification({ 
        id: `${targetType}-${targetId}-favorite-error-${Date.now()}`, // Unique error ID
        type: 'error', 
        title: 'Error', 
        message: error.response?.data?.message || 'Failed to update favorite. Please try again.', 
        icon: 'x-circle' 
      });
    }
  };

  const renderStars = () => ([...Array(5)].map((_, index) => (
    <button 
      key={index} 
      onClick={() => handleRatingClick(index + 1)} 
      className={`w-5 h-5 transition-colors ${index < userRating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'}`} 
      disabled={!user}
    >
      <Star className="w-full h-full" />
    </button>
  )));

  const renderDisplayStars = () => ([...Array(5)].map((_, index) => (
    <Star 
      key={index} 
      className={`w-4 h-4 ${index < Math.floor(currentRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
    />
  )));

  return (
    <div className="space-y-3">
      {/* Display current rating */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">{renderDisplayStars()}</div>
        <span className="text-sm text-gray-600">
          {currentRating > 0 ? `${currentRating.toFixed(1)} (${totalRatings} ratings)` : 'No ratings yet'}
        </span>
      </div>

      {/* User rating section */}
      {user && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Your Rating:</span>
            <div className="flex items-center space-x-1">{renderStars()}</div>
            {userRating > 0 && (
              <span className="text-sm text-gray-500">({userRating} stars)</span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {showActions && (
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleLike} 
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isLiked 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isLiked ? (
              <Heart className="w-4 h-4 fill-current" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{isLiked ? 'Liked' : 'Like'}</span>
            <span className="text-xs text-gray-500">({totalLikes})</span>
          </button>

          <button 
            onClick={toggleFavorite} 
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isFavorited 
                ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isFavorited ? (
              <Heart className="w-4 h-4 fill-current" />
            ) : (
              <HeartOff className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{isFavorited ? 'Favorited' : 'Favorite'}</span>
            <span className="text-xs text-gray-500">({totalFavorites})</span>
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MessageCircle className="w-4 h-4" />
            <span>{totalComments} comments</span>
          </div>

          {/* Test notification button - removed due to undefined function */}
        </div>
      )}

      {/* Rating modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rate this {targetType}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating: {userRating} stars
                </label>
                <div className="flex items-center space-x-1">{renderStars()}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (optional)
                </label>
                <textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  placeholder="Share your thoughts..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                  rows="3" 
                  maxLength="500" 
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {comment.length}/500
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button 
                  onClick={() => setShowRatingModal(false)} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors" 
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  onClick={submitRating} 
                  disabled={isSubmitting || userRating === 0} 
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingComponent;
