const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const adminRouter = require('./routes/admin-router')
const path = require("path")

const app = express();

app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use("/uploads/others", express.static(path.join("uploads", "others")));
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRouter);

mongoose
  .connect(
    `mongodb+srv://rohansinghrp180:${encodeURIComponent("Rohan@2001")}@cluster0.m9ddkh2.mongodb.net/dashboard?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(
    app.listen(8000, () => {
      console.log("listening to port 8000");
    })
  )
  .catch((err) => {console.log(err)});

