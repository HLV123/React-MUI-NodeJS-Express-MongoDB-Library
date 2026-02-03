import { useNavigate } from 'react-router-dom';
import { Paper, Typography, Box, Chip } from '@mui/material';

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/categories/${category.slug}`);
  };

  return (
    <Paper
      sx={{
        p: 3,
        textAlign: 'center',
        cursor: 'pointer',
        border: '2px solid transparent',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: category.color,
          transform: 'translateY(-4px)',
          '& .category-icon': {
            transform: 'scale(1.2)',
          },
        },
      }}
      onClick={handleClick}
    >
      <Box
        className="category-icon"
        sx={{
          fontSize: 48,
          mb: 2,
          transition: 'transform 0.3s ease',
        }}
      >
        {category.icon}
      </Box>
      <Typography variant="h6" gutterBottom>
        {category.name}
      </Typography>
      <Chip
        label={`${category.bookCount || 0} sách`}
        size="small"
        sx={{
          bgcolor: `${category.color}20`,
          color: category.color,
        }}
      />
    </Paper>
  );
};

export default CategoryCard;
