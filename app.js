const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const adminRouter = require('./routes/admin-router')

const app = express();

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

