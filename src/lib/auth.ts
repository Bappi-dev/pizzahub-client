import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

export const mongoClient = new MongoClient(process.env.DB_URI as string);
await mongoClient.connect();
export const db = mongoClient.db("Pizzahub");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: mongoClient,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ["vendor", "admin", "customer"],
        input: false,
        defaultValue: "customer",
      },
      blocked: {
        type: "boolean",
        input: false,
        defaultValue: false,
      },
      plan: {
        type: ["free", "premium"],
        input: false,
        defaultValue: "free",
      },
      subscriptionPlan: {
        type: ["free", "premium"],
        input: false,
        defaultValue: "free",
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
