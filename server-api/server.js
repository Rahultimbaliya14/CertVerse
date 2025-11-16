const mongoose = require("mongoose");
const app = require("./app");

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Mongoose connected"))
.catch((err) => {
  console.error("❌ Mongoose connection error:", err.message);
  process.exit(1);
});

app.set("port", process.env.PORT || 80);
const server = app.listen(app.get("port"), () => {
  console.log(`Express running → On PORT : ${server.address().port}`);
});