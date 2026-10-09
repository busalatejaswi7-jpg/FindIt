import express from "express";
import cors from "cors";
import searchRoutes from "./routes/search.routes.js";
import productRoutes from "./routes/product.routes.js";
import userRoutes from "./routes/user.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import authRoutes from "./routes/auth.routes.js";
const app=express();
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.json({
        message:"finit backend is running"
    });
});
app.use("/api/search",searchRoutes)
app.use("/api/products",productRoutes)
app.use("/api/users", userRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/auth", authRoutes);
const PORT=5000;
app.listen(PORT,()=>{
    console.log(`FindIt backend running on http://localhost:${PORT}`);

});