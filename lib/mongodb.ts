import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 30000, // Close sockets after 30s of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10s
  tls: true, // Force TLS/SSL
  tlsAllowInvalidCertificates: false, // Reject invalid certs
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10, // Limit connection pool size
  minPoolSize: 2, // Maintain minimum connections
  heartbeatFrequencyMS: 10000, // Check connection health every 10s
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve connection across HMR
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.error("MongoDB connection error:", err);
      throw err;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create new connection without global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((err) => {
    console.error("MongoDB production connection failed:", err);
    throw err;
  });
}

// Export a module-scoped promise to avoid multiple connections
export default clientPromise;