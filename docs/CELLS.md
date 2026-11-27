# Student Management System: how the cells connect

Each main file is split into numbered "cells" (banner comments). This file shows
which cell talks to which. `style.css`, `db.ts`, `logger.ts`, the home files and
the contact controller and route have no cells.

## The big picture

```
 index.html (structure)  <--- fills / shows / hides --- src/main.ts (behaviour)
        |                                                    |
        | <link>                                             | fetch()
        v                                                    v
   style.css (look)                              backend/src/index.ts (API, port 3000)
                                                             |
                                                    routes -> controllers
                                                             |
                                                             v
                                                   db.ts -> PostgreSQL
```

## index.html cells

| Cell | What it holds | Connected to |
|------|---------------|--------------|
| 1 Head | title, CSS and scripts | loads AdminLTE and icons (CDN), `style.css` and `dist/main.js` (built from `src/main.ts`) |
| 2 Top bar | menu button | AdminLTE shows or hides the sidebar |
| 2b Sidebar menu | page links | main.ts Cells 3 and 10 |
| 3 Home | five dashboard cards | filled by main.ts Cell 6b |
| 3b Marks chart | empty chart box | drawn by main.ts Cell 6c |
| 3c Top and recent | two small tables | filled by main.ts Cell 6d |
| 4 Add / edit form | name, marks, buttons | main.ts Cell 7 |
| 5 Search and sort | search box, sort list | main.ts Cell 6 |
| 6 Student table | summary and rows | filled by main.ts Cell 5 |
| 7 About | text | main.ts Cell 3 |
| 8 Contact | message form | main.ts Cell 9 |

## src/main.ts cells

| Cell | What it does | Called by / calls |
|------|--------------|-------------------|
| 1 Settings | backend address, student shape | used by Cells 4 to 7 |
| 2 Elements | finds parts of the page | used by Cells 5 to 10 |
| 3 Switch pages | `showPage()` | called by Cell 10 |
| 4 Talk to backend | `request()` | called by Cells 6 to 9 |
| 5 Draw table | `showStudents()` | called by Cell 6; buttons call Cells 7 and 8 |
| 6 Load students | `loadStudents()` | called by Cells 7, 8 and 10 |
| 6b Dashboard cards | `loadStats()` | called by Cells 7, 8 and 10 |
| 6c Marks chart | `showChart()` | called by Cell 6b |
| 6d Short lists | `showShortList()` | called by Cell 6b |
| 7 Add or edit | `saveStudent()` | POST or PUT through Cell 4 |
| 8 Delete | `removeStudent()` | DELETE through Cell 4 |
| 9 Contact | `sendContact()` | POST /contact through Cell 4 |
| 10 Start | connects events | the starting point |

## Backend

| Request | Route | Controller (studentcontroller.ts) |
|---------|-------|-----------------------------------|
| GET /students | studentroutes.ts Cell 2 | Cell 4 `getstudents` |
| POST /students | studentroutes.ts Cell 2 | Cell 5 `createStudent` |
| PUT /students/:id | studentroutes.ts Cell 2 | Cell 6 `updateStudent` |
| DELETE /students/:id | studentroutes.ts Cell 2 | Cell 7 `deleteStudent` |
| POST /contact | contactRoutes.ts | contactController.ts `createContact` |

`index.ts`: Cell 1 imports, Cell 2 middleware, Cell 3 routes, Cell 4 error
handler, Cell 5 start. `sql/schema.sql` creates the two tables.

## What happens when you add a student

Click "Add student" -> main.ts Cell 7 -> Cell 4 sends POST /students ->
index.ts Cells 2 and 3 -> studentroutes -> controller Cell 3 checks the input ->
Cell 5 saves it -> main.ts Cell 6 reloads -> Cell 5 redraws the table.

## Adding a new field (checklist)

1. `sql/schema.sql`, and `ALTER TABLE` for a table that already exists.
2. `studentcontroller.ts` Cells 2 to 6.
3. `index.html` Cells 4 and 6.
4. `src/main.ts` Cells 1, 2, 5 and 7.
