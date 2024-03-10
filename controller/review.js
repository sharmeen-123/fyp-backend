const Review = require("../models/review");

const ReviewController = {
  // addReview api
  async addReview(req, res) {
    let ReviewData = req.body;
    try {
      let review = new Review(ReviewData);

      // Save the Review to the database
      review.save((error, addNewReview) => {
        // Handling potential errors
        if (error) {
          return res.status(500).send({
            success: false,
            error: error.message,
          });
        }
        // If the review is saved successfully
        res.status(200).send({
          success: true,
          message: "new review added successfully",
          _id: addNewReview._id,
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

  // ......................... add review images ....................................

  // add images
  async uploadImages(req, res, next) {
    const reviewId = req.params.id;

    try {
      // Access the uploaded files as an array
      const fileBuffers = req.files
        ? req.files.map((file) => file.filename)
        : [];
      console.log(req.files);
      if (!reviewId) {
        return res.status(404).send({
          error: "review id cannot be empty",
          success: false,
        });
      }

      const review = await Review.findById({ _id: reviewId });

      if (!review) {
        return res.status(404).send({
          error: "Review not found",
          success: false,
        });
      }

      if (review.images.length === 0) {
        // If the images3D array is empty, set it to fileBuffers
        review.images = fileBuffers;
      } else {
        // If the images3D array is not empty, push fileBuffers into it
        review.images.push(...fileBuffers);
      }

      const upload = await Review.findOneAndUpdate(
        { _id: reviewId },
        { photos: review.images },
        { new: true } // Return the updated document
      );

      if (!upload) {
        return res.status(404).send({
          error: "review not found",
          success: false,
        });
      }

      res.status(200).json({
        data: upload,
        success: true,
      });
    } catch (error) {
      console.error(error);
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

  // .......................................get Review api.........................................
  async getReview(req, res) {
    try {
      let { product } = req.body;

      // Find if the Review already exists
      const ReviewExists = await Review.find({
        product,
      });

      if (ReviewExists.length > 0) {
        let stars = {
          fiveStar: 0,
          fourStar: 0,
          threeStar: 0,
          twoStar: 0,
          oneStar: 0,
        };
        ReviewExists.map((val, ind) => {
          if (val.rating == 5) {
            stars.fiveStar += 1;
          } else if (val.rating == 4) {
            stars.fourStar += 1;
          } else if (val.rating == 3) {
            stars.threeStar += 1;
          } else if (val.rating == 2) {
            stars.twoStar += 1;
          } else if (val.rating == 1) {
            stars.oneStar += 1;
          }
        });
        return res.status(200).send({
          success: true,
          message: "Review Found",
          starCount: stars,
          data: ReviewExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Review with this id do not exists",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },
};

module.exports = ReviewController;
