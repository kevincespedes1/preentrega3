import UserModel from '../dao/models/user.model.js'
import { productModel } from "../dao/models/products.model.js";

export class UserController {
    constructor() {
    }


    async addToCart(userId, productId) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return { success: false, message: 'Usuario no encontrado' };
            }
            console.log('ID del producto:', productId);
            console.log('Carrito del usuario:', user.cart);
            const existingProduct = user.cart.find(item => item.productId._id.toString() === productId);
            console.log('existencia del producto', existingProduct)
            if (existingProduct) {
                existingProduct.quantity++;
            } else {
                user.cart.push({ productId, quantity: 1 });
            }

            await user.save();

            return { success: true, message: 'Producto agregado al carrito correctamente' };
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            return { success: false, message: 'Error interno del servidor' };
        }
    }

    async removeFromCart(userId, cartItemId, productId) {
        try {
            const user = await UserModel.findById(userId);

            if (!user) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            user.cart = user.cart.filter(item => item._id.toString() !== cartItemId && item.productId.toString() !== productId);

            await user.save();

            return { success: true, message: 'Producto eliminado del carrito correctamente' };
        } catch (error) {
            console.error('Error al eliminar producto del carrito:', error);
            return { success: false, message: 'Error interno del servidor' };
        }
    }


    async getCart(userId) {
        try {
            const user = await UserModel.findById(userId).populate('cart.productId');
            if (!user) {
                return { success: false, message: 'Usuario no encontrado' };
            }
            return { success: true, cart: user.cart };
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            return { success: false, message: 'Error interno del servidor' };
        }
    }

    async obtenerDatosDelCarrito(userId) {
        try {
            const user = await UserModel.findById(userId);

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            const cartData = [];
            for (const item of user.cart) {
                const product = await productModel.findById(item.productId);

                if (!product) {
                    throw new Error('Producto no encontrado');
                }   

                cartData.push({
                    product: {
                        _id: product._id,
                        title: product.title,
                        category: product.category,
                        description: product.description,
                        price: product.price,
                        thumbnail: product.thumbnail,
                        code: product.code,
                        stock: product.stock,
                        status: product.status
                    },
                    quantity: item.quantity
                });
            }
            return cartData;
        } catch (error) {
            throw new Error('Error al obtener datos del carrito');
        }
    }




    async getUsers() {
        try {
            const users = await UserModel.find().lean()
            return users
        } catch (err) {
            return err.message
        }

    }

    async getUsersPaginated(page, limit) {
        try {
            return await UserModel.paginate(
                { rol: 'usuario' },
                { offset: (page * 1) - 0, limit: 5, lean: true }
            )
        } catch (err) {
            return err.message
        }
    }
}

