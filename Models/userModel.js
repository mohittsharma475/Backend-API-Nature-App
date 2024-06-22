const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
    select: false,
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
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ["admin", "user", "guide", "lead-guide"],
      default: "user",
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active:{
      type:Boolean,
      default:true,
      select:false
    }
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

userSchema.pre('save',function(next){
  if(!this.isModified('password')|| this.isNew ) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
})

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // this.password not possible becuase not possible because of select property
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre(/^find/,function(next){
  // this point to current query

  this.find({active:{$ne :true}});
  next();
})
userSchema.methods.changedPasswordAfterTokenIssued = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp; //100 < 200 c
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
