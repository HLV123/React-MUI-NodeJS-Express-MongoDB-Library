import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Rating,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { bookService, categoryService } from '../../services';
import { BookCard, CategoryCard } from '../../components/books';
import { Loading } from '../../components/common';

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes, catRes] = await Promise.all([
          bookService.getFeaturedBooks(6),
          bookService.getNewArrivals(6),
          categoryService.getCategories(),
        ]);
        setFeaturedBooks(featuredRes.data.books || []);
        setNewArrivals(newRes.data.books || []);
        setCategories(catRes.data.categories || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { value: '50,000+', label: 'Đầu sách', icon: '📖' },
    { value: '15,000+', label: 'Độc giả', icon: '👥' },
    { value: '100,000+', label: 'Lượt mượn', icon: '📊' },
    { value: '99.5%', label: 'Hài lòng', icon: '⭐' },
  ];

  const steps = [
    { icon: <PersonAddIcon sx={{ fontSize: 36 }} />, title: 'Đăng ký tài khoản', description: 'Tạo tài khoản miễn phí chỉ với email.' },
    { icon: <SearchIcon sx={{ fontSize: 36 }} />, title: 'Tìm sách yêu thích', description: 'Khám phá kho sách khổng lồ.' },
    { icon: <ShoppingCartIcon sx={{ fontSize: 36 }} />, title: 'Đặt mượn online', description: 'Thêm sách vào giỏ và mượn.' },
    { icon: <LocalShippingIcon sx={{ fontSize: 36 }} />, title: 'Nhận sách tận nơi', description: 'Giao sách trong 24-48 giờ.' },
  ];

  if (loading) return <Loading fullScreen />;

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ minHeight: '90vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(118,75,162,0.3) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="🎉 Miễn phí đăng ký" sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', py: 2.5 }} />
              <Typography variant="h2" sx={{ color: 'white', fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1, mb: 3 }}>
                Thư viện số
                <Box component="span" sx={{ display: 'block', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Saparethere
                </Box>
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400, mb: 4, lineHeight: 1.6 }}>
                Khám phá hơn 50,000 đầu sách từ khắp nơi trên thế giới. Mượn sách online dễ dàng, nhận sách tận nơi trong 24h.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 5, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/books')} sx={{ py: 1.5, px: 4 }}>
                  Bắt đầu khám phá
                </Button>
                <Button variant="outlined" size="large" startIcon={<PlayCircleIcon />} sx={{ py: 1.5, px: 4, borderColor: 'rgba(255,255,255,0.3)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  Xem hướng dẫn
                </Button>
              </Box>
              <Grid container spacing={4}>
                {stats.map((stat, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>{stat.value}</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{stat.icon} {stat.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative', width: 320, height: 420 }}>
                  {featuredBooks.slice(0, 3).map((book, index) => (
                    <Card key={book._id} sx={{ position: 'absolute', width: 220, left: index * 40, top: index * 25, zIndex: 3 - index, transform: `rotate(${-5 + index * 5}deg)`, boxShadow: 6 }}>
                      <CardMedia component="img" height="260" image={book.coverImage} alt={book.title} />
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>{book.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{book.author}</Typography>
                        <Rating value={book.rating} size="small" readOnly precision={0.1} sx={{ display: 'block', mt: 0.5 }} />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Categories Section */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip label="DANH MỤC" sx={{ mb: 2 }} color="primary" variant="outlined" />
            <Typography variant="h3" gutterBottom fontWeight={700}>Khám phá theo thể loại</Typography>
          </Box>
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={6} sm={4} md={3} key={category._id}>
                <CategoryCard category={category} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Books Section */}
      <Box sx={{ py: 10, background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Box>
              <Chip label="NỔI BẬT" sx={{ mb: 2 }} color="secondary" variant="outlined" />
              <Typography variant="h3" fontWeight={700}>Sách được yêu thích</Typography>
            </Box>
            <Button component={RouterLink} to="/books?featured=true" endIcon={<ArrowForwardIcon />}>Xem tất cả</Button>
          </Box>
          <Grid container spacing={3}>
            {featuredBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={book._id}>
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: 10, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8, color: 'white' }}>
            <Chip label="QUY TRÌNH" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} />
            <Typography variant="h3" gutterBottom fontWeight={700}>Mượn sách trong 4 bước</Typography>
          </Box>
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, color: 'white', position: 'relative' }}>
                    {step.icon}
                    <Box sx={{ position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: '50%', bgcolor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'white' }}>{index + 1}</Box>
                  </Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>{step.title}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>{step.description}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* New Arrivals */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Box>
              <Chip label="MỚI VỀ" sx={{ mb: 2 }} color="error" variant="outlined" />
              <Typography variant="h3" fontWeight={700}>Sách mới nhất</Typography>
            </Box>
            <Button component={RouterLink} to="/books?sort=-createdAt" endIcon={<ArrowForwardIcon />}>Xem tất cả</Button>
          </Box>
          <Grid container spacing={3}>
            {newArrivals.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={book._id}>
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>Sẵn sàng khám phá?</Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>Đăng ký ngay để bắt đầu mượn sách</Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/register')} sx={{ bgcolor: 'white', color: 'primary.main', px: 6, py: 1.5, '&:hover': { bgcolor: 'grey.100' } }}>
            Đăng ký miễn phí
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
