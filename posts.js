/*
  McMaster Climbing Club - Newsletter Content Source

  HOW TO ADD A NEW NEWSLETTER:
  1) Copy one object in the MCC_POSTS array and paste it at the TOP of the list.
     (Top = newest first, so the page stays reverse chronological.)
  2) Update: id, title, date, and contentHTML.
  3) Paste cleaned HTML from Google Docs inside contentHTML (between backticks `...`).
  4) Use h2/h3 headings inside contentHTML for the mini table of contents.

  TOC RULES:
  - newsletters.js scans each newsletter's contentHTML for h2 and h3.
  - It auto-creates anchor links to those headings when expanded.

  EDIT SAFETY TIPS:
  - Keep each newsletter inside one object.
  - Keep commas between objects.
  - Do not remove the opening "const MCC_POSTS = [" or ending "];"
*/

const MCC_POSTS = [
  // EDIT HERE: Add a new newsletter entry at the top of this array.
  {
    id: "2026-02-newsletter",
    title: "February 2026 Newsletter",
    date: "2026-02-01",
    contentHTML: `
      <h2>Welcome Back Climbers</h2>
      <p>We are excited to kick off the new month with open sessions, beginner support, and technique workshops.</p>

      <h3>Key Dates</h3>
      <ul>
        <li>Feb 7: Beginner Orientation</li>
        <li>Feb 14: Social Climb Night</li>
        <li>Feb 28: Route Reading Workshop</li>
      </ul>

      <h2>Safety Reminders</h2>
      <p>Bring your student ID, arrive on time for partner checks, and ask an executive if you need accommodations.</p>

      <h2>Member Spotlight</h2>
      <p>Congrats to our novice climbers who completed their first full session progression this month.</p>
    `
  },
  {
    id: "2026-01-newsletter",
    title: "January 2026 Newsletter",
    date: "2026-01-05",
    contentHTML: `
      <h2>New Semester Launch</h2>
      <p>Welcome to all returning and new members. We are focused on onboarding and confidence-building.</p>

      <h3>What to Expect</h3>
      <p>Weekly wall sessions, mentorship pairings, and skill ladders for all experience levels.</p>

      <h2>Important Links</h2>
      <p>Check the club Linktree for registration forms and updated schedules.</p>
    `
  }
];
