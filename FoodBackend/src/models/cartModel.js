const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, // Reference to the user who owns the cart
    ref: 'User',
    required: true
  },
  items: [{
    shopId: {
      type: Schema.Types.ObjectId, // Reference to the shop selling the product
      ref: 'Shop',
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId, // Reference to the product
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number, // Store the price of a single product at the time of adding it to the cart
      required: true
    }
  }],
  totalQty: {
    type: Number, // Store the total quantity of products in the cart
    required: true,
    default: 0
  },
  totalCost: {
    type: Number, // Store the total price of all products in the cart
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
},{timestamps:true});

// Pre-save hook to automatically calculate total quantity and price
cartSchema.pre('save', function(next) {
  const cart = this;

  let totalQty = 0;
  let totalCost = 0;

  // Iterate over items to calculate the total quantity and total price
  cart.items.forEach(item => {
    totalQty += item.quantity;
    totalCost += item.price * item.quantity;
  });

  cart.totalQty = totalQty;   // Update total quantity in the cart
  cart.totalCost = totalCost; // Update total cost in the cart

  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export  default Cart;
