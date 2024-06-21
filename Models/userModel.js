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
    role:{
      type:String,
      enum:['admin','user','guide','lead-guide'],
      default:'user',
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

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // this.password not possible becuase not possible because of select property
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfterTokenIssued = function(JWTTimestamp){
  if(this.passwordChangedAt){
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);

    return JWTTimestamp < changedTimestamp;  //100 < 200 c
  }
  
  
  return false;
}

const User = mongoose.model("User", userSchema);

module.exports = User;
