
import express from 'express';
import publicRoutesMiddleware from '../middleware/publicRoutesMiddleware.js';
import privateRoutesMiddleware from '../middleware/privateRoutesMiddleware.js';

const router = express.Router();

router.get('/register', publicRoutesMiddleware, (req, res) => {
    res.render('register');
});

router.get('/login', publicRoutesMiddleware, (req, res) => {
    res.render('login'); 
});

router.get('/profile', privateRoutesMiddleware, (req, res) => {
    const user = req.session.user;
    console.log("Datos del usuario conectado:", user);

    if (user) {
        let isAdmin = false;
        if (user.rol === 'admin') {
            isAdmin = true;
        }
        res.render('profile', { user: user, isAdmin: isAdmin });
    } else {
        res.redirect('/login');
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/profile');
        }
        res.redirect('/login');
    });
});

export default router;
    