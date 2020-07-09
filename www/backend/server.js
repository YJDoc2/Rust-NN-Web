const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

//Port
const port = process.env.PORT || 8000;

//Starting a server
app.listen(port, () => {
  console.log(`App is running at ${port}`);
});
