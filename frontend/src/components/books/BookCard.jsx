import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Rating,
  IconButton,
  Tooltip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { truncateText } from '../../utils';

const BookCard = ({ book, onFavoriteToggle, isFavorite = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [favorite, setFavorite] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  const isAvailable = book.availableCopies > 0;
  const inCart = isInCart(book._id);

  const handleCardClick = () => {
    navigate(`/books/${book.slug || book._id}`);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (onFavoriteToggle) {
      setLoading(true);
      const success = await onFavoriteToggle(book._id, !favorite);
      if (success) {
        setFavorite(!favorite);
      }
      setLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await addToCart(book._id);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          '& .card-overlay': {
            opacity: 1,
          },
        },
      }}
      onClick={handleCardClick}
    >
      {/* Availability Badge */}
      <Chip
        label={isAvailable ? 'Có sẵn' : 'Hết sách'}
        size="small"
        color={isAvailable ? 'success' : 'default'}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1,
          fontWeight: 600,
        }}
      />

      {/* Cover Image */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="240"
          image={book.coverImage || 'https://via.placeholder.com/300x400?text=No+Image'}
          alt={book.title}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
        
        {/* Overlay on hover */}
        <Box
          className="card-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Button
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Xem chi tiết
          </Button>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Category */}
        {book.category && (
          <Chip
            label={book.category.name}
            size="small"
            variant="outlined"
            sx={{ mb: 1, fontSize: '0.7rem' }}
          />
        )}

        {/* Title */}
        <Typography
          variant="subtitle1"
          fontWeight={600}
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {book.title}
        </Typography>

        {/* Author */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {book.author}
        </Typography>

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Rating value={book.rating || 0} precision={0.1} size="small" readOnly />
          <Typography variant="caption" color="text.secondary">
            {book.rating?.toFixed(1) || '0'} ({book.reviewCount || 0})
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          disabled={!isAvailable || inCart}
          startIcon={<ShoppingCartIcon />}
          onClick={handleAddToCart}
        >
          {inCart ? 'Đã thêm' : 'Thêm giỏ'}
        </Button>
        
        <Tooltip title={favorite ? 'Bỏ yêu thích' : 'Yêu thích'}>
          <IconButton
            size="small"
            onClick={handleFavoriteClick}
            disabled={loading}
            color={favorite ? 'error' : 'default'}
          >
            {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default BookCard;
