const User = require("../models/user");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const resetPassword = require("../Template/Mail/ResetPassword");
const otpGenerator = require("otp-generator");
const mailService = require("../services/mailer");
const crypto = require("crypto");
const otp = require("../Template/Mail/otp");
const verifyCompany = require("../Template/Mail/VerifyCompany");
const { validate } = require("uuid");
const rejectRequest = require("../Template/Mail/RejectCompanyRequest");
const fs = require("fs");
const path = require("path");

function isValidEmail(email) {
  // Use a regular expression to check for a valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const userController = {
  // ----------------- api to register user -----------------

  async register(req, res) {
    let userData = req.body;
    try {
      const fileBuffer = req.file ? req.file.filename : null;
      let user = new User(userData);
      user.document = fileBuffer
      // Check if the email is valid
      if (!isValidEmail(user.email)) {
        return res.status(400).send({
          success: false,
          error: "Invalid Email Address.",
        });
      }

      // Find if the user already exists
      const emailExists = await User.findOne({
        email: user.email,
        type: user.type,
      });

      if (emailExists) {
        return res.status(400).send({
          success: false,
          error: "Email address already exists. Try logging in.",
        });
      }

      // Check if the password has a maximum length of 8 characters
      if (user.password.length < 8) {
        return res.status(400).send({
          success: false,
          error: "Password must be at least 8 characters long.",
        });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

      // Save the user to the database
      user.save((error, registeredUser) => {
        if (error) {
          return res.status(500).send({
            success: false,
            error: error.message,
          });
        }

        // Generate and send a JWT token upon successful registration
        const token = jwt.sign(
          { _id: registeredUser._id },
          process.env.TOKEN_SECRET
        );

        res.status(200).send({
          success: true,
          message: "account created successfully",
          data: {
            authToken: token,
            name: registeredUser.name,
            email: registeredUser.email,
            _id: registeredUser._id,
          },
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

  // ----------------- api to upload/ update image -----------------

  async uploadImage(req, res, next) {
    try {
      const companyId = req.params.id;

      // Access the uploaded file as a Buffer
      const fileBuffer = req.file ? req.file.filename : null;

      if (!companyId) {
        return res.status(404).send({
          error: "user id cannot be empty",
          success: false,
        });
      }

      // Assuming you have a 'User' model defined

      const upload = await User.findOneAndUpdate(
        { _id: companyId },
        {
          image: fileBuffer,
        },
        { new: true } // Return the updated document
      );

      if (!upload) {
        return res.status(404).send({
          error: "user not found",
          success: false,
        });
      }

      res.status(200).json({
        data: upload,
        success: true,
      });
    } catch (error) {
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

  // ----------------- api to upload documents -----------------

  async uploadDocuments(req, res, next) {
    try {
      const companyId = req.params.id;

      // Access the uploaded files as an array
      const fileBuffers = req.files
        ? req.files.map((file) => file.filename)
        : [];
      if (!companyId) {
        return res.status(404).send({
          error: "Company id cannot be empty",
          success: false,
        });
      }
      const upload = await User.findOneAndUpdate(
        { _id: companyId },
        {
          documents: fileBuffers, // Assuming 'documents' is an array field in your User model
        },
        { new: true } // Return the updated document
      );

      if (!upload) {
        return res.status(404).send({
          error: "Company not found",
          success: false,
        });
      }

      res.status(200).json({
        data: upload,
        success: true,
      });
    } catch (error) {
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

  // ----------------- api to get verified companies -----------------

  async getVerifiedCompanies(req, res) {
    try {
      const companies = await User.find({
        verified: true,
        // type:'company'
      });

      let users = [];
      let sellers = 0;
      let customers = 0;
      companies.map((val) => {
        if (val.type != "admin") {
          users.push(val);
        }
        if (val.type == "company") {
          sellers++;
        } else if (val.type != "admin") {
          customers++;
        }
      });
      if (companies) {
        res.status(200).send({
          success: true,
          data: { users, sellers, customers },
        });
      } else {
        res.status(404).send({
          success: false,
          error: "companies not found",
        });
      }
    } catch (error) {
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

  // ----------------- api to get profile -----------------

  async getProfile(req, res) {
    try {
      let { user } = req.params;
      const userFound = await User.find({
        _id: user,
      });

      if (userFound && userFound.length > 0) {
        res.status(200).send({
          success: true,
          data: userFound,
        });
      } else {
        res.status(404).send({
          success: false,
          error: "User not found",
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

  // ----------------- api to get unverified companies -----------------

  async getUnverifiedCompanies(req, res) {
    try {
      const companies = await User.find({
        verified: false,
        type: "company",
      });

      if (companies) {
        res.status(200).send({
          success: true,
          data: companies,
        });
      } else {
        res.status(404).send({
          success: false,
          error: "companies not found",
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

  // ----------------- api to reset password -----------------

  async resetPassword(req, res) {
    try {
      let email = req.body.email;
      let password = req.body.password;
      // Check if the password has a minimum length of 8 characters
      if (password && password.length < 8) {
        return res.status(400).send({
          success: false,
          error: "Password must be at least 8 characters",
        });
      }

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      // Update password in the database
      const company = await User.findOneAndUpdate({ email }, { password });

      if (company) {
        // Password changed successfully
        return res.status(200).send({
          success: true,
          message: "Password changed successfully",
        });
      } else {
        // User not found
        return res.status(404).send({
          success: false,
          error: "User not found",
        });
      }
    } catch (err) {
      // Handle any errors that occurred during the process
      console.log(err);
      return res.status(500).send({
        success: false,
        error: "Some error occurred",
      });
    }
  },

  // ----------------- api to update user -----------------
  async updateUser(req, res) {
    let { id, email, phone, location, name } = req.body;
    const fileBuffer = req.file ? req.file.filename : null;
    // update user
    try {
      if (fileBuffer != null) {
        let updatedUser = await User.findOneAndUpdate(
          { _id: id },
          {
            name,
            email,
            contact: phone,
            location,
            image: fileBuffer,
          }
        );
        const pathh = path.join(__dirname, "../public/", updatedUser.image);
        fs.unlink(pathh, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            return;
          }
        });
      } else {
        let updatedUser = await User.findOneAndUpdate(
          { _id: id },
          {
            name,
            email,
            contact: phone,
            location,
          }
        );
      }

      let update = await User.find({
        _id: id,
      });

      if (!update) {
        res.status(400).send({
          success: false,
          error: "user not updated, try again",
        });
      } else {
        token = jwt.sign({ _id: update._id }, process.env.TOKEN_SECRET);
        return res.status(200).send({
          success: true,
          message: "data updated successfully",
          data: {
            authToken: token,
            name: update[0].name,
            email: update[0].email,
            _id: update[0]._id,
            image: update[0].image,
            location: update[0].location,
            contact: update[0].contact,
          },
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        error: error.message || "Internal Server Error",
      });
    }
  },

  // ----------------- api to change password -----------------
  async changePassword(req, res) {
    let { id, oldPassword, newPassword } = req.body;

    try {
      const founduser = await User.findOne({
        _id: id,
      });

      if (!founduser) {
        return res.status(404).send({
          success: false,
          error: "user with this id not found",
        });
      } else {
        const validPass = await bcrypt.compare(oldPassword, founduser.password);

        if (!validPass) {
          return res.status(404).send({
            success: false,
            error: "Old password is in correct",
          });
        } else {
          // Hash the password
          const salt = await bcrypt.genSalt(10);
          newPassword = await bcrypt.hash(newPassword, salt);

          const updatedPassword = await User.findOneAndUpdate(
            { _id: id },
            { password: newPassword }
          );
          if (updatedPassword) {
            return res.status(200).send({
              success: true,
              message: "password updated successfully",
              data: updatedPassword,
            });
          } else {
            return res.status(404).send({
              success: false,
              error: "Some error occured",
            });
          }
        }
      }
    } catch (err) {
      res.status(404).send({
        success: false,
        error: err || "credentials not match",
      });
    }
  },

  // ............................delete user api.............................
  async deleteProfile(req, res) {
    let id = req.params.id;

    try {
      const profileDeleted = await User.findOneAndDelete({
        _id: id,
      });

      if (profileDeleted) {
        return res.status(200).send({
          success: true,
          message: "Profile Deleted Successfully",
          // data: productExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Unable to delete profile",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        error: err || "Internal Server Error",
      });
    }
  },

  // ----------------- login api -----------------
  async login(req, res) {
    const userData = req.body;
    try {
      let token;
      const founduser = await User.findOne({
        email: userData.email,
        type: userData.type,
      });

      if (!founduser) {
        return res.status(404).send({
          success: false,
          error: "User with this email donot exists",
        });
      } else if (!founduser.verified) {
        return res.status(404).send({
          success: false,
          error: "User not Verified",
        });
      } else {
        const validPass = await bcrypt.compare(
          userData.password,
          founduser.password
        );

        if (!validPass) {
          return res.status(404).send({
            success: false,
            error: "Wrong Password",
          });
        } else {
          token = jwt.sign({ _id: founduser._id }, process.env.TOKEN_SECRET);
        }
      }
      return res.status(200).send({
        success: true,
        message: "logged in successfully",
        data: {
          authToken: token,
          name: founduser.name,
          email: founduser.email,
          _id: founduser._id,
          image: founduser.image,
          location: founduser.location,
          contact: founduser.contact,
          type: founduser.type,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(404).send({
        success: false,
        error: "cradentials not match",
      });
    }
  },

  // ----------------- getImage -----------------
  async getImage(req, res) {
    try {
      const _id = req.params.id;
      const founduser = await User.findOne({ _id });

      if (!founduser) {
        res.status(404).send({
          success: false,
          error: "Image not found",
        });
      } else {
        res.status(200).send({
          success: true,
          image: founduser.image,
          name: founduser.name,
          isAdmin: founduser.isAdmin,
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

  // ----------------- send OTP -----------------
  async sendOTP(req, res, next) {
    try {
      const { email } = req.body;
      const new_otp = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      let code = 404;
      let data = {
        success: false,
        error: "otp not send",
      };

      const otp_expiry_time = Date.now() + 10 * 60 * 1000; // 10 Mins after otp is sent

      const user = await User.findOneAndUpdate(
        { email: email }, // Change this condition based on your schema
        {
          otp_expiry_time: otp_expiry_time,
          otp: new_otp,
        },
        { new: true }
      );

      if (!user) {
        code = 404;
        data = {
          success: false,
          error: "User not found",
        };
      } else {
        mailService.sendEmail({
          from: "fa20-bcs-088@isbstudent.comsats.edu.pk",
          to: user.email, // Ensure 'email' is the correct property name
          subject: "Verification OTP",
          html: otp(user.name, new_otp), // Ensure 'name' is the correct property name
          attachments: [],
        });

        code = 200;
        data = {
          success: true,
          message: "OTP Sent Successfully!",
        };
      }

      res.status(code).json({
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

  // ----------------- verify company api -----------------

  async verifyCompany(req, res, next) {
    try {
      const { id } = req.body;
      const new_otp = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      let code = 404;
      let data = {
        success: false,
        error: "company not verified",
      };

      try {
        const user = await User.findOneAndUpdate(
          { _id: id, type: "company" },
          { verified: true },
          { new: true }
        );

        if (!user) {
          code = 404;
          data = {
            success: false,
            error: "User not found",
          };
        } else {
          // Try sending the email
          await mailService.sendEmail({
            from: "fa20-bcs-088@isbstudent.comsats.edu.pk",
            to: user.email,
            subject: "Verification of Company",
            html: verifyCompany(user.name),
            attachments: [],
          });

          code = 200;
          data = {
            success: true,
            message: "User Verified!",
          };
        }
      } catch (error) {
        // Handle email sending errors

        code = 500; // Internal Server Error
        data = {
          success: false,
          error: "Error sending email",
        };
      }

      res.status(code).json({
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

  // ----------------- reject company request -----------------

  async RejectCompanyRequest(req, res, next) {
    try {
      const { id } = req.body;
      let code = 404;
      let data = {
        success: false,
        error: "Company request not rejected due to some error",
      };

      try {
        // Find the user
        const user = await User.findOne({ _id: id, type: "company" });

        if (!user) {
          code = 404;
          data = {
            success: false,
            error: "User not found",
          };
        } else {
          // Try sending the email
          await mailService.sendEmail({
            from: "fa20-bcs-088@isbstudent.comsats.edu.pk",
            to: user.email,
            subject: "Verification of Company",
            html: rejectRequest(user.name),
            attachments: [],
          });

          // Delete the user
          const userDelete = await User.findOneAndDelete({
            _id: id,
            type: "company",
          });

          if (userDelete) {
            code = 200;
            data = {
              success: true,
              message: "User Rejected!",
            };
          } else {
            // If user deletion fails
            code = 500;
            data = {
              success: false,
              error: "Error deleting user",
            };
          }
        }
      } catch (error) {
        // Handle errors, including email sending errors
        console.error("Error:", error);

        code = 500; // Internal Server Error
        data = {
          success: false,
          error: "Internal Server Error",
        };
      }

      res.status(code).json({
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

  // ----------------- verify OTP -----------------

  async verifyOtp(req, res) {
    try {
      // verify otp and update user accordingly
      const { email, otp } = req.body;
      const user = await User.findOne({
        email,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Email not found",
        });
      } else {
        const checkExpiry = await User.findOne({
          email,
          otp_expiry_time: { $gt: Date.now() },
        });
        if (!checkExpiry) {
          return res.status(404).json({
            success: false,
            error: "OTP is expired",
          });
        } else {
          const checkOtp = await User.findOne({
            email,
            otp,
          });
          if (checkOtp) {
            return res.status(200).json({
              success: true,
              message: "Otp is correct",
            });
          } else {
            return res.status(404).json({
              success: false,
              error: "Otp is incorrect",
            });
          }
        }
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

module.exports = userController;
