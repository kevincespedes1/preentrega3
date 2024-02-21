import express from 'express';
import cartManager from '../dao/fs/cartManager.js';
import fs from 'fs'; 
import { UserController } from '../controllers/user.controller.mdb.js'
import UserModel from '../dao/models/user.model.js';
import { isAdmin } from '../middleware/admin.js';
const usersController = new UserController()
const router = express.Router();

// Ruta para agregar un producto al carrito
router.post('/:cid/product/:pid',isAdmin, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        await cartManager.addToCart(cartId, productId);

        res.status(200).json({ message: 'Producto agregado al carrito con éxito' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Ruta para crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();

        res.status(201).json(newCart);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Ruta para obtener el contenido del carrito
router.get('/:cid/products', async (req, res) => {
    try {
        const cartId = req.params.cid;

        const cartContents = await cartManager.getCartContents(cartId);

        res.status(200).json(cartContents);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// terminamos aca en fs

// aca obtengo el carrito

router.get('/', async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await UserModel.findById(userId).populate('cart.productId');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.status(200).json({ success: true, cart: user.cart });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});
// empezamos en db


router.post('/add/:productId/:quantity',isAdmin, async (req, res) => {
    try {
        const { productId, quantity } = req.params;
        const userId = req.session.user._id; 
        console.log(userId)

        const parsedQuantity = parseInt(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).send('La cantidad debe ser un número entero positivo');
        }
        const result = await usersController.addToCart(userId, productId, parsedQuantity);
        console.log('resultadooo', result)
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});
// cart
router.delete('/:cid/products/:pid', isAdmin, async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const user = await UserModel.findById(cid);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const productIndex = user.cart.findIndex(item => item._id.toString() === pid);
        console.log('productIndex:', productIndex)

        if (productIndex === -1) { 
            return res.status(404).json({
                success: false, message: 'Producto no encontrado en el carrito'
            });
        }

        user.cart.splice(productIndex, 1);

        await user.save();

        return res.status(200).json({ success: true, message: 'Producto eliminado del carrito correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

router.put("/:cid/product/:pid",isAdmin, async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;

        if (!cid || !pid)
            return res.status(400).send({
                status: "error",
                message: { error: `Incomplete values` },
            });

        let updatedProductFromCart = await cartManager.updateProductFromCart(
            cid,
            pid,
            quantity
        );

        if (updatedProductFromCart.modifiedCount === 0) {
            return res.status(404).send({
                status: "error",
                error: `Could not update product from cart. No product ID ${pid} found in cart ID ${cid}.`,
            });
        }

        return res.status(200).send({
            status: "success",
            payload: updatedProductFromCart,
        });
    } catch (error) {
        console.log(`Cannot update cart with mongoose ${error}`);
    }
});
router.put("/:cid",isAdmin, async (req, res) => {
    try {
        const { cid } = req.params;
        const products = req.body;

        if (!cid || !products)
            return res.status(400).send({
                status: "error",
                message: { error: `Incomplete values` },
            });

        let updatedCart = await cartManager.updateCart(cid, products);

        if (updatedCart.modifiedCount === 0) {
            return res.status(404).send({
                status: "error",
                error: `Could not update cart. No cart found with ID ${cid} in the database`,
            });
        }

        return res.status(200).send({
            status: "success",
            payload: updatedCart,
        });
    } catch (error) {
        console.log(`Cannot delete cart with mongoose ${error}`);
    }
});
export default router;
