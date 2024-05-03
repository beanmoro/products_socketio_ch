import express from "express";
import handlebars from "express-handlebars";
import { Server } from 'socket.io';
import path from "path";
import productsRoutes from "./router/products.route.js";
import cartsRoutes from "./router/carts.route.js";
import viewsRoutes from "./router/views.route.js";

import { ProductManager } from "./managers/product.manager.js";

const app = express();
const PORT = process.env.PORT || 8080;
const __dirname = import.meta.dirname;

const httpServer = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


const pManager = new ProductManager(
  path.join(__dirname, "/data/products.json")
);

const realTimeProducts = await pManager.getProducts();


const socketServer = new Server(httpServer);

socketServer.on('connection', socket => {
  console.log("Nuevo cliente conectado!")

  const prdcts = realTimeProducts;


  socket.on('add', data=>{
      const {title, description, price, stock } = data
      const pid = realTimeProducts.length;
      prdcts.push({ title, description, price, stock, id: pid})
      socket.emit('updated_data', prdcts)
  });

  socket.on('remove', data=>{
      const { id } = data
      console.log(id)
      const index = prdcts.findIndex((e) => e.id === parseInt(id));
      if (index !== -1) {
        prdcts.splice(index, 1);
      }
      socket.emit('updated_data', prdcts);
  })
  

})


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, "public")));

app.use("/", viewsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/carts", cartsRoutes);






export default httpServer;