const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

const User = require("./models/user");
const Product = require("./models/product");
const Order = require("./models/Order");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// ================= DATABASE =================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");

        createAdmin();

        app.listen(process.env.PORT || 5000, () => {
            console.log("Server running on http://localhost:5000");
        });
    })
    .catch((err) => {
        console.log("MongoDB Error:", err);
    });


// ================= CREATE ADMIN =================

async function createAdmin() {

    const admin = await User.findOne({
        email: "admin@gmail.com"
    });

    if (!admin) {

        const hashedPassword = await bcrypt.hash("admin123", 10);

        await User.create({
            name: "Admin",
            email: "admin@gmail.com",
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin created");
        console.log("Email: admin@gmail.com");
        console.log("Password: admin123");
    }
}


// ================= AUTH MIDDLEWARE =================

function auth(req, res, next) {

    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "Login required"
        });
    }

    try {

        const decoded = jwt.verify(
            token.replace("Bearer ", ""),
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        res.status(401).json({
            message: "Invalid token"
        });
    }
}


function adminOnly(req, res, next) {

    if (req.user.role !== "admin") {

        return res.status(403).json({
            message: "Admin access required"
        });

    }

    next();
}


// ================= REGISTER =================

app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user"
        });

        res.json({
            message: "Registration successful"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});


// ================= LOGIN =================

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({
                message: "Invalid email or password"
            });

        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {

            return res.status(400).json({
                message: "Invalid email or password"
            });

        }

        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});


// ================= GET PRODUCTS =================

app.get("/api/products", async (req, res) => {

    try {

        const products = await Product.find();

        res.json(products);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});


// ================= GET SINGLE PRODUCT =================

app.get("/api/products/:id", async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        res.json(product);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});


// ================= ADMIN ADD PRODUCT =================

app.post(
    "/api/products",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            const { name, price, image, description } = req.body;

            const product = await Product.create({
                name,
                price,
                image,
                description
            });

            res.json({
                message: "Product added",
                product
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    }
);


// ================= ADMIN DELETE PRODUCT =================

app.delete(
    "/api/products/:id",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            await Product.findByIdAndDelete(req.params.id);

            res.json({
                message: "Product deleted"
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    }
);


// ================= PLACE ORDER =================

app.post("/api/orders", auth, async (req, res) => {

    try {

        const { products, total, address } = req.body;

        const order = await Order.create({

            user: req.user.id,

            products,

            total,

            address,

            status: "Placed"

        });

        res.json({
            message: "Order placed successfully",
            order
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});


// ================= USER ORDERS =================

app.get("/api/orders", auth, async (req, res) => {

    try {

        const orders = await Order.find({
            user: req.user.id
        }).populate("products.product");

        res.json(orders);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});


// ================= ADMIN ALL ORDERS =================

app.get(
    "/api/admin/orders",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            const orders = await Order.find()
                .populate("user")
                .populate("products.product");

            res.json(orders);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    }
);


// ================= UPDATE ORDER STATUS =================

app.put(
    "/api/admin/orders/:id",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            const { status } = req.body;

            await Order.findByIdAndUpdate(
                req.params.id,
                { status }
            );

            res.json({
                message: "Order status updated"
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    }
);


// ================= START =================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});