import { Grid } from '@mui/material';
import BookCard from './BookCard';
import { EmptyState } from '../common';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const BookGrid = ({ books, onFavoriteToggle, emptyMessage = 'Không tìm thấy sách nào' }) => {
  if (!books || books.length === 0) {
    return (
      <EmptyState
        icon={MenuBookIcon}
        title={emptyMessage}
        description="Thử tìm kiếm với từ khóa khác hoặc khám phá các danh mục sách"
      />
    );
  }

  return (
    <Grid container spacing={3}>
      {books.map((book) => (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={book._id}>
          <BookCard book={book} onFavoriteToggle={onFavoriteToggle} />
        </Grid>
      ))}
    </Grid>
  );
};

export default BookGrid;
