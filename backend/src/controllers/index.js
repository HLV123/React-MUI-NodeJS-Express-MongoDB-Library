const authController = require('./authController');
const userController = require('./userController');
const bookController = require('./bookController');
const categoryController = require('./categoryController');
const borrowController = require('./borrowController');
const cartController = require('./cartController');
const reviewController = require('./reviewController');
const notificationController = require('./notificationController');
const statsController = require('./statsController');

module.exports = {
  authController,
  userController,
  bookController,
  categoryController,
  borrowController,
  cartController,
  reviewController,
  notificationController,
  statsController
};
