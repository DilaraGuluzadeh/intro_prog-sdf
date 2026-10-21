// Vercel build step: creates env.js from the Vercel environment variables.
// Local use:  SUPABASE_URL=... SUPABASE_ANON_KEY=... ADMIN_PASSWORD_HASH=... node generate-env.js
// Get the hash of a password:  node generate-env.js --hash "MY_PASSWORD"
const fs = require("fs");
const crypto = require("crypto");

if (process.argv[2] === "--hash") {
    console.log(crypto.createHash("sha256").update(String(process.argv[3] || ""), "utf8").digest("hex"));
    process.exit(0);
}

// In Vercel it is enough to set ADMIN_PASSWORD — the hash is calculated here (on the Vercel server).
if (!process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD) {
    process.env.ADMIN_PASSWORD_HASH = crypto.createHash("sha256").update(process.env.ADMIN_PASSWORD, "utf8").digest("hex");
}
const need = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "ADMIN_PASSWORD_HASH"];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
    console.error("ERROR: these are missing in Vercel → Settings → Environment Variables: " + missing.map((k) => (k === "ADMIN_PASSWORD_HASH" ? "ADMIN_PASSWORD" : k)).join(", "));
    process.exit(1);
}
const env = Object.fromEntries(need.map((k) => [k, process.env[k].trim()]));
fs.writeFileSync("env.js", "window.__ENV = " + JSON.stringify(env, null, 4) + ";\n", "utf8");
console.log("env.js created (" + need.join(", ") + ")");
