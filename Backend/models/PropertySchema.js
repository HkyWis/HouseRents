const mongoose = require('mongoose')

const propertyModel = mongoose.Schema({
   ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
   },
   propertyId: {
      type: Number,
      unique: true,
   },
   propertyType: {
      type: String,
      required: [true, 'Please provide a Property Type']
   },
   propertyAdType: {
      type: String,
      required: [true, 'Please provide a Property Ad Type']
   },
   propertyAddress: {
      type: String,
      required: [true, "Please Provide an Address"]
   },
   ownerContact: {
      type: String,
      required: [true, 'Please provide owner contact']
   },
   propertyPrice: {
      type: Number,
      default: 0,
   },
   propertyAmt: {
      type: Number,
      default: 0,
   },
   propertyImage: {
      type: Object,
      required: [true, "Please provide a property image"]
   },
   additionalInfo: {
      type: String,
   },
   ownerName: {
      type: String,
   },
   isAvailable: {
      type: String,
      default: "Available",
   }
}, {
   strict: false,
})

propertyModel.pre("save", async function (next) {
   if (!this.propertyId) {
      const lastProperty = await this.constructor
         .findOne()
         .sort({ propertyId: -1 });

      this.propertyId = lastProperty
         ? lastProperty.propertyId + 1
         : 1;
   }

   if (this.propertyAmt <= 0) {
      this.isAvailable = "Unavailable";
   } else {
      this.isAvailable = "Available";
   }

   next();
});

propertyModel.pre(["findOneAndUpdate", "updateOne"], function (next) {
   const update = this.getUpdate();
   if (update.propertyAmt !== undefined) {
      if (update.propertyAmt <= 0) {
         update.isAvailable = "Unavailable";
      } else {
         update.isAvailable = "Available";
      }
   } else if (update.$set && update.$set.propertyAmt !== undefined) {
      if (update.$set.propertyAmt <= 0) {
         update.$set.isAvailable = "Unavailable";
      } else {
         update.$set.isAvailable = "Available";
      }
   }
   next();
});

const propertySchema = mongoose.model('propertyschema', propertyModel)

module.exports = propertySchema