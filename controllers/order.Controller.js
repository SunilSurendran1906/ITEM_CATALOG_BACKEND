const catchAsyncError = require("../middleware/catch.AsyncError");
const orderModel = require("../modules/order.Model");
const ErrorHandler = require("../utils/error.Handler");
const ProductModel = require("../modules/product.Model");

// Create new orders - api/items/order/new
exports.newOrder = catchAsyncError(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;
  const order = await orderModel.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user.id,
  });
  res.status(201).json({
    success: true,
    message: "order placed successfully",
    order,
  });
});

// Get single Order-api/v1/order/:id

exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await orderModel
    .findById(req.params.id)
    .populate("user", "name email");
  if (!order) {
    return next(
      new ErrorHandler(`Order not found with this id:${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    order,
  });
});

// get loggedin user order - api/v1/myorders

exports.myOrder = catchAsyncError(async (req, res, next) => {
  const orders = await orderModel.find({ user: req.user.id });
  res.status(201).json({
    success: true,
    orders,
  });
});

// Admin :get all Orders- api/v1/order
exports.orders = catchAsyncError(async (req, res, next) => {
  const orders = await orderModel.find();

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(201).json({
    success: true,
    totalAmount,
    orders,
  });
});

//Admin: Update order /Order Status PUT:api/v1/order/:id
exports.updateOrder = catchAsyncError(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);
  if (order.orderStatus == "Delivered") {
    return next(new ErrorHandler("order has been already delivered"));
  }
  // updating the product stock of each order item
  order.orderItems.forEach(async (orderItem) => {
    await updateStack(orderItem.product, orderItem.quantity);
  });
  order.orderStatus = req.body.orderStatus;
  order.deliveredAt = Date.now();
  await order.save();
  res.status(201).json({
    success: true,
  });
});

async function updateStack(productId, quantity) {
  const product = await ProductModel.findById(productId);
  product.stock = product.stock - quantity;
  product.save({ validateBeforeSave: false });
}

// Admin delete order delete:api/v1/order/:id

exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);
  if (!order) {
    return next(
      new ErrorHandler(`Order not found with this id:${req.params.id}`, 404)
    );
  }
  await order.deleteOne({ _id: order._id });
  res.status(201).json({
    success: true,
    message: "Successfully removed",
  });
});
