import mongoose from "mongoose";
import Category from "../models/category.js";
import Product from "../models/product.js";

const seedInitialData = async () => {
  try {
    // Rich list of categories requested by user
    const defaultCategories = [
      { categoryName: "Electronics", description: "Gadgets, earphones and devices" },
      { categoryName: "Groceries", description: "Everyday essentials, spices and food items" },
      { categoryName: "Beverages", description: "Refreshing drinks, juices and tea" },
      { categoryName: "Clothing & Apparel", description: "Casual wear, t-shirts and shirts" },
      { categoryName: "Home Essentials", description: "Kitchenware, cleaning and supplies" },
      { categoryName: "Stationery", description: "Notebooks, pens and office supplies" },
    ];

    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ categoryName: cat.categoryName });
      if (!exists) {
        await Category.create(cat);
      }
    }

    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      console.log("Seeding initial products catalog...");
      
      const electronics = await Category.findOne({ categoryName: "Electronics" });
      const groceries = await Category.findOne({ categoryName: "Groceries" });
      const beverages = await Category.findOne({ categoryName: "Beverages" });
      const clothing = await Category.findOne({ categoryName: "Clothing & Apparel" });

      await Product.create([
        {
          name: "Wireless Bluetooth Earbuds",
          description: "High quality noise cancelling earphone",
          price: 1499,
          stock: 25,
          category: electronics?._id || null,
          sku: "ELE-101",
        },
        {
          name: "Fresh Whole Milk 1L",
          description: "Pure dairy farm milk",
          price: 66,
          stock: 50,
          category: groceries?._id || null,
          sku: "GRO-201",
        },
        {
          name: "Natural Orange Juice 1L",
          description: "100% natural fruit juice",
          price: 120,
          stock: 30,
          category: beverages?._id || null,
          sku: "BEV-301",
        },
        {
          name: "Organic Honey 500g",
          description: "Pure wild forest honey",
          price: 350,
          stock: 15,
          category: groceries?._id || null,
          sku: "GRO-202",
        },
        {
          name: "Cotton Casual T-Shirt",
          description: "100% breathable cotton t-shirt",
          price: 499,
          stock: 40,
          category: clothing?._id || null,
          sku: "CLO-401",
        },
      ]);
      console.log("Initial categories & products seeded successfully!");
    }
  } catch (err) {
    console.error("Auto-seed error:", err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smallinventorystore");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedInitialData();
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;