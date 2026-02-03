import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer = () => {
  const footerLinks = {
    explore: [
      { name: 'Sách mới', path: '/books?sort=-createdAt' },
      { name: 'Sách nổi bật', path: '/books?featured=true' },
      { name: 'Phổ biến nhất', path: '/books?sort=-borrowCount' },
    ],
    categories: [
      { name: 'Văn học', path: '/categories/van-hoc' },
      { name: 'Khoa học', path: '/categories/khoa-hoc' },
      { name: 'Công nghệ', path: '/categories/cong-nghe' },
      { name: 'Kinh tế', path: '/categories/kinh-te' },
    ],
    support: [
      { name: 'Trung tâm trợ giúp', path: '/help' },
      { name: 'Liên hệ', path: '/contact' },
      { name: 'Điều khoản sử dụng', path: '/terms' },
      { name: 'Chính sách bảo mật', path: '/privacy' },
    ],
  };

  return (
    <Box sx={{ bgcolor: '#1a1a2e', color: 'white', pt: 8, pb: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 45,
                  height: 45,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                📚
              </Box>
              <Typography variant="h5" fontWeight={700}>
                Saparethere
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.6)', mb: 3, maxWidth: 300 }}
            >
              Thư viện số hiện đại, mang tri thức đến gần hơn với mọi người. 
              Mượn sách online, nhận sách tận nơi.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[FacebookIcon, TwitterIcon, InstagramIcon, YouTubeIcon].map(
                (Icon, index) => (
                  <IconButton
                    key={index}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.main' },
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                )
              )}
            </Box>
          </Grid>

          {/* Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Khám phá
            </Typography>
            {footerLinks.explore.map((link) => (
              <Link
                key={link.name}
                component={RouterLink}
                to={link.path}
                sx={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  mb: 1,
                  '&:hover': { color: 'white' },
                }}
              >
                {link.name}
              </Link>
            ))}
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Thể loại
            </Typography>
            {footerLinks.categories.map((link) => (
              <Link
                key={link.name}
                component={RouterLink}
                to={link.path}
                sx={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  mb: 1,
                  '&:hover': { color: 'white' },
                }}
              >
                {link.name}
              </Link>
            ))}
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Hỗ trợ
            </Typography>
            {footerLinks.support.map((link) => (
              <Link
                key={link.name}
                component={RouterLink}
                to={link.path}
                sx={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  mb: 1,
                  '&:hover': { color: 'white' },
                }}
              >
                {link.name}
              </Link>
            ))}
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Liên hệ
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}
            >
              📧 contact@saparethere.com
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}
            >
              📱 +84 123 456 789
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.6)' }}
            >
              📍 TP. Hồ Chí Minh, Việt Nam
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            © 2025 Saparethere Library. Made with ❤️ in Vietnam
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {['Điều khoản', 'Bảo mật', 'Cookie'].map((item) => (
              <Link
                key={item}
                href="#"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  '&:hover': { color: 'white' },
                }}
              >
                {item}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
