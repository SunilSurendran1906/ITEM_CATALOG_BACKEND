const ProductModel = require("../modules/product.Model");
const ErrorHandler = require("../utils/error.Handler");
const catchAsyncError = require("../middleware/catch.AsyncError");
const APIFeatures = require("../utils/apiFeature");

// get products GET: http://localhost:8000/api/items/products
exports.getProducts = async (req, res, next) => {
  const resPerPage = 4;

  let buildQuery = () => {
    return new APIFeatures(ProductModel.find(), req.query).search().filter();
  };
  const filteredProductsCount = await buildQuery().query.countDocuments({});

  const totalProductsCount = await ProductModel.countDocuments({});
  let productsCount = totalProductsCount;

  if (filteredProductsCount !== totalProductsCount) {
    productsCount = filteredProductsCount;
  }

  const products = await buildQuery().paginate(resPerPage).query;
  res.status(200).json({
    success: true,
    counts: productsCount,
    resPerPage,
    products,
  });
};

//  POST create new product http://localhost:8000/api/product/new
exports.newProduct = catchAsyncError(async (req, res, next) => {
  let images = [];
  let BASE_URL = process.env.BACKEND_URL;
  if (process.env.NODE_ENV === "production") {
    BASE_URL = `${req.protocol}://${req.get("host")}`;
  }
  if (req.files.length > 0) {
    req.files.forEach((file) => {
      let url = `${BASE_URL}/Uploads/product/${file.originalname}`;
      images.push({ image: url });
    });
  }
  req.body.images = images;
  req.body.user = req.user.id;
  const product = await ProductModel.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

// GET  single Product http://localhost:8000/api/product

exports.getSingleProduct = catchAsyncError(async (req, res, next) => {
  const product = await ProductModel.findById(req.params.id).populate(
    "reviews.user",
    "name email"
  );

  if (!product) {
    return next(new ErrorHandler("Product not found", 400));
  }
  // await Promise((resolve) => setTimeout(resolve, 3000));
  res.status(201).json({
    success: true,
    product,
  });
});

// PUT  Update Product http://localhost:8000/api/items/product/:id

exports.UpdateProduct = async (req, res, next) => {
  let product = await ProductModel.findById(req.params.id);
  // uploading images
  let images = [];

  // if images not cleared we keep existing images
  if (req.body.imagesCleared === "false") {
    images = product.images;
  }
  let BASE_URL = process.env.BACKEND_URL;
  if (process.env.NODE_ENV === "production") {
    BASE_URL = `${req.protocol}://${req.get("host")}`;
  }

  if (req.files.length > 0) {
    req.files.forEach((file) => {
      let url = `${BASE_URL}/Uploads/product/${file.originalname}`;
      images.push({ image: url });
    });
  }
  req.body.images = images;

  if (!product) {
    res.status(404).json({
      success: false,
      message: "Product not Found",
    });
  }
  product = await ProductModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    product,
  });
};

// delete Product DELETE http://localhost:8000/api/items/product/:id

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await ProductModel.deleteOne({ _id: product._id });

    res.status(200).json({
      success: true,
      message: "Product Deleted!",
    });
  } catch (error) {
    // Handle any errors that might occur during the deletion process
    res.status(500).json({
      success: false,
      message: "Error deleting the product",
    });
  }
};

// create reviews post:api/items/review

exports.createReview = catchAsyncError(async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  const review = {
    user: req.user.id,
    rating,
    comment,
  };

  const product = await ProductModel.findById(productId);
  //finding user review exists
  const isReviewed = product.reviews.find((review) => {
    return review.user.toString() == req.user.id.toString();
  });

  if (isReviewed) {
    //updating the  review
    product.reviews.forEach((review) => {
      if (review.user.toString() == req.user.id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    //creating the review
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  //find the average of the product reviews
  product.ratings =
    product.reviews.reduce((acc, review) => {
      return review.rating + acc;
    }, 0) / product.reviews.length;
  product.ratings = isNaN(product.ratings) ? 0 : product.ratings;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get Reviews GET:api/items/reviews?id={productId}
exports.getReviews = catchAsyncError(async (req, res, next) => {
  const product = await ProductModel.findById(req.query.id).populate(
    "reviews.user",
    "name email"
  );

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete review- api/items/review
exports.deletReview = catchAsyncError(async (req, res, next) => {
  const product = await ProductModel.findById(req.query.productId);
  // filtering the reviews which does match the deleting review id
  const reviews = product.reviews.filter((review) => {
    review._id.toString() !== req.query.id.toString();
  });
  const numOfReviews = reviews.length;
  // finding the avarage with the filter reviews
  let ratings =
    reviews.reduce((acc, review) => {
      return review.rating + acc;
    }, 0) / reviews.length;
  ratings = isNaN(ratings) ? 0 : ratings;
  // save the product document
  await ProductModel.findByIdAndUpdate(req.query.productId, {
    reviews,
    numOfReviews,
    ratings,
  });
  res.status(200).json({
    success: true,
  });
});

// get admin products-api/items/admin/products

exports.getAdminProducts = catchAsyncError(async (req, res, next) => {
  const products = await ProductModel.find();
  res.status(200).json({
    success: true,
    products,
  });
});
