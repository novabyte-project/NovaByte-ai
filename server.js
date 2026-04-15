const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/send", async (req, res) => {
    const { email, message } = req.body;

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "novabyte888@gmail.com",
            pass: "ofpudluhdoewhtpz"
        }
    });

    let mailOptions = {
        from: email,
        to: "novabyte888@gmail.com",
        subject: "New Message from Website",
        text: `Email: ${email}\nMessage: ${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send("Email sent successfully");
    } catch (error) {
        console.log(error);
        res.send("Error sending email");
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
