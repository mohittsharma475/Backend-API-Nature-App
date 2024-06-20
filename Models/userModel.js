const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A name is required"],
    maxlength: [40, "A name must have a length of 40"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please Provide an Email"],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid Email"],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "A password should have at least 8 characters"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please enter password again"],
    validate: {
      // works on create and save
      validator: function (el) {
        return this.password === el;
      },
      message: "Password did'nt match",
    },
  },
});

//  runs only on create or save
// pre middlewaare
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
//   only runs if password actually modified

  this.password = await bcrypt.hash(this.password, 12);
  // async function

  this.passwordConfirm = undefined;
//   /delete passwordconfirm field
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
