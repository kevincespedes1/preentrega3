import express from 'express';
import productManager from '../dao/fs/ProductManager.js';
import { UserController } from '../controllers/user.controller.mdb.js'

const homeRouter = express.Router();
const userController = new UserController()

homeRouter.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        const { limit = 10, page = 1, sort, query } = req.query;
        const allProducts = await productManager.readFile();
        let filteredProducts = allProducts;

        if (query) {
            filteredProducts = allProducts.filter(product =>
                product.title.toLowerCase().includes(query.toLowerCase())
            );
        }
        if (category) {
            filteredProducts = filteredProducts.filter(product => product.category === category);
        }
        if (sort) {
            if (sort === 'price') {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (sort === '-price') {
                filteredProducts.sort((a, b) => b.price - a.price);
            } else if (sort === 'title') {
                filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
            }
        }
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        const exactLimitProducts = paginatedProducts.slice(0, limit);
        const home = 'home';
        const user = req.session.user;
        
        const data = {
            products: exactLimitProducts,
            user
        };
        res.render('index', { home, data, user, exactLimitProducts} );
    } catch (error) {
        console.error('Error:', error); 
        res.status(500).send('Internal Server Error');
    }
});


homeRouter.get('/users', async (req, res) => {
    if (req.session.user && req.session.user.rol === 'admin') {
        const data = await userController.getUsersPaginated(req.query.page || 1, req.query.limit || 50)
        data.pages = []
        for (let i = 1; i <= data.totalPages; i++) data.pages.push(i)

        res.render('users', {
            title: 'Listado de USUARIOS',
            data: data
        })
    } else if (req.session.user) {
        res.redirect('/profile')
    } else {
        res.redirect('/login')
    }
})

export default homeRouter;