import { MongoClient, MongoClientOptions, ServerApiVersion } from "mongodb";

// Check for MongoDB URI
if (!process.env.MONGODB_URI) {
  throw new Error('Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

const options: MongoClientOptions = {
  // Timeouts
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,

  // SSL/TLS
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,

  // Pooling
  maxPoolSize: 15,
  minPoolSize: 3,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 10000,

  // Retry logic
  retryWrites: true,
  retryReads: true,

  // Monitoring
  heartbeatFrequencyMS: 10000,
  monitorCommands: process.env.NODE_ENV === 'development',

  // API versioning (optional but recommended)
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;