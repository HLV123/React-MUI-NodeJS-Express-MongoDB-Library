const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = require('../config');
const { User, Category, Book, Borrow, Review, Notification, Cart } = require('../models');

// Load seed data
const usersData = require('./data/users.json');
const categoriesData = require('./data/categories.json');
const booksData = require('./data/books.json');

// Check for --fresh flag
console.log('📋 Command arguments:', process.argv);
const isFresh = process.argv.includes('--fresh');
console.log('🔄 Fresh mode:', isFresh);

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB');

    if (isFresh) {
      console.log('🗑️  Clearing existing data (--fresh mode)...');
      await Promise.all([
        User.deleteMany({}),
        Category.deleteMany({}),
        Book.deleteMany({}),
        Borrow.deleteMany({}),
        Review.deleteMany({}),
        Notification.deleteMany({}),
        Cart.deleteMany({})
      ]);
      console.log('✅ All collections cleared');
    }

    // Check if data already exists
    const existingUsers = await User.countDocuments();
    const existingCategories = await Category.countDocuments();
    const existingBooks = await Book.countDocuments();

    if (existingUsers > 0 || existingCategories > 0 || existingBooks > 0) {
      console.log('⚠️  Database already has data. Use --fresh to clear and reseed.');
      console.log(`   Users: ${existingUsers}, Categories: ${existingCategories}, Books: ${existingBooks}`);
      
      if (!isFresh) {
        console.log('Exiting without changes. Run with --fresh to force reseed.');
        process.exit(0);
      }
    }

    // ============================================
    // SEED USERS
    // ============================================
    console.log('\n📝 Seeding users...');
    const users = [];
    
    for (const userData of usersData) {
      // Password will be hashed by the pre-save hook
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`   ✓ Created user: ${user.email} (${user.role})`);
    }
    console.log(`✅ Created ${users.length} users`);

    // ============================================
    // SEED CATEGORIES
    // ============================================
    console.log('\n📝 Seeding categories...');
    const categories = [];
    const categoryMap = {}; // Map category name to _id
    
    for (const categoryData of categoriesData) {
      const category = new Category(categoryData);
      await category.save();
      categories.push(category);
      categoryMap[category.name] = category._id;
      console.log(`   ✓ Created category: ${category.name} (${category.icon})`);
    }
    console.log(`✅ Created ${categories.length} categories`);

    // ============================================
    // SEED BOOKS
    // ============================================
    console.log('\n📝 Seeding books...');
    const books = [];
    
    for (const bookData of booksData) {
      const { categoryName, ...bookFields } = bookData;
      
      // Get category ID from name
      const categoryId = categoryMap[categoryName];
      if (!categoryId) {
        console.log(`   ⚠️ Category not found: ${categoryName}, skipping book: ${bookFields.title}`);
        continue;
      }
      
      const book = new Book({
        ...bookFields,
        category: categoryId
      });
      await book.save();
      books.push(book);
      console.log(`   ✓ Created book: ${book.title}`);
    }
    console.log(`✅ Created ${books.length} books`);

    // ============================================
    // SEED SAMPLE BORROWS
    // ============================================
    console.log('\n📝 Seeding sample borrows...');
    
    // Get regular users (not admin)
    const regularUsers = users.filter(u => u.role === 'user');
    const bonsUser = users.find(u => u.email === 'bons@gmail.com');
    
    const borrowsData = [
      // User Bons - đang mượn
      {
        user: regularUsers[0]._id,
        book: books[0]._id, // Đắc Nhân Tâm
        status: 'borrowed',
        borrowDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        user: regularUsers[0]._id,
        book: books[3]._id, // Clean Code
        status: 'borrowed',
        borrowDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      },
      {
        user: regularUsers[0]._id,
        book: books[5]._id, // Atomic Habits
        status: 'borrowed',
        borrowDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      },
      // User Bons - đã trả
      {
        user: regularUsers[0]._id,
        book: books[2]._id, // Sapiens
        status: 'returned',
        borrowDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        returnDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },
      // User Mai - đang mượn
      {
        user: regularUsers[1]._id,
        book: books[1]._id, // Nhà Giả Kim
        status: 'borrowed',
        borrowDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      },
      // User Mai - quá hạn
      {
        user: regularUsers[1]._id,
        book: books[8]._id, // 1984
        status: 'overdue',
        borrowDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      // Other users
      {
        user: regularUsers[2]._id,
        book: books[13]._id, // Cha Giàu Cha Nghèo
        status: 'borrowed',
        borrowDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        user: regularUsers[3]._id,
        book: books[20]._id, // Harry Potter
        status: 'returned',
        borrowDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        returnDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const borrowData of borrowsData) {
      const borrow = new Borrow(borrowData);
      await borrow.save();
      console.log(`   ✓ Created borrow: ${borrow.borrowCode || borrow._id} (${borrow.status})`);
      
      // Update book availableCopies if borrowed
      if (borrowData.status === 'borrowed' || borrowData.status === 'overdue') {
        await Book.findByIdAndUpdate(borrowData.book, {
          $inc: { availableCopies: -1, borrowCount: 1 }
        });
      } else if (borrowData.status === 'returned') {
        await Book.findByIdAndUpdate(borrowData.book, {
          $inc: { borrowCount: 1 }
        });
      }
    }
    console.log(`✅ Created ${borrowsData.length} sample borrows`);

    // ============================================
    // SEED SAMPLE REVIEWS
    // ============================================
    console.log('\n📝 Seeding sample reviews...');
    
    const reviewsData = [
      {
        user: regularUsers[0]._id,
        book: books[0]._id, // Đắc Nhân Tâm
        rating: 5,
        comment: 'Cuốn sách tuyệt vời! Đã thay đổi cách tôi giao tiếp với mọi người xung quanh. Highly recommended!',
      },
      {
        user: regularUsers[1]._id,
        book: books[0]._id,
        rating: 5,
        comment: 'Sách kinh điển, ai cũng nên đọc ít nhất một lần trong đời.',
      },
      {
        user: regularUsers[0]._id,
        book: books[1]._id, // Nhà Giả Kim
        rating: 5,
        comment: 'Câu chuyện đẹp và đầy triết lý. Đọc đi đọc lại vẫn thấy hay.',
      },
      {
        user: regularUsers[2]._id,
        book: books[1]._id,
        rating: 4,
        comment: 'Truyện hay nhưng hơi ngắn, muốn đọc thêm về hành trình của Santiago.',
      },
      {
        user: regularUsers[0]._id,
        book: books[3]._id, // Clean Code
        rating: 5,
        comment: 'Must-read cho mọi developer. Code của tôi đã cải thiện rất nhiều sau khi đọc.',
      },
      {
        user: regularUsers[3]._id,
        book: books[3]._id,
        rating: 4,
        comment: 'Sách hay nhưng một số ví dụ hơi cũ. Vẫn rất bổ ích cho việc viết code sạch.',
      },
      {
        user: regularUsers[1]._id,
        book: books[5]._id, // Atomic Habits
        rating: 5,
        comment: 'Thay đổi hoàn toàn cách tôi xây dựng thói quen. Practical và dễ áp dụng!',
      },
      {
        user: regularUsers[2]._id,
        book: books[13]._id, // Cha Giàu Cha Nghèo
        rating: 5,
        comment: 'Mở mang tư duy về tài chính. Đọc từ khi còn trẻ sẽ rất có lợi.',
      },
    ];

    for (const reviewData of reviewsData) {
      const review = new Review(reviewData);
      await review.save();
      
      // Update book rating
      const bookReviews = await Review.find({ book: reviewData.book });
      const avgRating = bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
      await Book.findByIdAndUpdate(reviewData.book, {
        averageRating: avgRating,
        reviewCount: bookReviews.length
      });
    }
    console.log(`✅ Created ${reviewsData.length} sample reviews`);

    // ============================================
    // SEED SAMPLE NOTIFICATIONS
    // ============================================
    console.log('\n📝 Seeding sample notifications...');
    
    const notificationsData = [
      {
        user: regularUsers[0]._id,
        type: 'borrow_confirmed',
        title: 'Mượn sách thành công',
        message: 'Bạn đã mượn thành công sách "Đắc Nhân Tâm". Hạn trả: 7 ngày nữa.',
        isRead: true
      },
      {
        user: regularUsers[0]._id,
        type: 'borrow_reminder',
        title: 'Nhắc nhở trả sách',
        message: 'Sách "Clean Code" sẽ đến hạn trả trong 2 ngày. Vui lòng trả đúng hạn.',
        isRead: false
      },
      {
        user: regularUsers[0]._id,
        type: 'points_earned',
        title: 'Nhận điểm thưởng',
        message: 'Bạn đã nhận được 50 điểm thưởng cho việc trả sách đúng hạn!',
        isRead: false
      },
      {
        user: regularUsers[1]._id,
        type: 'borrow_overdue',
        title: 'Sách quá hạn',
        message: 'Sách "1984" đã quá hạn trả 6 ngày. Vui lòng trả sách sớm nhất có thể.',
        isRead: false
      },
    ];

    for (const notificationData of notificationsData) {
      const notification = new Notification(notificationData);
      await notification.save();
    }
    console.log(`✅ Created ${notificationsData.length} sample notifications`);

    // ============================================
    // SEED SAMPLE CART
    // ============================================
    console.log('\n📝 Seeding sample cart...');
    
    if (bonsUser && books.length > 5) {
      const cart = new Cart({
        user: bonsUser._id,
        items: [
          { book: books[6]._id }, // Đời Ngắn Đừng Ngủ Dài
          { book: books[12]._id }, // Người Giàu Có Nhất Thành Babylon
          { book: books[15]._id }  // Lược Sử Thời Gian
        ]
      });
      await cart.save();
      console.log(`✅ Created sample cart with ${cart.items.length} items`);
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n========================================');
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Books: ${books.length}`);
    console.log(`   - Borrows: ${borrowsData.length}`);
    console.log(`   - Reviews: ${reviewsData.length}`);
    console.log(`   - Notifications: ${notificationsData.length}`);
    console.log('\n📌 Test Accounts:');
    console.log('   Admin: admin@saparethere.com / admin123456');
    console.log('   User:  bons@gmail.com / user123456');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();