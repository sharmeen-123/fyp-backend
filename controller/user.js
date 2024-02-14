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

function isValidEmail(email) {
  // Use a regular expression to check for a valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const userController = {
  // ----------------- api to register user -----------------

  async register(req, res) {
    let userData = req.body;
    let user = new User(userData);

    // Check if the email is valid
    if (!isValidEmail(user.email)) {
      console.log("Invalid email format");
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
      console.log("Email already exists");
      return res.status(400).send({
        success: false,
        error: "Email address already exists. Try logging in.",
      });
    }

    // Check if the password has a maximum length of 8 characters
    if (user.password.length < 8) {
      console.log("Password exceeds maximum length");
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
        authToken: token,
        name: registeredUser.name,
        email: registeredUser.email,
        _id: registeredUser._id,
      });
    });
  },

  // ----------------- api to upload/ update image -----------------

  async uploadImage(req, res, next) {
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
    try {
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
      console.error(error);
      return res.status(404).send({
        error: "Internal server Error",
        success: false,
      });
    }
  },

  // ----------------- api to upload documents -----------------

  async uploadDocuments(req, res, next) {
    const companyId = req.params.id;

    // Access the uploaded files as an array
    const fileBuffers = req.files ? req.files.map((file) => file.filename) : [];
    console.log(req.files);
    if (!companyId) {
      return res.status(404).send({
        error: "Company id cannot be empty",
        success: false,
      });
    }

    try {
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
      console.error(error);
      return res.status(500).send({
        error: "Internal server error",
        success: false,
      });
    }
  },

  // ----------------- api to get verified companies -----------------

  async getVerifiedCompanies(req, res) {
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
        data: users,
        sellers,
        customers,
      });
    } else {
      res.status(404).send({
        success: false,
        error: "companies not found",
      });
    }
  },

  // ----------------- api to get profile -----------------

  async getProfile(req, res) {
    let { user } = req.params;
    try {
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
      res.status(500).send({
        success: false,
        error: error.message || "Internal Server Error",
      });
    }
  },

  // ----------------- api to get unverified companies -----------------

  async getUnverifiedCompanies(req, res) {
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
  },

  // ----------------- api to reset password -----------------

  async resetPassword(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    console.log(email, password);

    try {
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

    // update user
    try {
      let emailExist = await User.find({ email: email });
      if (emailExist && emailExist.length > 0) {
        res.status(400).send({
          success: false,
          error: "User with this email already exists",
        });
      } else {
        let update = await User.findOneAndUpdate(
          { _id: id },
          {
            name,
            email,
            contact: phone,
            location,
          }
        );

        if (!update) {
          res.status(400).send({
            success: false,
            error: "user not updated, try again",
          });
        } else {
          res.status(200).send({
            success: true,
            message: "data updated successfully",
            data: update,
          });
        }
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
        console.log("in else")
        const validPass = await bcrypt.compare(oldPassword, founduser.password);
        
        console.log(validPass, "  ", oldPassword, "  ", newPassword);
        if (!validPass) {
          return res.status(404).send({
            success: false,
            error: "Old password is in correct",
          });
        } else {
          // Hash the password
          console.log("in else")
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
        error: err || "credentials not match" ,
      });
    }
  },


   // ............................delete user api.............................
   async deleteProfile(req, res) {
    let id = req.params.id
    
    try{
    
    const profileDeleted = await User.findOneAndDelete({
      _id:id
    });

    if (profileDeleted) {
        return res.status(200).send({
            success: true,
            message:"Profile Deleted Successfully",
            // data: productExists,
          });
    }

   else{
    return res.status(400).send({
        success: false,
        error: "Unable to delete profile",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      error: err || "Internal Server Error" ,
    });
  }
  },


  // ----------------- login api -----------------
  async login(req, res) {
    let code = 404;
    let data = {
      success: false,
      error: "not logged in",
    };

    const userData = req.body;
    try {
      const founduser = await User.findOne({
        email: userData.email,
        type: userData.type,
      });

      if (!founduser) {
        code = 404;
        data = {
          success: false,
          error: "Email is Wrong",
        };
        return res.status(code).send({
          data,
        });
      } else if (!founduser.verified) {
        code = 404;
        data = {
          success: false,
          error: "User not Verified",
        };
        return res.status(code).send({
          data,
        });
      } else {
        const validPass = await bcrypt.compare(
          userData.password,
          founduser.password
        );
        if (!validPass) {
          code = 404;
          data = {
            success: false,
            error: "Wrong Password",
          };
          return res.status(code).send({
            data,
          });
        } else {
          const token = jwt.sign(
            { _id: founduser._id },
            process.env.TOKEN_SECRET
          );
          code = 200;
          data = {
            success: true,
            message: "logged in successfully",
            authToken: token,
            name: founduser.name,
            email: founduser.email,
            _id: founduser._id,
            image: founduser.image,
          };
        }
      }
      return res.status(code).send({
        data: data,
      });
    } catch (err) {
      res.status(404).send({
        data: { message: "cradentials not match" },
      });
    }
  },

  // ----------------- getImage -----------------
  async getImage(req, res) {
    // const { error } = loginValidationSchema.validate(req.body);
    let code = 404;
    let data = {
      success: false,
      error: "image not found",
    };

    const _id = req.params.id;
    const founduser = await User.findOne({ _id });

    if (!founduser) {
      code = 404;
      data = {
        success: false,
        error: "Image not found",
      };
    } else {
      code = 200;
      data = {
        success: true,
        image: founduser.image,
        name: founduser.name,
        isAmdin: founduser.isAdmin,
      };
    }

    res.status(code).send({
      data,
    });
  },

  // ----------------- send OTP -----------------
  async sendOTP(req, res, next) {
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
  },

  // ----------------- verify company api -----------------

  async verifyCompany(req, res, next) {
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

        console.log(new_otp);

        code = 200;
        data = {
          success: true,
          message: "User Verified!",
        };
      }
    } catch (error) {
      // Handle email sending errors
      console.error("Error sending email:", error);

      code = 500; // Internal Server Error
      data = {
        success: false,
        error: "Error sending email",
      };
    }

    res.status(code).json({
      data: data,
    });
  },

  // ----------------- reject company request -----------------

  async RejectCompanyRequest(req, res, next) {
    const { id } = req.body;
    console.log(id);
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
  },

  // ----------------- verify OTP -----------------

  async verifyOtp(req, res) {
    // verify otp and update user accordingly
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Email is not registered",
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
  },
};

module.exports = userController;
