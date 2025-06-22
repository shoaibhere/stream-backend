import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Teams
export async function getTeams() {
  const client = await clientPromise
  const db = client.db()

  const teams = await db.collection("teams").find({}).sort({ name: 1 }).toArray()
  return JSON.parse(JSON.stringify(teams))
}

export async function getAds() {
  const client = await clientPromise
  const db = client.db()

  const ads = await db.collection("ads").find({}).sort({ name: 1 }).toArray()
  return JSON.parse(JSON.stringify(ads))
}

export async function getAdsCount() {
  const client = await clientPromise
  const db = client.db()

  return await db.collection("ads").countDocuments()
}

export async function getNews() {
  const client = await clientPromise
  const db = client.db()

  const news = await db.collection("news").find({}).sort({ name: 1 }).toArray()
  return JSON.parse(JSON.stringify(news))
}

export async function getTopNews() {
  const client = await clientPromise
  const db = client.db()

  const top_news = await db.collection("top-news").find({}).sort({ name: 1 }).toArray()
  return JSON.parse(JSON.stringify(top_news))
}

export async function getTeamsCount() {
  const client = await clientPromise
  const db = client.db()

  return await db.collection("teams").countDocuments()
}

export async function getTeamById(id: string) {
  const client = await clientPromise
  const db = client.db()

  const team = await db.collection("teams").findOne({ _id: new ObjectId(id) })
  return JSON.parse(JSON.stringify(team))
}

// Channels
export async function getChannels() {
  const client = await clientPromise
  const db = client.db()

  const channels = await db.collection("channels").find({}).sort({ name: 1 }).toArray()
  return JSON.parse(JSON.stringify(channels))
}

export async function getChannelsCount() {
  const client = await clientPromise
  const db = client.db()

  return await db.collection("channels").countDocuments()
}

export async function getChannelById(id: string) {
  const client = await clientPromise
  const db = client.db()

  const channel = await db.collection("channels").findOne({ _id: new ObjectId(id) })
  return JSON.parse(JSON.stringify(channel))
}

// Matches
export async function getMatches() {
  const client = await clientPromise
  const db = client.db()

  const matches = await db.collection("matches").find({}).sort({ createdAt: -1 }).toArray()
  return JSON.parse(JSON.stringify(matches))
}

export async function getMatchesCount() {
  const client = await clientPromise
  const db = client.db()

  return await db.collection("matches").countDocuments()
}

export async function getMatchById(id: string) {
  const client = await clientPromise
  const db = client.db()

  const match = await db.collection("matches").findOne({ _id: new ObjectId(id) })
  return JSON.parse(JSON.stringify(match))
}

export async function getLiveMatches() {
  const client = await clientPromise
  const db = client.db()

  const matches = await db.collection("matches").find({ isLive: true }).sort({ createdAt: -1 }).toArray()

  return JSON.parse(JSON.stringify(matches))
}
export async function getNotificationCampaigns() {
  const client = await clientPromise
  const db = client.db()

  const campaigns = await db.collection("campaigns").find().toArray()

  return JSON.parse(JSON.stringify(campaigns))
}