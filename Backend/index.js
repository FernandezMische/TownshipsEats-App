import express from "express";
import dotenv from "dotenv";
import paymentRoutes from "./routes/paymentRoutes.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";      
import categoryRoutes from "./routes/categoryRoutes.js";  
import cartRoutes from "./routes/cartRoutes.js";          
import orderRoutes from "./routes/orderRoutes.js"; 
import publicVendorRoutes from "./routes/publicVendorRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";

dotenv.config();

const app = express();

// Allowed origins
const allowedOrigins = ['https://townships-eats-app.vercel.app', 'https://kasi-eats.netlify.app'];

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Handle preflight requests for all routes

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes)
app.use("/api", paymentRoutes);
app.use("/api", contactRoutes);     
app.use("/api/categories", categoryRoutes); 
app.use("/api/cart", cartRoutes);            
app.use("/api/orders", orderRoutes);    
app.use("/api/vendor", vendorRoutes);     
app.use("/api/vendors", publicVendorRoutes);
app.use("/api/driver", driverRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Kasi Eats API is running" });
});

app.get("/api/debug", (req, res) => {
    res.json({
        message: "Backend is reachable",
        headers: req.headers,
        env: {
            node: process.version,
            cors_origin: 'configured'
        }
    });
});

const PORT = process.env.PORT || 5401;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`PayFast Sandbox: ${process.env.PAYFAST_SANDBOX === 'true' ? 'YES' : 'NO'}`);
});
