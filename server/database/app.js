// Import necessary modules
import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs/promises'; // Use fs/promises for modern file handling
import cors from 'cors';
import bodyParser from 'body-parser';
import Reviews from './review.js'; // Ensure file extensions are added
import Dealerships from './dealership.js'; // Ensure file extensions are added

const app = express();
const port = 3030;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false})); // Use named imports for body-parser

// Read JSON files using async/await
let reviews_data;
let dealerships_data;
try {
    reviews_data = JSON.parse(await fs.readFile("./data/reviews.json", 'utf8'));
    dealerships_data = JSON.parse(await fs.readFile("./data/dealerships.json", 'utf8'));
} catch (err) {
    console.error("Error reading data files:", err);
    process.exit(1); // Exit if data files can't be read
}

// Enable Mongoose debug mode
mongoose.set('debug', true);

// Connect to MongoDB
try {
    await mongoose.connect("mongodb://mongo_db:27017/", {
        dbName: 'dealershipsDB',
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
    });
    console.log("Connected to MongoDB");

    // Initialize data
    await Reviews.deleteMany({});
    await Reviews.insertMany(reviews_data['reviews']);
    console.log("Reviews initialized");

    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealerships_data.dealerships);
    console.log("Dealerships initialized");
} catch (error) {
    console.error("Error connecting to MongoDB or initializing data:", error);
    process.exit(1); // Exit if connection fails
}

// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API");
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
    try {
        const documents = await Reviews.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({error: 'Error fetching documents'});
    }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
    console.log('fetch dealer')
    try {
        const documents = await Reviews.find({dealership: req.params.id});
        res.json(documents);
    } catch (error) {
        res.status(500).json({error: 'Error fetching documents'});
    }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
    console.log('fetch dealers')
    try {
        const dealers = await Dealerships.find({});
        res.json(dealers);
    } catch (error) {
        res.status(500).json({error: 'Error fetching documents'});
    }
});

// Express route to fetch Dealers by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
    const {state} = req.params;
    console.log('fetch dealer by state')

    try {
        const dealers = await Dealerships.find({state});
        res.json(dealers);
    } catch (error) {
        res.status(500).json({error: 'Error fetching documents'});
    }
});

// Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const dealers = await Dealerships.find({id});
        res.json(dealers);
    } catch (error) {
        res.status(500).json({error: 'Error fetching documents'});
    }
});

// Express route to insert review
app.post('/insert_review', express.raw({type: '*/*'}), async (req, res) => {
    const data = JSON.parse(req.body);
    const documents = await Reviews.find().sort({id: -1});
    const new_id = documents[0]?.id + 1 || 1; // Default to 1 if no reviews exist

    const review = new Reviews({
        id: new_id,
        name: data.name,
        dealership: data.dealership,
        review: data.review,
        purchase: data.purchase,
        purchase_date: data.purchase_date,
        car_make: data.car_make,
        car_model: data.car_model,
        car_year: data.car_year,
    });

    try {
        const savedReview = await review.save();
        res.json(savedReview);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error inserting review'});
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
