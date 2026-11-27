import type { Request, Response } from "express";
import { pool } from "../db.js";

export async function createContact(req: Request, res: Response): Promise<void> {
  const { name, message } = req.body ?? {};

  // reject missing or blank values
  if (
    typeof name !== "string" || typeof message !== "string" ||
    !name.trim() || !message.trim()
  ) {
    res.status(400).json({ error: "Name and message are required" });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      "INSERT INTO contacts(name, message) VALUES ($1,$2) RETURNING *",
      [name.trim(), message.trim()]
    );

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}