import React from "react";

const PrivacyPolicy = () => {
  return (
    <div style={styles.page}>
      <p>
        <strong> The Presenza</strong> mobile application (package name:{" "}
        <code>com.presenza</code>). This page informs you of our policies
        regarding the collection, use, and disclosure of personal data when you
        use our app.
      </p>

      <p>
        By using Presenza, you agree to the collection and use of information in
        accordance with this policy.
      </p>

      <h2 style={styles.h2}>1. Information We Collect</h2>
      <p>
        Presenza is an employee attendance and time-tracking application. To
        provide its core functionality, we collect the following types of data:
      </p>

      <h3 style={styles.h3}>a) Personal Information</h3>
      <ul>
        <li>
          <strong>Name and Employee ID</strong> — to identify you within your
          organization.
        </li>
        <li>
          <strong>Email address and phone number</strong> — for account
          creation, OTP-based login, and communication.
        </li>
        <li>
          <strong>Organization/employer details</strong> — to associate your
          account with the correct workplace.
        </li>
      </ul>

      <h3 style={styles.h3}>b) Attendance and Work Data</h3>
      <ul>
        <li>Check-in and check-out timestamps.</li>
        <li>Break durations (coffee, lunch, other breaks).</li>
        <li>Total working hours and attendance history.</li>
        <li>Leave requests and approval status.</li>
      </ul>

      <h3 style={styles.h3}>c) Authentication Data</h3>
      <ul>
        <li>
          One-Time Passwords (OTP) sent to your registered email/phone for
          secure login.
        </li>
        <li>Device session tokens (stored securely, not shared).</li>
      </ul>

      <h3 style={styles.h3}>d) Automatically Collected Data</h3>
      <ul>
        <li>
          Device type, operating system version, and app version (for
          diagnostics).
        </li>
        <li>Crash logs and basic usage analytics (to improve app stability).</li>
      </ul>

      <h2 style={styles.h2}>2. How We Use Your Information</h2>
      <ul>
        <li>To authenticate you via OTP and provide secure access.</li>
        <li>To record and display your attendance, working hours, and breaks.</li>
        <li>To process leave requests and show approval status.</li>
        <li>
          To generate attendance reports and productivity analytics for you and
          your employer.
        </li>
        <li>
          To send service-related notifications (e.g., shift reminders, leave
          approvals).
        </li>
        <li>To diagnose technical issues and improve app performance.</li>
      </ul>

      <h2 style={styles.h2}>3. Data Sharing and Disclosure</h2>
      <p>
        <strong>We do not sell your personal data.</strong> We do not share data
        with third parties for advertising or marketing purposes.
      </p>
      <p>Your attendance and work data is shared only with:</p>
      <ul>
        <li>
          <strong>Your employer/organization</strong> — as required for
          attendance management.
        </li>
        <li>
          <strong>Service providers</strong> — such as cloud hosting and
          email/SMS delivery services, bound by confidentiality agreements.
        </li>
        <li>
          <strong>Legal authorities</strong> — only when required by law.
        </li>
      </ul>

      <h2 style={styles.h2}>4. Data Security</h2>
      <p>We take reasonable measures to protect your data:</p>
      <ul>
        <li>
          All data is transmitted over <strong>HTTPS/TLS encryption</strong>.
        </li>
        <li>OTP-based authentication reduces password-related risks.</li>
        <li>
          Access to backend systems is restricted to authorized personnel only.
        </li>
      </ul>
      <p>
        However, no method of transmission over the Internet is 100% secure. We
        cannot guarantee absolute security.
      </p>

      <h2 style={styles.h2}>5. Data Retention</h2>
      <p>
        We retain your personal and attendance data for as long as your account
        is active or as needed to provide services to your employer. When no
        longer required, data is deleted or anonymized, subject to legal
        retention requirements.
      </p>

      <h2 style={styles.h2}>6. Your Rights and Data Deletion</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>Request deletion of your account and personal data.</li>
      </ul>
      <p>
        <strong>How to request data deletion:</strong> Send an email to{" "}
        <a href="mailto:paulfincap@gmail.com">paulfincap@gmail.com</a> with the
        subject line "Data Deletion Request" and include your registered email
        and employee ID. We will process your request within{" "}
        <strong>30 days</strong>.
      </p>
      <p>
        Note: Some attendance records may be retained if required by your
        employer's legal or payroll obligations.
      </p>

      <h2 style={styles.h2}>7. Children's Privacy</h2>
      <p>
        Presenza is intended for use by employees aged 18 and above. We do not
        knowingly collect data from children under 13. If we discover such data,
        we will delete it promptly.
      </p>

      <h2 style={styles.h2}>8. International Data Transfers</h2>
      <p>
        Your data may be stored and processed on servers located outside your
        country. We ensure appropriate safeguards are in place for such
        transfers.
      </p>

      <h2 style={styles.h2}>9. Changes to This Privacy Policy</h2>
      <p>
        We may update this policy from time to time. Changes will be posted on
        this page with an updated "Last updated" date. Continued use of the app
        after changes constitutes acceptance.
      </p>

      <h2 style={styles.h2}>10. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, contact:</p>
      <p>
        <br />
        Email: <a href="mailto:paulfincap@gmail.com">paulfincap@gmail.com</a>
        Country: India
      </p>
    </div>
  );
};

const styles = {
  page: {
    fontFamily:
      '-apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    maxWidth: "800px",
    margin: "40px auto",
    padding: "0 20px",
    lineHeight: 1.6,
    color: "#222",
  },
  h1: { color: "#1a1a1a" },
  h2: { color: "#333", marginTop: "32px" },
  h3: { color: "#333" },
  updated: { color: "#666", fontSize: "0.9em" },
};

export default PrivacyPolicy;