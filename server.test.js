const request = require('supertest');
const express = require('express');
const { app, sequelize, User} = require('./server'); // Cambia esto según tu configuración

// Inicializar la base de datos antes de las pruebas
beforeAll(async () => {
    await sequelize.sync({ force: true }); // Resetear base de datos
});

afterAll(async () => {
    await sequelize.close(); // Cerrar conexión a la base de datos
});

describe('User Registration and Authentication', () => {
    it('should register a new user', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'testuser',
                password: 'password123',
                email: 'test@example.com',
                city: 'Test City',
                region: 'Test Region',
                postalcode: '12345',
                role: 'admin',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Usuario registrado');
    });

    it('should register a new user', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'testuser2',
                password: 'password123',
                email: 'test2@example.com',
                city: 'Test City',
                region: 'Test Region',
                postalcode: '12345',
                role: 'user',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Usuario registrado');
    });

    

    it('should login a user', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
    });
});

describe('User Data Retrieval', () => {
    let token;

    beforeAll(async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'password123' });
        token = response.body.token;
    });

    it('should retrieve user data for admin', async () => {
        // Primero, creamos un admin para la prueba
        await User.create({
            username: 'adminuser',
            password: 'adminpass',
            email: 'admin@example.com',
            role: 'admin',
        });

        const response = await request(app)
            .get('/user/adminuser')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe('adminuser');
    });

    it('should return 403 for non-admin', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'testuser2', password: 'password123' });

        const response2 = await request(app)
            .get('/user/adminuser')
            .set('Authorization', `Bearer ${token}`);

        expect(response2.statusCode).toBe(403);
    });
});

describe('User Update', () => {
    let token;

    beforeAll(async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'password123' });
        token = response.body.token;
    });

    it('should update user data for admin', async () => {
        await User.create({
            username: 'userToUpdate',
            password: 'userpass',
            email: 'user@example.com',
            role: 'user',
        });

        const response = await request(app)
            .put('/user/update/userToUpdate')
            .set('Authorization', `Bearer ${token}`)
            .send({
                email: 'updated@example.com',
                city: 'Updated City',
                region: 'Updated Region',
                postalcode: '54321',
                role: 'user',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Usuario actualizado exitosamente');
    });
});

describe('User Deletion', () => {
    let adminToken;

    beforeAll(async () => {
        const adminResponse = await request(app)
            .post('/register')
            .send({
                username: 'adminuser',
                password: 'adminpass',
                email: 'admin@example.com',
                role: 'admin',
            });

        const response = await request(app)
            .post('/login')
            .send({ username: 'adminuser', password: 'adminpass' });
        adminToken = response.body.token;

        await User.create({
            username: 'userToDelete',
            password: 'userpass',
            email: 'delete@example.com',
            role: 'user',
        });
    });

    it('should delete a user', async () => {
        const response = await request(app)
            .delete('/user/delete/userToDelete')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Usuario eliminado exitosamente');
    });
});
