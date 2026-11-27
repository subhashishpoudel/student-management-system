// ============================================================
// Cell 1: Imports
// Express types and the shared database connection (db.ts).
// ============================================================
import type { Request, Response } from "express";
import { pool } from "../db.js";


// ============================================================
// Cell 2: Student shape and sort choices
// SORT_COLUMNS lists the only columns the list can be sorted by.
// A column name cannot be a $1 placeholder, so we pick it from
// this list and never use the text the visitor typed.
// ============================================================
interface Student {
  id: number;
  full_name: string;
  marks: number;
}

const SORT_COLUMNS: Record<string, string> = {
  id: "id",
  name: "full_name",
  marks: "marks",
};


// ============================================================
// Cell 3: Check the input
// readStudent() returns clean values, or a message saying what
// is wrong. readId() accepts only positive whole numbers.
// Used by Cells 5 and 6 (and readId by Cell 7).
// ============================================================
function readStudent(body: unknown): { full_name: string; marks: number } | string {
  const { full_name, marks } = (body ?? {}) as Record<string, unknown>;

  if (typeof full_name !== "string" || !/\p{L}/u.test(full_name)) {
    return "Name is required and must contain a letter";
  }
  if (full_name.trim().length > 100) {
    return "Name must be 100 characters or fewer";
  }
  if (typeof marks !== "number" || !Number.isInteger(marks) || marks < 0 || marks > 100) {
    return "Marks must be a whole number from 0 to 100";
  }
  return { full_name: full_name.trim(), marks };
}

function readId(text: unknown): number | null {
  const id = Number(text);
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}


// ============================================================
// Cell 4: List students (Read)
// GET /students?search=ra&sort=marks&order=desc
// All three parts are optional.
// ============================================================
export async function getstudents(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const sort = typeof req.query.sort === "string" ? req.query.sort : "id";
  const column = Object.hasOwn(SORT_COLUMNS, sort) ? SORT_COLUMNS[sort] : "id";
  const direction = req.query.order === "desc" ? "DESC" : "ASC";

  const result = await pool.query<Student>(
    `SELECT id, full_name, marks FROM students
     WHERE strpos(lower(full_name), lower($1)) > 0 OR $1 = ''
     ORDER BY ${column} ${direction}, id`,
    [search]
  );
  res.json(result.rows);
}


// ============================================================
// Cell 5: Add a student (Create)
// POST /students   body: { "full_name": "...", "marks": 80 }
// 201 = saved, 400 = bad input.
// ============================================================
export async function createStudent(req: Request, res: Response): Promise<void> {
  const student = readStudent(req.body);
  if (typeof student === "string") {
    res.status(400).json({ error: student });
    return;
  }

  const result = await pool.query<Student>(
    "INSERT INTO students (full_name, marks) VALUES ($1, $2) RETURNING id, full_name, marks",
    [student.full_name, student.marks]
  );
  res.status(201).json(result.rows[0]);
}


// ============================================================
// Cell 6: Change a student (Update)
// PUT /students/5   body: same as Cell 5
// 404 = no student has that id.
// ============================================================
export async function updateStudent(req: Request, res: Response): Promise<void> {
  const id = readId(req.params.id);
  const student = readStudent(req.body);
  if (id === null) {
    res.status(400).json({ error: "Invalid student id" });
    return;
  }
  if (typeof student === "string") {
    res.status(400).json({ error: student });
    return;
  }

  const result = await pool.query<Student>(
    "UPDATE students SET full_name = $1, marks = $2 WHERE id = $3 RETURNING id, full_name, marks",
    [student.full_name, student.marks, id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json(result.rows[0]);
}


// ============================================================
// Cell 7: Remove a student (Delete)
// DELETE /students/5
// 204 = deleted (nothing to send back).
// ============================================================
export async function deleteStudent(req: Request, res: Response): Promise<void> {
  const id = readId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Invalid student id" });
    return;
  }

  const result = await pool.query("DELETE FROM students WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.status(204).end();
}
