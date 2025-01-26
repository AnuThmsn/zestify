const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" folder
app.use(express.static('public'));

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Aleenack@123-', // Replace with your MySQL password
    database: 'event'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to the database!');
});

// Handle form submissions (POST request to /register)
app.post('/register', async (req, res) => {
    const { username, password, college } = req.body;

    // Validation checks
    if (!username || !password || !college) {
        return res.send('All fields are required!');
    }

    // Simple password validation
    if (password.length < 6 || !/[A-Z]/.test(password)) {
        return res.send('Password must be at least 6 characters long and contain at least one capital letter.');
    }

    try {
        // Hash password before saving to database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert data into the database
        const query = 'INSERT INTO users (username, password, college) VALUES (?, ?, ?)';
        db.query(query, [username, hashedPassword, college], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.send('Username is already taken!');
                }
                console.error('Error inserting data:', err);
                return res.status(500).send('Internal server error.');
            }

            // Redirect to login page after successful registration
            res.redirect('/login.html'); // Ensure you have a login.html file in your public folder
        });
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Internal server error.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
