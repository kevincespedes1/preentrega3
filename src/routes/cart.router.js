import express from 'express';
import { UserController } from '../controllers/user.controller.mdb.js';
import userModel from '../dao/models/user.model.js';
import { isAdmin } from '../middleware/admin.js';
import { productModel } from '../dao/models/products.model.js';
import Ticket from '../dao/models/ticket.model.js'
const userController = new UserController()
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const userId = req.session.user._id;
        const cartData = await userController.obtenerDatosDelCarrito(userId);
        res.render('cart', { cartData, userId });
    } catch (error) {
        console.error('Error al obtener los datos del carrito:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.post('/:cid/purchase', async (req, res) => {
    try {
        const { cid } = req.params;

        const user = await userModel.findById(cid);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const cart = user.cart;

        const productsNotProcessed = [];

        let totalAmount = 0;

        for (const item of cart) {
            const product = await productModel.findById(item.productId);

            if (product && product.price) {
                const quantityInCart = item.quantity;
                const productPrice = product.price;
                const availableStock = product.stock;

                if (availableStock >= quantityInCart) {
                    product.stock -= quantityInCart;
                    await product.save();

                    totalAmount += productPrice * quantityInCart;
                } else {
                    productsNotProcessed.push(item.productId);
                }
            }
        }

        user.cart = user.cart.filter(item => productsNotProcessed.includes(item.productId));
        await user.save();

        const newTicket = new Ticket({
            amount: totalAmount,
            purchaser: user._id
        });

        await newTicket.save();

        res.status(200).json({ success: true, totalAmount, productsNotProcessed, message: 'Compra finalizada correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error al finalizar la compra' });
    }
});



router.delete('/:userId/products/:productId', isAdmin, async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        const productIndex = user.cart.findIndex(item => item.productId._id.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado en el carrito' });
        }

        user.cart.splice(productIndex, 1);

        await user.save();

        return res.status(200).json({ success: true, message: 'Producto eliminado del carrito correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});


router.delete('/:cartId', isAdmin, async (req, res) => {
    try {
        const userId = req.session.user._id;
        const user = await userModel.findById(userId);
        console.log('user all delete', user)
        if (!user) {
            return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
        }

        user.cart = [];
        await user.save();

        return res.status(200).json({ success: true, message: 'Todos los productos han sido eliminados del carrito correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});
export default router;
