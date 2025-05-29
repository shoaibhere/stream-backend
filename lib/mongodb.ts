import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  // Connection timeouts
  serverSelectionTimeoutMS: 10000, // Increased to 10s
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  
  // SSL/TLS Configuration (critical for Railway)
  tls: true,
  minTLSVersion: 'TLSv1.2', // Explicitly require TLS 1.2
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  
  // Connection pooling
  maxPoolSize: 15,
  minPoolSize: 3,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 10000,
  
  // Retry logic
  retryWrites: true,
  retryReads: true,
  retryDelay: 1000,
  maxRetryAttempts: 3,
  
  // Monitoring
  heartbeatFrequencyMS: 10000,
  monitorCommands: true
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Enhanced connection function with retry logic
async function createMongoClient() {
  const client = new MongoClient(uri, options);
  
  try {
    console.log('Attempting MongoDB connection...');
    await client.connect();
    console.log('MongoDB connected successfully');
    return client;
  } catch (error) {
    console.error('Initial connection failed, retrying...', error);
    
    // Implement manual retry
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = error;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Retry attempt ${attempts}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        await client.connect();
        return client;
      } catch (retryError) {
        lastError = retryError;
        console.error(`Retry attempt ${attempts} failed:`, retryError);
      }
    }
    
    console.error('All connection attempts failed');
    throw lastError;
  }
}

if (process.env.NODE_ENV === "development") {
  // Development: use global variable to preserve connection
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createMongoClient();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Production: new connection with enhanced error handling
  clientPromise = createMongoClient();
}

// Export the connection promise
export default clientPromise;