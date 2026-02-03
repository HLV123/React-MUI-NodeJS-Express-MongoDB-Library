import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  Rating,
  Divider,
  Paper,
  Avatar,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LanguageIcon from '@mui/icons-material/Language';
import BusinessIcon from '@mui/icons-material/Business';
import { bookService, userService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Loading } from '../../components/common';
import { BookGrid } from '../../components/books';
import { formatDate, getInitials, getAvatarColor } from '../../utils';
import toast from 'react-hot-toast';

const BookDetailPage = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookRes, relatedRes, reviewsRes] = await Promise.all([
          bookService.getBook(idOrSlug),
          bookService.getRelatedBooks(idOrSlug, 6),
          bookService.getBookReviews(idOrSlug, { limit: 5 }),
        ]);
        
        setBook(bookRes.data.book);
        setRelatedBooks(relatedRes.data.books || []);
        setReviews(reviewsRes.data.data?.reviews || []);

        // Check favorite status
        if (isAuthenticated) {
          try {
            const favRes = await userService.checkFavorite(bookRes.data.book._id);
            setIsFavorite(favRes.data.isFavorite);
          } catch (e) {}
        }
      } catch (error) {
        console.error('Failed to fetch book:', error);
        toast.error('Không tìm thấy sách');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idOrSlug, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await addToCart(book._id);
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isFavorite) {
        await userService.removeFavorite(book._id);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await userService.addFavorite(book._id);
        toast.success('Đã thêm vào yêu thích');
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loading fullScreen />;
  if (!book) return null;

  const isAvailable = book.availableCopies > 0;
  const inCart = isInCart(book._id);

  const bookInfo = [
    { icon: <BusinessIcon />, label: 'NXB', value: book.publisher },
    { icon: <CalendarTodayIcon />, label: 'Năm XB', value: book.publishYear },
    { icon: <MenuBookIcon />, label: 'Số trang', value: book.pageCount },
    { icon: <LanguageIcon />, label: 'Ngôn ngữ', value: book.language },
  ];

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/" color="inherit" underline="hover">Trang chủ</Link>
          <Link href="/books" color="inherit" underline="hover">Sách</Link>
          {book.category && (
            <Link href={`/categories/${book.category.slug}`} color="inherit" underline="hover">
              {book.category.name}
            </Link>
          )}
          <Typography color="text.primary">{book.title}</Typography>
        </Breadcrumbs>

        {/* Back button */}
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
          Quay lại
        </Button>

        {/* Book Detail */}
        <Grid container spacing={4}>
          {/* Cover Image */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, position: 'sticky', top: 100 }}>
              <Box
                component="img"
                src={book.coverImage}
                alt={book.title}
                sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
              />
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  disabled={!isAvailable || inCart}
                  onClick={handleAddToCart}
                >
                  {inCart ? 'Đã thêm giỏ' : isAvailable ? 'Thêm vào giỏ' : 'Hết sách'}
                </Button>
                <IconButton
                  size="large"
                  onClick={handleToggleFavorite}
                  color={isFavorite ? 'error' : 'default'}
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Còn {book.availableCopies}/{book.totalCopies} bản
              </Typography>
            </Paper>
          </Grid>

          {/* Book Info */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              {/* Category & Badges */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {book.category && (
                  <Chip
                    label={book.category.name}
                    icon={<span>{book.category.icon}</span>}
                    sx={{ bgcolor: `${book.category.color}20`, color: book.category.color }}
                  />
                )}
                {book.isFeatured && <Chip label="Nổi bật" color="secondary" size="small" />}
                <Chip
                  label={isAvailable ? 'Có sẵn' : 'Hết sách'}
                  color={isAvailable ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              {/* Title & Author */}
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {book.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {book.author}
              </Typography>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Rating value={book.rating || 0} precision={0.1} readOnly />
                <Typography variant="body1" fontWeight={600}>
                  {book.rating?.toFixed(1) || '0'}
                </Typography>
                <Typography color="text.secondary">
                  ({book.reviewCount || 0} đánh giá • {book.borrowCount || 0} lượt mượn)
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Book Info Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {bookInfo.map((info, index) => info.value && (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {info.icon}
                      <Box>
                        <Typography variant="caption" color="text.secondary">{info.label}</Typography>
                        <Typography variant="body2" fontWeight={500}>{info.value}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Tags */}
              {book.tags && book.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>Tags:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {book.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Typography variant="h6" gutterBottom>Giới thiệu sách</Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {book.description || 'Chưa có mô tả cho sách này.'}
              </Typography>
            </Paper>

            {/* Reviews */}
            <Paper sx={{ p: 4, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Đánh giá ({book.reviewCount || 0})
              </Typography>
              
              {reviews.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {reviews.map((review) => (
                    <Box key={review._id} sx={{ mb: 3, pb: 3, borderBottom: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar sx={{ bgcolor: getAvatarColor(review.user?.name) }}>
                          {getInitials(review.user?.name)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>{review.user?.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={review.rating} size="small" readOnly />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(review.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      {review.comment && (
                        <Typography color="text.secondary" sx={{ ml: 7 }}>
                          {review.comment}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">Chưa có đánh giá nào.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Sách liên quan
            </Typography>
            <BookGrid books={relatedBooks} />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default BookDetailPage;
