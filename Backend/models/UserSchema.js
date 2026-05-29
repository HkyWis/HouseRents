const mongoose = require("mongoose");

const userModel = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    set: function (value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{4,}$/,
      "Password must be at least 4 characters, must contain uppercase letters, lowercase letters, and symbols.",
    ],
  },
  type: {
    type: String,
    required: [true, "type is required"],
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "propertyschema",
    },
  ],
}, {
  strict: false,
});

const userSchema = mongoose.model("user", userModel);

module.exports = userSchema;


