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

// CORS configuration - FIXED
app.use(cors({
    origin: 'https://townships-eats-app.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));



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

const PORT = process.env.PORT || 5401;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`PayFast Sandbox: ${process.env.PAYFAST_SANDBOX === 'true' ? 'YES' : 'NO'}`);
});
