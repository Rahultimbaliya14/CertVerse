require("dotenv").config({ path: ".env" });
const router = require("./router/api");
const routerCertverseAuth = require("./router/certverseauth");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = require("express")();

app.use((req, res, next) => {

  const isDev = process.env.DEVELOPMENT === 'true';
  if (!isDev) {
    const origin = req.headers.origin;
    if (!origin) {
      return res.status(403).send('Direct browser access not allowed');
    }
  }
  
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});


const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['https://rahultimbaliya14.github.io'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman or browser direct access)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With', 'Authorization'],
};

app.use(cors(corsOptions));


app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/api', router);
app.use('/certverse/auth', routerCertverseAuth);
module.exports = app;