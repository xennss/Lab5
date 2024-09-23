const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = 5432;

var user = {};

// Middleware
app.use(bodyParser.json());

// Configura Sequelize
const sequelize = new Sequelize('mynewdatabase', 'user', 'password', {
    host: 'localhost',
    dialect: 'postgres',
});



// Modelo de usuario
// Modelo de usuario
const User = sequelize.define('user', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
    },
    region: {
        type: DataTypes.STRING,
    },
    postalcode: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user',
        validate: {
            isIn: [['admin', 'user', 'manager', 'sales']],
        },
    },
});

// Sincronizar la base de datos
sequelize.sync({ alter: true });

// Ruta para registrar un nuevo usuario
// Ruta para registrar un nuevo usuario
app.post('/register', async (req, res) => {
    const { username, password, email, city, region, postalcode, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({
            username,
            password: hashedPassword,
            email,
            city,
            region,
            postalcode,
            role,
        });
        res.status(201).json({ message: 'Usuario registrado', user });
    } catch (error) {
        res.status(400).json({ error: 'El usuario ya existe o datos inválidos' });
    }
});


// Ruta para login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    user = await User.findOne({ where: { username } });

    if (!user) {
        return res.status(400).send('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send('Contraseña incorrecta');
    }

    const token = jwt.sign({ username }, 'tu_clave_secreta', { expiresIn: '1h' });
    res.json({ token });
});

// Ruta para obtener datos de un usuario
app.get('/user/:username', async (req, res) => {
    const { username } = req.params;
        console.log("guardado:" , user.username, "recibido:", username);
        // Verifica si el usuario es admin o manager
        if (user.role !== 'admin' && user.role !== 'manager' && user.username !== username) {
            return res.sendStatus(403); // Sin permisos
        }

        try {
            const targetUser = await User.findOne({ where: { username } });
            if (!targetUser) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json({ 
                username: targetUser.username,
                email: targetUser.email,
                city: targetUser.city,
                region: targetUser.region,
                postalcode: targetUser.postalcode,
                role: targetUser.role 
            });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
});

// Ruta para obtener lista de usuarios
app.get('/list', async (req, res) => {
        // Verifica si el usuario es admin o manager
        if (user.role !== 'admin' && user.role !== 'manager') {
            return res.sendStatus(403); // Sin permisos
        }

        try {
            
            const users = await User.findAll();
            console.log(users);
            const userList = users.map(u => ({
                id: u.id,
                username: u.username,
                email: u.email,
            }));

            res.json(userList);

        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
});

// Ruta para modificar los datos de un usuario
app.put('/user/update/:username', async (req, res) => {
    const { username } = req.params;
    const { email, city, region, postalcode, role } = req.body;


        // Verifica si el usuario es admin o manager
        if (user.role !== 'admin' && user.role !== 'manager' && user.username !== username) {
            return res.sendStatus(403); // Sin permisos
        }

        try {
            // Busca al usuario a actualizar
            const targetUser = await User.findOne({ where: { username } });
            if (!targetUser) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Actualiza la información del usuario
            await targetUser.update({
                email,
                city,
                region,
                postalcode,
                role,
            });

            res.json({ message: 'Usuario actualizado exitosamente', user: targetUser });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
});

app.delete('/user/delete/:username', async (req, res) => {
    const { username } = req.params;

        // Verifica si el usuario es admin
        if (user.role !== 'admin') {
            return res.sendStatus(403); // Sin permisos
        }

        try {
            // Busca al usuario a eliminar
            const targetUser = await User.findOne({ where: { username } });
            if (!targetUser) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Elimina el usuario
            await targetUser.destroy();

            res.json({ message: 'Usuario eliminado exitosamente' });
        } catch (error) {
            console.error(error); // Para debug
            res.status(500).json({ error: 'Error interno del servidor' });
        }
});



// Ruta protegida de ejemplo
app.get('/protected', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'tu_clave_secreta', (err, user) => {
        if (err) return res.sendStatus(403);
        res.json({ message: 'Acceso permitido', user });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Exporta la app y sequelize
module.exports = { app, sequelize, User};
