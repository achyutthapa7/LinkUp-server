import nodemailer from "nodemailer";
export default async function sendOtp(
  verificationCode,
  emailAddress,
  title,
  heading,
  paragraph
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.USER,
    to: emailAddress,
    subject: title,
    html: `<!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
    
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
    
        .header {
          background-color: #007bff;
          color: #ffffff;
          padding: 10px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
    
        .content {
          padding: 20px;
          text-align: center;
        }
    
        .code {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          margin: 20px 0;
          padding: 10px;
          border: 1px dashed #007bff;
          display: inline-block;
          border-radius: 5px;
        }
    
        .footer {
          text-align: center;
          color: #777777;
          font-size: 12px;
          margin-top: 20px;
        }
      </style>
    </head>
    
    <body>
      <div class="container">
        <div class="header">
          <h1>${heading}</h1>
        </div>
        <div class="content">
          <p>${paragraph}</p>
          <div class="code">${verificationCode}</div>
          <p>If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 kinbech. All rights reserved.</p>
        </div>
      </div>
    </body>
    
    </html>
    `,
  };
  await transporter
    .sendMail(mailOptions)
    .then(() => console.log("code sent successfully"))
    .catch((err) => {
      console.log(`Error while sending mail ${err.message}`);
    });
}
