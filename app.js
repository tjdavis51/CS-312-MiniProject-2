import express from 'express';
import axios from 'axios';

// start express and declare the port
const app = express();
const PORT = 3000;

// middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

// configure the view engine for ejs
app.set('view engine', 'ejs');

// start the HTTP methods

// show the index file initially
app.get('/', (req, res) => {
    res.render('index', { priceData: null, error: null });
});

// POST check now using CoinGecko API
app.post('/check', async (req, res) => {
    // take the symbol and guard using the empty string, otherwise trim whitespace and make lowercase
    const id = (req.body.symbol || '').trim().toLowerCase();
    // now try to get the query information from CoinGecko
    try {
        // await will pause until the response comes back
        const coinGeckoResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price',
        {
            params: {
            ids: id,
            vs_currencies: 'usd'
            }
        }
    );

    // look up the returned price
    const data = coinGeckoResponse.data;
    // make sure the data at the id exists and that it has a usd field
    if (!data[id] || !data[id].usd) {
        // if either does not exist then throw an error
        throw new Error(`No price found for "${id}"`);
    }

    // build a small object to pass to index
    const priceData = {
        id,
        usd: data[id].usd
    };

    // render in the information
    res.render('index', { priceData, error: null });
    }
    
    // if the error is thrown then display the error message
    catch (err) {
        res.render('index', { priceData: null, error: err.message });
    }
});

// start the server
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);