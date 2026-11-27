// ============================================================
// Cell 1: Settings and shapes
// Where the backend lives, and what one student looks like.
// ============================================================
const API_BASE = "http://127.0.0.1:3000";

interface Student {
  id: number;
  full_name: string;
  marks: number | null;
}


// ============================================================
// Cell 2: Find the page elements
// get() stops with a clear error if an id is missing in
// index.html.
// ============================================================
function get<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element as T;
}

const studentForm = get<HTMLFormElement>("student-form");
const studentName = get<HTMLInputElement>("student-name");
const studentMarks = get<HTMLInputElement>("student-marks");
const saveButton = get<HTMLButtonElement>("student-save");
const cancelButton = get<HTMLButtonElement>("student-cancel");
const formTitle = get<HTMLHeadingElement>("form-title");
const studentStatus = get<HTMLParagraphElement>("student-status");
const searchInput = get<HTMLInputElement>("search");
const sortSelect = get<HTMLSelectElement>("sort");
const summary = get<HTMLParagraphElement>("summary");
const studentRows = get<HTMLTableSectionElement>("student-rows");
const statTotal = get<HTMLHeadingElement>("stat-total");
const statAverage = get<HTMLHeadingElement>("stat-average");
const statHighest = get<HTMLHeadingElement>("stat-highest");
const statsStatus = get<HTMLParagraphElement>("stats-status");
const statPassed = get<HTMLHeadingElement>("stat-passed");
const statFailed = get<HTMLHeadingElement>("stat-failed");
const marksChart = get<HTMLDivElement>("marks-chart");
const topRows = get<HTMLTableSectionElement>("top-rows");
const recentRows = get<HTMLTableSectionElement>("recent-rows");


// ============================================================
// Cell 3: Switch pages
// Shows the section named in the address (#students) and
// highlights its menu link. Works after a reload too.
// ============================================================
function showPage(): void {
  const wanted = location.hash.slice(1);
  const sections = document.querySelectorAll<HTMLElement>("main section");
  const exists = Array.prototype.some.call(sections, (s: HTMLElement) => s.id === wanted);
  const page = exists ? wanted : "home";

  sections.forEach((section) => {
    section.hidden = section.id !== page;
  });
  document.querySelectorAll<HTMLAnchorElement>("#navbar a").forEach((link) => {
    link.classList.toggle("active", link.hash === `#${page}`);
  });
}


// ============================================================
// Cell 4: Talk to the backend
// Every request goes through here. If it fails, it throws an
// Error carrying the backend's message.
// ============================================================
async function request(path: string, method = "GET", body?: unknown): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(API_BASE + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the backend. Is it running?");
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? `Request failed: ${response.status}`);
  }
  return response;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}


// ============================================================
// Cell 5: Draw the table
// textContent shows names as plain text, so a name can never
// run as HTML. Buttons call Cell 7 (edit) and Cell 8 (delete).
// ============================================================
function makeButton(label: string, style: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `btn btn-sm ${style}`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function showStudents(students: Student[]): void {
  studentRows.replaceChildren();

  students.forEach((student) => {
    const row = studentRows.insertRow();
    row.insertCell().textContent = String(student.id);
    row.insertCell().textContent = student.full_name;
    row.insertCell().textContent = String(student.marks ?? "-");
    row.insertCell().append(
      makeButton("Edit", "btn-outline-primary", () => startEdit(student)),
      makeButton("Delete", "btn-outline-danger", () => removeStudent(student)),
    );
  });

  const marks = students.map((s) => s.marks).filter((m): m is number => m !== null);
  const average = marks.reduce((sum, m) => sum + m, 0) / marks.length;
  summary.textContent = students.length === 0
    ? "No students found."
    : `Students shown: ${students.length}` + (marks.length ? `, average marks: ${average.toFixed(1)}` : "");
}


// ============================================================
// Cell 6: Load students
// Sends the search box and sort choice to the backend.
// latestLoad ignores an older reply that arrives late.
// ============================================================
let latestLoad = 0;

async function loadStudents(): Promise<void> {
  const thisLoad = ++latestLoad;
  const [sort, order] = sortSelect.value.split(":");
  const query = new URLSearchParams({ search: searchInput.value, sort, order });

  try {
    const response = await request(`/students?${query}`);
    const students = (await response.json()) as Student[];
    if (thisLoad === latestLoad) showStudents(students);
  } catch (error) {
    if (thisLoad !== latestLoad) return;
    studentRows.replaceChildren();
    summary.textContent = messageOf(error);
  }
}


// ============================================================
// Cell 6b: Dashboard cards
// Loads ALL students (no search), fills the five cards, then
// calls Cells 6c and 6d. Change PASS_MARK here and also the
// two card labels in index.html Cell 3.
// ============================================================
const PASS_MARK = 40;

async function loadStats(): Promise<void> {
  try {
    const response = await request("/students");
    const students = (await response.json()) as Student[];
    const marks = students.map((s) => s.marks).filter((m): m is number => m !== null);
    const total = marks.reduce((sum, m) => sum + m, 0);

    statTotal.textContent = String(students.length);
    statAverage.textContent = marks.length ? (total / marks.length).toFixed(1) : "-";
    statHighest.textContent = marks.length ? String(Math.max(...marks)) : "-";
    statPassed.textContent = String(marks.filter((m) => m >= PASS_MARK).length);
    statFailed.textContent = String(marks.filter((m) => m < PASS_MARK).length);
    statsStatus.textContent = "";

    showChart(marks);
    const best = students
      .filter((s) => s.marks !== null)
      .sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0) || a.id - b.id);
    showShortList(topRows, best.slice(0, 5));
    showShortList(recentRows, [...students].sort((a, b) => b.id - a.id).slice(0, 5));
  } catch (error) {
    [statTotal, statAverage, statHighest, statPassed, statFailed].forEach((box) => {
      box.textContent = "-";
    });
    marksChart.replaceChildren();
    topRows.replaceChildren();
    recentRows.replaceChildren();
    statsStatus.textContent = messageOf(error);
  }
}


// ============================================================
// Cell 6c: Marks chart
// Counts the students in each range and draws a bar whose
// width is that range's share of all marked students.
// ============================================================
const MARK_RANGES = [
  { label: "0 to 39", min: 0, max: 39, color: "bg-danger" },
  { label: "40 to 59", min: 40, max: 59, color: "bg-warning" },
  { label: "60 to 79", min: 60, max: 79, color: "bg-info" },
  { label: "80 to 100", min: 80, max: 100, color: "bg-success" },
];

function showChart(marks: number[]): void {
  marksChart.replaceChildren();

  MARK_RANGES.forEach((range) => {
    const count = marks.filter((m) => m >= range.min && m <= range.max).length;

    const label = document.createElement("div");
    label.className = "d-flex justify-content-between";
    const name = document.createElement("span");
    name.textContent = range.label;
    const total = document.createElement("strong");
    total.textContent = String(count);
    label.append(name, total);

    const track = document.createElement("div");
    track.className = "progress mb-3";
    track.setAttribute("aria-hidden", "true"); // the label already says it
    const bar = document.createElement("div");
    bar.className = `progress-bar ${range.color}`;
    bar.style.width = `${marks.length ? (count / marks.length) * 100 : 0}%`;
    track.append(bar);

    marksChart.append(label, track);
  });
}


// ============================================================
// Cell 6d: Short student lists
// Used for "Top 5" and "Recently added".
// ============================================================
function showShortList(body: HTMLTableSectionElement, students: Student[]): void {
  body.replaceChildren();

  if (students.length === 0) {
    const cell = body.insertRow().insertCell();
    cell.colSpan = 3;
    cell.textContent = "No students yet.";
    return;
  }

  students.forEach((student) => {
    const row = body.insertRow();
    row.insertCell().textContent = String(student.id);
    row.insertCell().textContent = student.full_name;
    row.insertCell().textContent = String(student.marks ?? "-");
  });
}


// ============================================================
// Cell 7: Add or edit
// editingId is null while adding, or the id being edited.
// ============================================================
let editingId: number | null = null;

function resetForm(): void {
  editingId = null;
  studentForm.reset();
  formTitle.textContent = "Add a student";
  saveButton.textContent = "Add student";
  cancelButton.hidden = true;
}

function startEdit(student: Student): void {
  editingId = student.id;
  studentName.value = student.full_name;
  studentMarks.value = String(student.marks ?? "");
  formTitle.textContent = `Edit student ${student.id}`;
  saveButton.textContent = "Save changes";
  cancelButton.hidden = false;
  studentStatus.textContent = "";
  studentName.focus();
}

async function saveStudent(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const body = { full_name: studentName.value, marks: studentMarks.valueAsNumber };
  saveButton.disabled = true; // stops a double click adding twice

  try {
    if (editingId === null) {
      await request("/students", "POST", body);
      studentStatus.textContent = "Student added.";
    } else {
      await request(`/students/${editingId}`, "PUT", body);
      studentStatus.textContent = "Changes saved.";
    }
    resetForm();
    await Promise.all([loadStudents(), loadStats()]);
  } catch (error) {
    studentStatus.textContent = messageOf(error);
  } finally {
    saveButton.disabled = false;
  }
}


// ============================================================
// Cell 8: Delete
// Asks first, because this cannot be undone.
// ============================================================
async function removeStudent(student: Student): Promise<void> {
  if (!confirm(`Delete ${student.full_name}?`)) return;

  try {
    await request(`/students/${student.id}`, "DELETE");
    if (editingId === student.id) resetForm();
    studentStatus.textContent = "Student deleted.";
    await Promise.all([loadStudents(), loadStats()]);
  } catch (error) {
    studentStatus.textContent = messageOf(error);
  }
}


// ============================================================
// Cell 9: Contact form
// Sends a message to POST /contact and shows a coloured
// alert: blue while sending, green saved, red problem.
// ============================================================
const contactForm = get<HTMLFormElement>("contact-form");
const contactName = get<HTMLInputElement>("contact-name");
const contactMessage = get<HTMLTextAreaElement>("contact-message");
const contactStatus = get<HTMLParagraphElement>("form-status");

function showContactStatus(text: string, color: "info" | "success" | "danger"): void {
  contactStatus.textContent = text;
  contactStatus.className = `alert alert-${color} mt-3 mb-0`;
}

async function sendContact(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const body = { name: contactName.value.trim(), message: contactMessage.value.trim() };

  if (!body.name || !body.message) {
    showContactStatus("Please enter your name and a message.", "danger");
    return;
  }
  showContactStatus("Sending...", "info");

  try {
    await request("/contact", "POST", body);
    contactForm.reset();
    showContactStatus("Message saved. Thank you!", "success");
  } catch (error) {
    showContactStatus(messageOf(error), "danger");
  }
}


// ============================================================
// Cell 10: Start the app
// Connects every event, then shows the page and loads data.
// ============================================================
window.addEventListener("hashchange", () => {
  showPage();
  document.body.classList.remove("sidebar-open"); // close the menu on phones
});
studentForm.addEventListener("submit", saveStudent);
cancelButton.addEventListener("click", resetForm);
searchInput.addEventListener("input", loadStudents);
sortSelect.addEventListener("change", loadStudents);
contactForm.addEventListener("submit", sendContact);

showPage();
loadStudents();
loadStats();
