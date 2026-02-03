const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for item count
cartSchema.virtual('itemCount').get(function () {
  return this.items.length;
});

// Index
cartSchema.index({ user: 1 });

// Method to add book to cart
cartSchema.methods.addBook = function (bookId) {
  const existingItem = this.items.find(
    item => item.book.toString() === bookId.toString()
  );
  
  if (!existingItem) {
    this.items.push({ book: bookId });
  }
  
  return this;
};

// Method to remove book from cart
cartSchema.methods.removeBook = function (bookId) {
  this.items = this.items.filter(
    item => item.book.toString() !== bookId.toString()
  );
  return this;
};

// Method to clear cart
cartSchema.methods.clearCart = function () {
  this.items = [];
  return this;
};

// Method to check if book is in cart
cartSchema.methods.hasBook = function (bookId) {
  return this.items.some(
    item => item.book.toString() === bookId.toString()
  );
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
