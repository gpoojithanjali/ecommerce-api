const express = require('express');
const router = express.Router();
const { getShippingStatus } = require("../services/shippingService");
const { getRecommendations } = require("../services/recommendationService");
const pool = require('../db');  // Import MySQL connection

/**
 * @swagger
 * /customers/{customerId}/orders:
 *   get:
 *     summary: Get all orders for a specific customer
 *     tags: 
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the customer
 *     responses:
 *       200:
 *         description: List of orders for the customer
 *       500:
 *         description: Database query failed
 */
router.get('/customers/:customerId/orders', async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE customer_id = ?', [req.params.customerId]);
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database query failed' });
    }
});

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get details of a specific order
 *     tags: 
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/orders/:orderId', async (req, res) => {
    try {
        const [order] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
        if (order.length === 0) return res.status(404).json({ message: 'Order not found' });
        res.json(order[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: 
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - product_id
 *               - quantity
 *             properties:
 *               customer_id:
 *                 type: integer
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               total_price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Database query failed
 */
router.post('/orders', async (req, res) => {
    const { customer_id, product_id, quantity, total_price } = req.body;

    if (!customer_id || !product_id || !quantity) {
        return res.status(400).json({ message: 'Missing required fields: customer_id, product_id, quantity' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO orders (customer_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)',
            [customer_id, product_id, quantity, total_price]
        );

        res.status(201).json({ message: 'Order created successfully', orderId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database query failed' });
    }
});

/**
 * @swagger
 * /orders/{orderId}:
 *   put:
 *     summary: Update an existing order
 *     tags: 
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               total_price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order updated
 *       500:
 *         description: Server error
 */
router.put('/orders/:orderId', async (req, res) => {
    try {
        const { quantity, total_price } = req.body;
        await pool.query('UPDATE orders SET quantity = ?, total_price = ? WHERE id = ?', 
            [quantity, total_price, req.params.orderId]);
        res.json({ message: 'Order updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /orders/{orderId}:
 *   delete:
 *     summary: Delete an order
 *     tags: 
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order deleted
 *       500:
 *         description: Server error
 */
router.delete('/orders/:orderId', async (req, res) => {
    try {
        await pool.query('DELETE FROM orders WHERE id = ?', [req.params.orderId]);
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /orders/{orderId}/tracking:
 *   get:
 *     summary: Get shipping status from third-party API
 *     tags: 
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tracking status retrieved
 *       500:
 *         description: External API error
 */
router.get('/orders/:orderId/tracking', async (req, res) => {
    try {
        const trackingInfo = await getShippingStatus(req.params.orderId);
        res.json(trackingInfo);
    } catch (error) {
        console.error("Error fetching tracking details:", error);
        res.status(500).json({ message: 'Failed to fetch tracking details' });
    }
});

/**
 * @swagger
 * /customers/{customerId}/recommendations:
 *   get:
 *     summary: Get product recommendations based on order history
 *     tags: 
 *       - Recommendations
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recommended products
 *       500:
 *         description: External API error
 */
router.get('/customers/:customerId/recommendations', async (req, res) => {
    try {
        const recommendations = await getRecommendations(req.params.customerId);
        res.json(recommendations);
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
});


module.exports = router;
