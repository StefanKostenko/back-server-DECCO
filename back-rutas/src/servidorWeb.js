const path = require("path");
const express = require("express");
const http = require("http");
const routes = require("./rutas");
const cors = require("cors");

const port = process.env.PORT || 5554;
class WebServer {
  static async _inicializar() {
    const app = express();

    // db settings

    // settings
    // app.set('view engine', 'ejs');
    // app.set('views', path.join(__dirname, 'views'));
    // app.set('port', process.env.WSPORT || 3000);

    // middlewares
    app.use((req, res, next) => {
      // console.log(`${req.url} - ${req.method}`);
      next();
    });
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // routes
    app.use(cors());
    app.use("/api", routes);

    // satic files
    app.use(express.static(path.join(__dirname, "public")));

    // WebSocket socket.IO
    const server = http.createServer(app);

    // bootstraping the app
    server.listen(port, "0.0.0.0", () =>
      console.log(`Servidor Web en el puerto ${port}`)
    );

    return { server, app };
  }

  static getNombre() {
    return "Servidor Web";
  }
}

// Invocar _inicializar automáticamente
WebServer._inicializar();

module.exports = WebServer;
