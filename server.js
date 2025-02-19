const port = process.env.PORT || 4000;

// Add CORS configuration for production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://your-truehost-domain.com' 
        : 'http://localhost:4000',
    credentials: true
};
app.use(cors(corsOptions)); 