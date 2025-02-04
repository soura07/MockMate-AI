/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:npg_7Xxn5hsqUemb@ep-empty-meadow-a48cixrt-pooler.us-east-1.aws.neon.tech/ai-mockmate?sslmode=require',
    }
  };