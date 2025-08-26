const mongoose = require("mongoose");

const userProfileSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    middleName: {
      type: String,
    },
    streetAddress: {
      type: String,
    },
    barangay: {
      type: String,
    },
    cityMunicipality: {
      type: String,
    },
    province: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    personalEmail: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    // age: {
    //   type: String,
    // },
    emergencyContactPerson: {
      type: String,
    },
    emergencyContactNumber: {
      type: String,
    },
    relationship: {
      type: String,
    },
    civilStatus: {
      type: String,
    },
    gender: {
      type: String,
    },
    pagibigNo: {
      type: String,
    },
    philhealthNo: {
      type: String,
    },
    sssNo: {
      type: String,
    },
    tinNo: {
      type: String,
    },
    avatar: {
      type: String,
    },
    taxStatus: {
      type: String,
    },
    department: {
      type: String,
    },
    jobPosition: {
      type: String,
    },
    employmentStatus: {
      type: String,
    },
    dateHired: {
      type: String,
    },
    probationaryDate: {
      type: String,
    },
    regularizationDate: {
      type: String,
    },
    hmoAccountNumber: {
      type: Number,
    },
    bankAccountNumber: {
      type: Number,
    },
    mobileNumber: {
      type: Number,
    },
    emailAddress: {
      type: String,
    },
    phoneAddress: {
      type: String,
    },
    presentHouseNo: {
      type: String,
    },
    presentStreet: {
      type: String,
    },
    presentBarangay: {
      type: String,
    },
    presentTown: {
      type: String,
    },
    presentCity: {
      type: String,
    },
    presentProvince: {
      type: String,
    },
    presentProvince: {
      type: String,
    },
    homeHouseNo: {
      type: String,
    },
    homeStreet: {
      type: String,
    },
    homeBarangay: {
      type: String,
    },
    homeTown: {
      type: String,
    },
    homeCity: {
      type: String,
    },
    homeProvince: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);
