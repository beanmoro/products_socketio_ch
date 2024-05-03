import { Router } from "express";
import { ProductManager } from "../managers/product.manager.js";

import path from "path";

const __dirname = import.meta.dirname;

const pManager = new ProductManager(
  path.join(__dirname, "../data/products.json")
);

const realTimeProducts = await pManager.getProducts();

const router = Router();

router.get("/", async (req, res) => {
  const products = await pManager.getProducts();
  return res.render("home", { products });
});


router.get("/realtimeproducts", async (req, res) => {
  return res.render("realTimeProducts", { products : realTimeProducts});
});



export default router;
