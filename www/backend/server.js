const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const neuralRoutes = require("./routes/NN");

app.use(bodyParser.json());

app.use(cors());

app.use("/", neuralRoutes);

//Port
const port = process.env.PORT || 8000;

//Starting a server
app.listen(port, () => {
  console.log(`App is running at ${port}`);
});
