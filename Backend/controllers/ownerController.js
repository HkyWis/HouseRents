const userSchema = require("../models/UserSchema");
const propertySchema = require("../models/PropertySchema");
const bookingSchema = require("../models/BookingSchema");

//////////adding property by owner////////
const addPropertyController = async (req, res) => {
  try {
    let images = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
      }));
    }

    const user = await userSchema.findById({
      _id: req.body.userId,
    });

    const lastProperty = await propertySchema
      .findOne()
      .sort({ propertyId: -1 });

    const newPropertyId = lastProperty
      ? lastProperty.propertyId + 1
      : 1;

    const newPropertyData = new propertySchema({
      ...req.body,
      propertyImage: images,
      propertyId: newPropertyId,
      ownerId: user._id,
      ownerName: user.name,
      isAvailable: "Available",
    });

    await newPropertyData.save();

    return res.status(200).send({
      success: true,
      message: "New Property has been stored",
    });

  } catch (error) {
    console.log("Error in add Property Controller ", error);

    return res.status(500).send({
      success: false,
      message: "Failed to add property",
      error,
    });
  }
};

///////////all properties of owner/////////
const getAllOwnerPropertiesController = async (req, res) => {
  const { userId } = req.body;
  try {
    const getAllProperties = await propertySchema.find();
    const updatedProperties = getAllProperties.filter(
      (property) => property.ownerId.toString() === userId
    );
    return res.status(200).send({
      success: true,
      data: updatedProperties,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};

//////delete the property by owner/////
const deletePropertyController = async (req, res) => {
  const propertyId = req.params.propertyid;
  try {
    const deletedProperty = await propertySchema.findByIdAndDelete(propertyId);

    if (deletedProperty) {
      await bookingSchema.deleteMany({ propertyId: deletedProperty.propertyId });
      await userSchema.updateMany(
        {
          favorites: propertyId,
        },
        {
          $pull: {
            favorites: propertyId,
          },
        }
      );
    }

    return res.status(200).send({
      success: true,
      message: "The property is deleted",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};

//////updating the property/////////////
const updatePropertyController = async (req, res) => {
  const { propertyid } = req.params;

  try {
    const updateData = {
      ...req.body,
      ownerId: req.body.userId,
    };

    if (updateData.propertyAmt > 0) {
      updateData.isAvailable = "Available";
    } else {
      updateData.isAvailable = "Unavailable";
    }

    let finalImages = [];
    if (req.body.existingImages) {
      try {
        if (Array.isArray(req.body.existingImages)) {
          finalImages = JSON.parse(
            req.body.existingImages[
            req.body.existingImages.length - 1
            ]
          );
        } else {
          finalImages = JSON.parse(
            req.body.existingImages
          );
        }
      } catch (e) {
        console.error("Failed to parse existingImages");
      }
    }
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
      }));
      finalImages = [...finalImages, ...newImages];
    }

    if (req.body.existingImages !== undefined) {
      updateData.propertyImage = finalImages;
    }

    await propertySchema.findByIdAndUpdate(
      propertyid,
      updateData,
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: "Property updated successfully.",
    });
  } catch (error) {
    console.error("Error updating property:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update property.",
    });
  }
};

const getAllBookingsController = async (req, res) => {
  const { userId } = req.body;
  try {
    const getAllBookings = await bookingSchema.find();
    const updatedBookings = getAllBookings.filter(
      (booking) => booking.ownerID.toString() === userId
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

//////////handle bookings status//////////////
const handleAllBookingstatusController = async (req, res) => {
  const { bookingId, propertyId, status } = req.body;
  try {
    const property = await propertySchema.findOne({ propertyId: propertyId });
    const booking = await bookingSchema.findById(bookingId);

    if (!property || !booking) {
      return res.status(404).send({ message: "Property or Booking not found", success: false });
    }

    if (booking.bookingStatus === 'pending' && status === 'booked' && property.propertyAmt <= 0) {
      return res.status(400).send({
        success: false,
        message: "Cannot mark as booked, property amount is out of stock",
      });
    }

    const oldStatus = booking.bookingStatus;

    booking.bookingStatus = status;
    await booking.save();

    let newAmt = property.propertyAmt;

    if (oldStatus === 'pending' && status === 'booked') {
      newAmt = Math.max(0, newAmt - 1);
    } else if (oldStatus === 'booked' && status === 'pending') {
      newAmt += 1;
    }

    property.propertyAmt = newAmt;
    property.isAvailable = newAmt > 0 ? 'Available' : 'Unavailable';
    await property.save();

    return res.status(200).send({
      success: true,
      message: `changed the status of property to ${status}`,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};

module.exports = {
  addPropertyController,
  getAllOwnerPropertiesController,
  deletePropertyController,
  updatePropertyController,
  getAllBookingsController,
  handleAllBookingstatusController,
};
