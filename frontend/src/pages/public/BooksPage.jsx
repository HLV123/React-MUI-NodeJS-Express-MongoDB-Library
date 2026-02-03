import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Chip,
  Paper,
} from '@mui/material';
import { bookService, categoryService } from '../../services';
import { BookGrid } from '../../components/books';
import { Loading, SearchBar } from '../../components/common';

const BooksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || '-createdAt';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 12,
          sort: currentSort,
        };
        
        if (currentCategory) params.category = currentCategory;
        
        let response;
        if (searchQuery) {
          response = await bookService.searchBooks(searchQuery, params);
        } else {
          response = await bookService.getBooks(params);
        }
        
        setBooks(response.data || []);
        setPagination(response.pagination || { page: 1, totalPages: 1, total: 0 });
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [currentPage, currentCategory, currentSort, searchQuery]);

  const handlePageChange = (event, page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (event) => {
    const params = new URLSearchParams(searchParams);
    if (event.target.value) {
      params.set('category', event.target.value);
    } else {
      params.delete('category');
    }
    params.set('page', 1);
    setSearchParams(params);
  };

  const handleSortChange = (event) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', event.target.value);
    params.set('page', 1);
    setSearchParams(params);
  };

  const handleSearch = (query) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    params.set('page', 1);
    setSearchParams(params);
  };

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : 'Khám phá sách'}
          </Typography>
          <Typography color="text.secondary">
            {pagination.total} sách được tìm thấy
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <SearchBar
                placeholder="Tìm kiếm sách, tác giả..."
                onSearch={handleSearch}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Thể loại</InputLabel>
                <Select
                  value={currentCategory}
                  label="Thể loại"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={currentSort}
                  label="Sắp xếp"
                  onChange={handleSortChange}
                >
                  <MenuItem value="-createdAt">Mới nhất</MenuItem>
                  <MenuItem value="-rating">Đánh giá cao</MenuItem>
                  <MenuItem value="-borrowCount">Phổ biến nhất</MenuItem>
                  <MenuItem value="title">Tên A-Z</MenuItem>
                  <MenuItem value="-title">Tên Z-A</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {(currentCategory || searchQuery) && (
              <Grid item xs={12} md={2}>
                <Chip
                  label="Xóa bộ lọc"
                  onDelete={() => setSearchParams({})}
                  color="primary"
                  variant="outlined"
                />
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Books Grid */}
        {loading ? (
          <Loading />
        ) : (
          <>
            <BookGrid books={books} />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default BooksPage;
