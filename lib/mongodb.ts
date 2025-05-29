import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  // Connection timeouts
  serverSelectionTimeoutMS: 10000, // 10 seconds
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  
  // SSL/TLS Configuration
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  
  // Connection pooling
  maxPoolSize: 15,
  minPoolSize: 3,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 10000,
  
  // Retry logic (using supported options)
  retryWrites: true,
  retryReads: true,
  
  // Monitoring
  heartbeatFrequencyMS: 10000,
  monitorCommands: process.env.NODE_ENV === 'development'
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function createMongoClient() {
  const client = new MongoClient(uri, options);
  
  try {
    console.log('Attempting MongoDB connection...');
    await client.connect();
    console.log('MongoDB connected successfully');
    return client;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
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
  // Production: new connection
  clientPromise = createMongoClient();
}

export default clientPromise;