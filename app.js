// SkillBridge simple JavaScript

// Skills required for each career
const careers = {
  "Web Developer": { HTML: 8, CSS: 8, JavaScript: 9, Python: 5, Communication: 6 },
  "Data Analyst": { Python: 8, Excel: 8, SQL: 9, Statistics: 8, Communication: 6 },
  "Software Engineer": { Python: 8, Java: 8, "Problem Solving": 9, SQL: 7, Communication: 6 }
};

let profile = JSON.parse(localStorage.getItem("sbProfile")) || {
  name: "Student", email: "", course: "", year: ""
};
let history = JSON.parse(localStorage.getItem("sbHistory")) || [];
let library = JSON.parse(localStorage.getItem("sbLibrary")) || [
  "HTML", "CSS", "JavaScript", "Python", "Communication"
];
let latest = history.length ? history[history.length - 1] : null;

const byId = id => document.getElementById(id);

function saveData() {
  localStorage.setItem("sbProfile", JSON.stringify(profile));
  localStorage.setItem("sbHistory", JSON.stringify(history));
  localStorage.setItem("sbLibrary", JSON.stringify(library));
}

// Show the selected page
function openPage(name) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  byId("page-" + name).classList.add("active");

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === name);
  });

  const link = document.querySelector('.nav-link[data-page="' + name + '"]');
  byId("pageTitle").textContent = link ? link.textContent : name;
  byId("sidebar").classList.remove("open");
}

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    openPage(link.dataset.page);
  });
});

document.querySelectorAll("[data-goto]").forEach(button => {
  button.addEventListener("click", () => openPage(button.dataset.goto));
});

byId("menuToggle").addEventListener("click", () => {
  byId("sidebar").classList.toggle("open");
});

byId("todayDate").textContent = new Date().toLocaleDateString();

// Load career skills and sliders
function showSkills() {
  const career = byId("careerSelect").value;
  const skills = careers[career];

  byId("skillInputs").innerHTML = Object.entries(skills).map(([name, target]) => `
    <div class="skill-row">
      <strong>${name}</strong>
      <input type="range" min="0" max="10" value="0" data-name="${name}">
      <span>0</span>
    </div>
    <small class="muted">Target: ${target}/10</small>
  `).join("");

  document.querySelectorAll('#skillInputs input[type="range"]').forEach(slider => {
    slider.addEventListener("input", () => {
      slider.nextElementSibling.textContent = slider.value;
    });
  });
}

byId("careerSelect").addEventListener("change", showSkills);
showSkills();

// Calculate the career match and save an assessment
byId("analyzeBtn").addEventListener("click", () => {
  const career = byId("careerSelect").value;
  const targets = careers[career];
  const results = {};
  let achieved = 0;
  let total = 0;

  document.querySelectorAll('#skillInputs input[type="range"]').forEach(slider => {
    const name = slider.dataset.name;
    const current = Number(slider.value);
    const target = targets[name];
    results[name] = { current, target };
    if (current >= target) achieved++;
    total += Math.min(current / target, 1) * 100;
  });

  const match = Math.round(total / Object.keys(targets).length);
  latest = {
    career,
    match,
    achieved,
    date: new Date().toLocaleDateString(),
    note: byId("assessmentNote").value,
    skills: results
  };

  history.push(latest);
  saveData();
  byId("assessmentResult").innerHTML =
    `<h2>Your career match: ${match}%</h2><p>You achieved ${achieved} of ${Object.keys(results).length} skill targets.</p>`;
  updateAll();
});

// Update dashboard
function updateDashboard() {
  const count = latest ? Object.keys(latest.skills).length : 0;
  const achieved = latest ? latest.achieved : 0;
  const gaps = count - achieved;
  const match = latest ? latest.match : 0;

  byId("totalSkills").textContent = count;
  byId("achievedSkills").textContent = achieved;
  byId("gapSkills").textContent = gaps;
  byId("careerMatch").textContent = match + "%";
  byId("dashboardCareer").textContent = latest ? latest.career : "No assessment yet";
  byId("matchBar").style.width = match + "%";
  byId("dashboardMessage").textContent = latest
    ? "Your latest assessment was on " + latest.date + "."
    : "Start an assessment to see your results.";

  const priorities = latest ? Object.entries(latest.skills)
    .filter(([name, data]) => data.current < data.target)
    .sort((a, b) => (b[1].target - b[1].current) - (a[1].target - a[1].current)) : [];

  byId("priorityList").innerHTML = priorities.length
    ? priorities.map(([name, data]) => `<li>${name}: improve by ${data.target - data.current} levels</li>`).join("")
    : "<li>No skill gaps yet. Complete an assessment or keep practising.</li>";
}

// Update assessment history
function updateHistory() {
  byId("historyCount").textContent = "Assessments: " + history.length;
  byId("historyList").innerHTML = history.length
    ? [...history].reverse().map(item =>
      `<p><strong>${item.career}</strong> — ${item.match}% match — ${item.date}</p>`
    ).join("")
    : "No assessments saved yet.";
}

// Create report table
function updateReport() {
  if (!latest) {
    byId("reportArea").textContent = "Complete an assessment to create your report.";
    return;
  }

  let rows = Object.entries(latest.skills).map(([name, data]) => `
    <tr>
      <td>${name}</td><td>${data.current}/10</td><td>${data.target}/10</td>
      <td>${Math.max(0, data.target - data.current)}</td>
    </tr>
  `).join("");

  byId("reportArea").innerHTML = `
    <h2>${latest.career}</h2>
    <p>Student: ${profile.name} | Date: ${latest.date}</p>
    <h3>Career match: ${latest.match}%</h3>
    <table>
      <tr><th>Skill</th><th>Current</th><th>Required</th><th>Gap</th></tr>
      ${rows}
    </table>
  `;
}

function updateAll() {
  byId("welcomeName").textContent = profile.name || "Student";
  updateDashboard();
  updateHistory();
  updateReport();
}

// Save profile information
byId("saveProfile").addEventListener("click", () => {
  profile = {
    name: byId("studentName").value.trim() || "Student",
    email: byId("studentEmail").value.trim(),
    course: byId("studentCourse").value.trim(),
    year: byId("studentYear").value.trim()
  };
  saveData();
  updateAll();
  alert("Profile saved!");
});

// Show saved profile details
byId("studentName").value = profile.name;
byId("studentEmail").value = profile.email;
byId("studentCourse").value = profile.course;
byId("studentYear").value = profile.year;

// Add and remove skills from the personal library
function showLibrary() {
  byId("skillLibrary").innerHTML = library.map((skill, index) =>
    `<li>${skill} <button class="remove-skill" data-index="${index}">Remove</button></li>`
  ).join("");

  document.querySelectorAll(".remove-skill").forEach(button => {
    button.addEventListener("click", () => {
      library.splice(Number(button.dataset.index), 1);
      saveData();
      showLibrary();
    });
  });
}

byId("addSkill").addEventListener("click", () => {
  const skill = byId("newSkill").value.trim();
  if (!skill) {
    alert("Please enter a skill name.");
    return;
  }
  if (library.some(item => item.toLowerCase() === skill.toLowerCase())) {
    alert("This skill is already in the list.");
    return;
  }
  library.push(skill);
  byId("newSkill").value = "";
  saveData();
  showLibrary();
});

byId("printBtn").addEventListener("click", () => {
  if (!latest) {
    alert("Complete an assessment first.");
    return;
  }
  openPage("reports");
  window.print();
});

// Start the app
showLibrary();
updateAll();
