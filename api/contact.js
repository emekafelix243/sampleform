// api/contact.js
const { Pool } = require("pg");

const db = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/contact_form",
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
});

module.exports = async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { name, email, location } = req.body;

      const query = `
        INSERT INTO contacts (name, email, location, date)
        VALUES ($1, $2, $3, NOW())
      `;
      await db.query(query, [name, email, location]);

      res.status(200).send(`
        <h2>Thank you, ${name}!</h2>
        <p>Your contact has been saved successfully.</p>
        <a href="/">Back to Form</a>
      `);
    } catch (err) {
      console.error(err);
      res.status(500).send("Database error: " + err.message);
    }
  } else if (req.method === "GET") {
    try {
      const { rows } = await db.query("SELECT * FROM contacts ORDER BY date DESC");
      const html = `
        <h2>Saved Contacts</h2>
        <ul>
          ${rows.map(
            (c) =>
              `<li><strong>${c.name}</strong> (${c.email}) - ${c.location} [${new Date(
                c.date
              ).toLocaleString()}]</li>`
          ).join("")}
        </ul>
        <a href="/">Back</a>
      `;
      res.status(200).send(html);
    } catch (err) {
      res.status(500).send("Error fetching contacts");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
};
