const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = require("../models/UserSchema");
const propertySchema = require("../models/PropertySchema");
const bookingSchema = require("../models/BookingSchema");

//////////for registering/////////////////////////////
const registerController = async (req, res) => {
  try {
    const { name, email, password, type } = req.body;
    let granted = "";


    // VALIDATION
    if (!name || !email || !password || !type) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    if (!email.includes("@gmail.com")) {
      return res.status(400).send({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 4) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 4 characters",
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).send({
        success: false,
        message: "Password must contain uppercase letter",
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).send({
        success: false,
        message: "Password must contain lowercase letter",
      });
    }

    if (!/[\W_]/.test(password)) {
      return res.status(400).send({
        success: false,
        message: "Password must contain symbol",
      });
    }

    // CHECK USER
    const existsUser = await userSchema.findOne({ email });
    if (existsUser) {
      return res.status(400).send({
        success: false,
        message: "User already exists",
      });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserData = {
      name,
      email,
      password: hashedPassword,
      type,
    };

    if (type === "Owner") {
      newUserData.granted = "ungranted";
    }

    const newUser = new userSchema(newUserData);

    await newUser.save();

    return res.status(201).send({
      success: true,
      message:
        type === "Owner"
          ? "Register success. Waiting admin approval."
          : "Register success",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

////for the login
const loginController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email });
    const email = req.body.email;
    const password = req.body.password;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      return res
        .status(200)
        .send({ message: "Required email or password", success: false });
    }

    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    const test = await bcrypt.compare(String(ADMIN_PASSWORD), user.password);
    console.log("TEST COMPARE:", test);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid email or password", success: false });
    }

    if (user.type === "Owner" && user.granted === "ungranted") {
      return res.status(403).send({
        success: false,
        message:
          "Your owner account has not been approved by admin yet.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });

    user.password = undefined;

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    })
    return res.status(200).send({
      message: "Login success successfully",
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

/////forgotting password
const forgotPasswordController = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // VALIDATION
    if (!email || !password || !confirmPassword) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    if (!email.includes("@gmail.com")) {
      return res.status(400).send({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).send({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 4) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 4 characters",
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).send({
        success: false,
        message: "Password must contain uppercase letter",
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).send({
        success: false,
        message: "Password must contain lowercase letter",
      });
    }

    if (!/[\W_]/.test(password)) {
      return res.status(400).send({
        success: false,
        message: "Password must contain symbol",
      });
    }

    // CHECK USER
    const user = await userSchema.findOne({ email });

    if (!user || user.type === "Admin") {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

////auth controller
const authController = async (req, res) => {
  console.log(req.body);
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    console.log(user);
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    } else {
      return res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "auth error", success: false, error });
  }
};
/////////get all properties in home
const getAllPropertiesController = async (req, res) => {
  try {
    const allProperties = await propertySchema.find({});
    if (!allProperties) {
      throw new Error("No properties available");
    } else {
      res.status(200).send({ success: true, data: allProperties });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "auth error", success: false, error });
  }
};

///////////booking handle///////////////
const bookingHandleController = async (req, res) => {
  const { propertyid } = req.params;
  const { userDetails, status, userId, ownerId } = req.body;

  const property = await propertySchema.findById(
    propertyid
  );

  if (!property) {
    return res.status(404).send({
      success: false,
      message: "Property not found",
    });
  }

  if (property.propertyAmt <= 0) {
    return res.status(400).send({
      success: false,
      message: "Property is sold out or unavailable",
    });
  }

  const existingBooking = await bookingSchema.findOne({
    propertyId: property.propertyId,
    userID: userId,
  });

  if (existingBooking) {
    return res.status(400).send({
      success: false,
      message: "You have already booked this property",
    });
  }

  try {
    const booking = new bookingSchema({
      propertyId: property.propertyId,
      userID: userId,
      ownerID: ownerId,
      userName: userDetails.fullName,
      phone: userDetails.phone,
      bookingStatus: status,
    });

    await booking.save();

    return res
      .status(200)
      .send({ success: true, message: "Booking status updated" });
  } catch (error) {
    console.error("Error handling booking:", error);
    return res
      .status(500)
      .send({ success: false, message: "Error handling booking" });
  }
};

/////get all bookings for sing tenents//////
const getAllBookingsController = async (req, res) => {
  const { userId } = req.body;
  try {
    const getAllBookings = await bookingSchema.find();
    const updatedBookings = getAllBookings.filter(
      (booking) => booking.userID.toString() === userId
    );
    return res.status(200).send({
      success: true,
      data: updatedBookings,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};

///// get single property by id /////
const getPropertyController = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await propertySchema.findById(id);
    if (!property) {
      return res.status(404).send({ success: false, message: "Property not found" });
    }
    return res.status(200).send({ success: true, data: property });
  } catch (error) {
    console.error("Error fetching property details:", error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};

///// toggle favorite property /////
const toggleFavoriteController = async (req, res) => {
  try {
    const { propertyid } = req.params;
    const { userId } = req.body;

    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    const isFavorite = user.favorites?.includes(propertyid);
    if (isFavorite) {
      user.favorites = user.favorites.filter((id) => id.toString() !== propertyid);
    } else {
      user.favorites = user.favorites || [];
      user.favorites.push(propertyid);
    }

    await user.save();
    return res.status(200).send({
      success: true,
      message: isFavorite ? "Removed from favorites" : "Added to favorites",
      favorites: user.favorites
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};

///// get favorites properties /////
const getFavoritesController = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userSchema.findById(userId).populate("favorites");
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }
    return res.status(200).send({ success: true, data: user.favorites });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  registerController,
  loginController,
  forgotPasswordController,
  authController,
  getAllPropertiesController,
  getPropertyController,
  bookingHandleController,
  getAllBookingsController,
  toggleFavoriteController,
  getFavoritesController,
};
