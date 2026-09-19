import express from "express";
import cors from "cors";
const app=express();
app.use(cors());
app.use(express.json());
app.get("/",(req,res)=>{
    res.json({
        message:"finit backend is running"
    });
});
const PORT=5000;
app.listen(PORT,()=>{
    console.log(`FindIt backend running on http://localhost:${PORT}`);

});