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

// const { promisify } = require("util");
// const catchAsync = require("../utils/catchAsync");

function isValidEmail(email) {
  // Use a regular expression to check for a valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const userController = {
  // register api
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

  // const get verified companies
  async getVerifiedCompanies(req, res) {
    const companies = await User.find({
      verified: true,
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

  // const get verified companies
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

  // resetPassword api
  async resetPassword(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    console.log(email, password);
    let code = 400;
    let data = {
      success: false,
      error: "Unable to change password",
    };

    // Check if the password has a maximum length of 8 characters
    if (password && password.length < 8) {
      console.log("Password exceeds maximum length");
      code = 400;
      data = {
        success: false,
        error: "Password must be atleast 8 characters",
      };
    } else {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      const company = await User.findOneAndUpdate({ email }, { password })
        .then((res) => {
          code = 200;
          data = {
            success: true,
            message: "password changed successfully",
          };
        })
        .catch((err) => {
          code = 404;
          data = {
            success: false,
            message: "email not found",
          };
        });
    }

    // Hash the password

    res.status(code).send({
      data: data,
    });
  },

  // add CompanyName api
  async addCompanyName(req, res) {
    const id = req.params.id;
    const companyName = req.body.companyName;
    console.log(id);
    let sendingData, code;

    if (!id) {
      code = 400;
      sendingData = {
        success: false,
        error: "Company id is empty",
      };
    }

    if (!companyName) {
      code = 400;
      sendingData = {
        success: false,
        error: "please fill the field",
      };
    } else {
      const company = await User.findOneAndUpdate({ _id: id }, { companyName })
        .then((res) => {
          code = 200;
          sendingData = {
            success: true,
            message: "company name added successfully",
          };
        })
        .catch((err) => {
          code = 500;
          sendingData = {
            success: false,
            error: "Some Error Occured",
          };
        });
    }
    res.status(code).send({
      data: sendingData,
    });
  },

  // upload image
  async uploadImage(req, res, next) {
    const companyId = req.params.id;

    // Access the uploaded file as a Buffer
    const fileBuffer = req.file ? req.file.filename : null;

    if (!companyId) {
      return res.status(404).send({
        error: "company id cannot be empty",
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
      return res.status(404).send({
        error: "Internal server Error",
        success: false,
      });
    }
  },

  // complete Profile
  async completeProfile(req, res) {
    const id = req.params.id;
    const location = req.body.location;
    const contact = req.body.number;
    console.log(id);
    let sendingData, code;

    if (!id) {
      code = 400;
      sendingData = {
        success: false,
        error: "Company id is empty",
      };
    }

    if (!location || !contact) {
      code = 400;
      sendingData = {
        success: false,
        error: "please fill the field",
      };
    } else {
      const company = await User.findOneAndUpdate(
        { _id: id },
        { location, contact }
      )
        .then((res) => {
          code = 200;
          sendingData = {
            success: true,
            error: "details added successfully",
          };
        })
        .catch((err) => {
          code = 500;
          sendingData = {
            success: false,
            error: "Some Error Occured",
          };
        });
    }
    res.status(code).send({
      data: sendingData,
    });
  },

  // set company type
  async setCompanyType(req, res) {
    const id = req.params.id;
    const companyType = req.body.companyType;
    const categoryTags = req.body.categoryTags;
    console.log(req.body);
    let sendingData, code;

    if (!id) {
      code = 400;
      sendingData = {
        success: false,
        error: "Company id is empty",
      };
    }

    if (!companyType || !categoryTags) {
      code = 400;
      sendingData = {
        success: false,
        error: "please fill the field",
      };
    } else {
      const company = await User.findOneAndUpdate(
        { _id: id },
        { companyType, categoryTags }
      )
        .then((res) => {
          code = 200;
          sendingData = {
            success: true,
            error: "details added successfully",
          };
        })
        .catch((err) => {
          code = 500;
          sendingData = {
            success: false,
            error: "Some Error Occured",
          };
        });
    }
    res.status(code).send({
      data: sendingData,
    });
  },

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

   // ----------------- api to update user ----------------- 
   async updateUser(req, res) {
    
      let id = req.params.id;
      let updatedUser = req.body;

        // update user
        let update;
        if(updatedUser.password){
          const salt = await bcrypt.genSalt(10);
            updatedUser.password = await bcrypt.hash(updatedUser.password, salt);
            console.log("password", updatedUser.password);
            console.log("id", id);
          update = await User.findOneAndUpdate(
            {_id : id},
            {
              name:updatedUser.name,
              password: updatedUser.password,
                email: updatedUser.email,  
                phone: updatedUser.phone,
                location: updatedUser.location,
            }
        )}else{
          update = await User.findOneAndUpdate(
            {_id : id},
            {
              name:updatedUser.name,
                email: updatedUser.email,  
                phone: updatedUser.phone,
                location: updatedUser.location,
            }
        )
        }
      if (!update){
        console.log("error")
        res.status(400).send("Error");
      }
     
      else{
        res.status(200).send({
          data: "data updated successfully",
        });
      }
     
  },
  // login api
  async login(req, res) {
    // const { error } = loginValidationSchema.validate(req.body);
    let code = 404;
    let data = {
      success: false,
      error: "not logged in",
    };

    const userData = req.body;
    const user = new User(userData);
    const founduser = await User.findOne({
      email: userData.email,
      type: userData.type,
    });

    console.log("found user", founduser);
    const checkverified = await User.findOne({
      email: userData.email,
      type: userData.type,
      verified: true,
    });

    if (!founduser) {
      code = 404;
      data = {
        success: false,
        error: "Email is Wrong",
      };
      res.status(code).send({
        data,
      });
    } else if (!checkverified) {
      code = 404;
      data = {
        success: false,
        error: "User not Verified",
      };
      res.status(code).send({
        data,
      });
    } else {
      const validPass = await bcrypt.compare(
        userData.password,
        founduser.password
      );

      console.log("valid pass", validPass);
      if (!validPass) {
        code = 404;
        data = {
          success: false,
          error: "Wrong Password",
        };
        res.status(code).send({
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
    res.status(code).send({
      data: data,
    });
   
  },

  // getImage
  async getImage(req, res) {
    // const { error } = loginValidationSchema.validate(req.body);
    let code = 404;
    let data = {
      success: false,
      error: "image not found",
    };

    const _id = req.params.id;
    const founduser = await User.findOne({ _id });

    console.log("found user", founduser);

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

  // send OTP
  async sendOTP(req, res, next) {
    const { email } = req.body;
    console.log(email);
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

      console.log(new_otp);

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

  async verifyCompany(req, res, next) {
    const { id } = req.body;
    console.log(id);
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

  async RejectCompanyRequest(req, res, next) {
    const { id } = req.body;
    console.log(id);
    let code = 404;
    let data = {
      success: false,
      error: "Company not rejected",
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

  async verifyOtp(req, res) {
    // verify otp and update user accordingly
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
    });
    let code = 404;
    let data = {
      success: false,
      error: "otp not verified",
    };

    if (!user) {
      code = 404;
      data = {
        success: false,
        error: "Email is not registered",
      };
    } else {
      const checkExpiry = await User.findOne({
        email,
        otp_expiry_time: { $gt: Date.now() },
      });
      if (!checkExpiry) {
        code = 404;
        data = {
          success: false,
          message: "OTP is expired",
        };
      } else {
        const checkOtp = await User.findOne({
          email,
          otp,
        });
        if (checkOtp) {
          code = 200;
          data = {
            success: true,
            message: "Otp is correct",
          };
        } else {
          code = 404;
          data = {
            success: false,
            message: "Otp is incorrect",
          };
        }
      }
    }
    res.status(code).json({
      data: data,
    });
  },
};

module.exports = userController;
