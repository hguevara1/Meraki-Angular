import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === "test") {
      console.log("Modo test: conexión controlada por Jest");
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error de conexión: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
