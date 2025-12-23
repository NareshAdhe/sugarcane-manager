const otpContent = (name,otp) => {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }
    .header h1 {
      margin: 0;
      color: #4CAF50;
    }
    .content {
      padding: 20px;
      text-align: center;
    }
    .otp {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      background-color: #f9f9f9;
      padding: 10px 20px;
      border-radius: 5px;
      display: inline-block;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #666;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Your OTP Code</h1>
    </div>
    <div class="content">
      <p>Hello ${name}</p>
      <p>Your one-time password (OTP) for completing your action is:</p>
      <div class="otp">${otp}</div>
      <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
    </div>
    <div class="footer">
      <p>Thank you for using our service!</p>
      <p><strong>Tractor Manager</strong></p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = otpContent;