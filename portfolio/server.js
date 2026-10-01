const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();


// Middleware

app.use(cors());

app.use(express.json());

app.use(express.static("public"));


// MongoDB connection

mongoose.connect(process.env.MONGO_URI)

    .then(function () {
        console.log("MongoDB Connected");
    })

    .catch(function (error) {
        console.log("MongoDB Error:", error);
    });


// Project Schema

const projectSchema = new mongoose.Schema({

    title: String,

    description: String,

    technologies: [String],

    github: String

});


// Project Model

const Project =
    mongoose.model("Project", projectSchema);


// Contact Schema

const contactSchema = new mongoose.Schema({

    name: String,

    email: String,

    message: String,

    date: {
        type: Date,
        default: Date.now
    }

});


// Contact Model

const Contact =
    mongoose.model("Contact", contactSchema);


// Get Projects

app.get("/api/projects", async function (req, res) {

    try {

        const projects =
            await Project.find();

        res.json(projects);

    }

    catch (error) {

        res.status(500).json({
            message: "Error loading projects"
        });

    }

});


// Add Project

app.post("/api/projects", async function (req, res) {

    try {

        const project =
            new Project(req.body);

        await project.save();

        res.json({
            message: "Project added successfully"
        });

    }

    catch (error) {

        res.status(500).json({
            message: "Error adding project"
        });

    }

});


// Contact Form

app.post("/api/contact", async function (req, res) {

    try {

        const contact =
            new Contact({

                name: req.body.name,

                email: req.body.email,

                message: req.body.message

            });


        await contact.save();


        res.json({

            message: "Message sent successfully!"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Error sending message"

        });

    }

});


// Start server

app.listen(5000, function () {

    console.log(
        "Server running at http://localhost:5000"
    );

});