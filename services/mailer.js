const sgMail = require("@sendgrid/mail");
console.log("api key", process.env.SG_KEY )

sgMail.setApiKey('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');

const sendSGMail = async ({
  to,
  sender,
  subject,
  html,
  attachments,
  text,
}) => {
  try {
    const from = "fa20-bcs-088@isbstudent.comsats.edu.pk";

    const msg = {
      to: to, // Change to your recipient
      from: from, // Change to your verified sender
      subject: subject,
      html: html,
      // text: text,
      attachments,
    };

    
    return sgMail.send(msg);
  } catch (error) {
    console.log(error);
  }
};

exports.sendEmail = async (args) => {
  if (!process.env.NODE_ENV === "development") {
    return Promise.resolve();
  } else {
    return sendSGMail(args);
  }
};