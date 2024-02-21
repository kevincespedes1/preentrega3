import express from 'express';
import ProductManager from '../dao/db/ProductManager.js';
import { UserController } from '../controllers/user.controller.mdb.js'
import isAuthenticated from '../middleware/checkSession.js';


const usersController = new UserController()

const productManager = new ProductManager();

const realTimeRouter = express.Router();

realTimeRouter.get('/',isAuthenticated, async (req, res) => {

  const { limit = 10, page = 1, category, available, sort } = req.query;
  const user = req.session.user;

  const {
    docs: products,
    hasPrevPage,
    hasNextPage,
    nextPage,
    prevPage,
  } = await productManager.getProducts(page, limit, category, available, sort);

const data ={
  user

}
  res.render('index', {
    products,
    page,
    hasPrevPage,
    hasNextPage,
    prevPage,
    nextPage,
    data,
    user
  });
});
realTimeRouter.post('/enviarMensaje', isAuthenticated, async (req, res) => {
  try {
      const userId = req.session.user._id;
      const usuario = await usersController.findById(userId);
      if (usuario.rol === 'usuario') {
          res.status(200).json({ success: true, message: 'Mensaje enviado al chat correctamente' });
      } else {
          res.status(403).json({ success: false, message: 'No tiene permiso para enviar mensajes al chat' });
      }
  } catch (error) {
      console.error('Error al enviar mensaje al chat:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});
export default realTimeRouter;