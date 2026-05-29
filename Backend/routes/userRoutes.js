const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { registerController, loginController, forgotPasswordController, getAllPropertiesController, getPropertyController, authController, bookingHandleController, getAllBookingsController, toggleFavoriteController, getFavoritesController } = require("../controllers/userController");


const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/forgotpassword", forgotPasswordController);

router.get('/getAllProperties', getAllPropertiesController)

router.get('/getproperty/:id', getPropertyController)

router.post("/getuserdata", authMiddleware, authController);

router.post("/bookinghandle/:propertyid", authMiddleware, bookingHandleController);

router.get('/getallbookings', authMiddleware, getAllBookingsController)

router.post("/togglefavorite/:propertyid", authMiddleware, toggleFavoriteController);

router.get("/getfavorites", authMiddleware, getFavoritesController);

module.exports = router;