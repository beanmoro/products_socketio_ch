import { Router } from "express";
import { ProductManager } from "../managers/product.manager.js";
import { CartManager } from "../managers/cart.manager.js";

import path from "path";
const __dirname = import.meta.dirname;

const cManager = new CartManager(path.join(__dirname, "../data/carts.json"));

const pManager = new ProductManager(
  path.join(__dirname, "../data/products.json")
);

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { products } = req.body;

    await cManager.createCart({ products });
    res.json({
      ok: true,
    });
  } catch (error) {
    res.json({
      error,
    });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cManager.getCartById(cid);
    const productPromises = cart.products.map(async (p)=>{
      const pData =  await pManager.getProductById(p.id);
      return {
        id: p.id,
        name: pData.title,
        price: pData.price,
        quantity: p.quantity,
      }
    });
    const products = await Promise.all(productPromises);

    res.json({
      ok: true,
      cid: cid,
      products,
    });
  } catch (error) {
    throw error;
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const { quantity } = req.body;

    await cManager.addProduct(cid, pid, quantity);

    res.json({ ok: true });
  } catch (error) {
    res.json({
      error,
    });
  }
});

export default router;