import nodemailer from "nodemailer";

type RegistrationEmailPayload = {
  to: string;
  firstName: string;
  registrationType: "sponsor" | "attendee";
  organisation: string;
  shareLink?: string | null;
  sponsorshipCategory?: "Silver" | "Gold" | "Platinum";
  staffCount?: number;
};

const sponsorshipCategoryLimits = {
  Silver: 1,
  Gold: 2,
  Platinum: 3,
} as const;

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required SMTP env var: ${name}`);
  }
  return value;
}

function getMailerConfig() {
  const host = getRequiredEnv("SMTP_HOST");
  const port = Number.parseInt(getRequiredEnv("SMTP_PORT"), 10);
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASSWORD");
  const fromEmail = getRequiredEnv("SMTP_FROM_EMAIL");
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "CCISONFI";

  if (Number.isNaN(port)) {
    throw new Error("SMTP_PORT must be a valid number");
  }

  return {
    host,
    port,
    user,
    pass,
    fromEmail,
    fromName,
  };
}

function buildRegistrationEmailHtml(payload: RegistrationEmailPayload) {
  const role = payload.registrationType === "sponsor" ? "Sponsor" : "Attendee";
  const includedCount =
    payload.registrationType === "sponsor" && payload.sponsorshipCategory
      ? sponsorshipCategoryLimits[payload.sponsorshipCategory]
      : null;
  const selectedCount = payload.registrationType === "sponsor" ? payload.staffCount ?? null : null;
  const overageCount =
    selectedCount && includedCount && selectedCount > includedCount
      ? selectedCount - includedCount
      : 0;
  const sponsorDetailsSection =
    payload.registrationType === "sponsor"
      ? `
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            <div style="padding: 18px; border: 1px solid #e2e8f0; background: #fcfdff;">
              <p style="margin: 0 0 12px 0; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: #64748b;">Sponsorship Summary</p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;"><strong>Category:</strong> ${payload.sponsorshipCategory ?? "N/A"}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;"><strong>Included Attendees:</strong> ${includedCount ?? "N/A"} attendee${includedCount && includedCount > 1 ? "s" : ""}</p>
              <p style="margin: 0; font-size: 14px; color: #0f172a;"><strong>Selected Attendees:</strong> ${selectedCount ?? "N/A"}</p>
            </div>
          </td>
        </tr>
        `
      : "";
  const overageNotice =
    payload.registrationType === "sponsor" && overageCount > 0
      ? `
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            <div style="padding: 14px 16px; border: 1px solid #f5c98b; background: #fff8ee;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                You selected <strong>${selectedCount}</strong> attendees while your ${payload.sponsorshipCategory} package includes <strong>${includedCount}</strong>. The extra <strong>${overageCount}</strong> may attract additional billing.
              </p>
            </div>
          </td>
        </tr>
      `
      : "";
  const sponsorBlock =
    payload.registrationType === "sponsor" && payload.shareLink
      ? `
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            <div style="padding: 16px; border: 1px solid #dbe3f0; background: #f8fbff;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #334155;"><strong>Your attendee invite link</strong></p>
              <a
                href="${payload.shareLink}"
                style="font-size: 14px; color: #1d4ed8; word-break: break-all; text-decoration: none;"
              >
                ${payload.shareLink}
              </a>
            </div>
          </td>
        </tr>
      `
      : "";

  return `
    <div style="margin: 0; padding: 24px 12px; background: #ffffff; font-family: Poppins, Inter, Segoe UI, Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 820px; margin: 0 auto; border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0;">
        <tr>
          <td style="padding: 24px 32px 12px 32px; text-align: left; background: #ffffff;">
            <img
              src="https://res.cloudinary.com/dja2el0ac/image/upload/v1773303975/CCISONFI-Logo-v2-tb-768x164_sbp96u.png"
              alt="CCISONFI Logo"
              style="display: block; max-width: 220px; width: 100%; height: auto; border: 0;"
            />
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 32px 10px 32px;">
            <h1 style="margin: 0 0 12px 0; font-size: 24px; line-height: 1.25; color: #0f172a; font-weight: 700;">Registration Confirmed</h1>
            <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.7; color: #334155;">Hello ${payload.firstName}, your registration for the CCISONFI Conference 2026 has been received successfully.</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            <div style="padding: 18px; border: 1px solid #e2e8f0; background: #f8fafc;">
              <p style="margin: 0 0 12px 0; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: #64748b;">Registration Details</p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;"><strong>Registration Type:</strong> ${role}</p>
              <p style="margin: 0; font-size: 14px; color: #0f172a;"><strong>Organisation:</strong> ${payload.organisation}</p>
            </div>
          </td>
        </tr>
        ${sponsorDetailsSection}
        ${overageNotice}
        ${sponsorBlock}
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            <img
              src="https://res.cloudinary.com/dja2el0ac/image/upload/v1773303939/banner-flyer_cp3doy.jpg"
              alt="CCISONFI Conference Banner"
              style="display: block; width: 100%; height: auto; border: 0;"
            />
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 32px 28px 32px;">
            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #334155;">Thank you for registering. We look forward to hosting you.</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 18px 32px; border-top: 1px solid #e2e8f0; background: #fbfdff;">
            <p style="margin: 0; font-size: 12px; color: #64748b;">CCISONFI · Conference 2026</p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function buildRegistrationEmailText(payload: RegistrationEmailPayload) {
  const role = payload.registrationType === "sponsor" ? "Sponsor" : "Attendee";
  const includedCount =
    payload.registrationType === "sponsor" && payload.sponsorshipCategory
      ? sponsorshipCategoryLimits[payload.sponsorshipCategory]
      : null;
  const selectedCount = payload.registrationType === "sponsor" ? payload.staffCount ?? null : null;
  const overageCount =
    selectedCount && includedCount && selectedCount > includedCount
      ? selectedCount - includedCount
      : 0;
  const sponsorCountSection =
    payload.registrationType === "sponsor"
      ? [
          `Sponsorship Category: ${payload.sponsorshipCategory ?? "N/A"}`,
          `Included in Category: ${includedCount ?? "N/A"}`,
          `Selected Attendees: ${selectedCount ?? "N/A"}`,
          overageCount > 0
            ? `Billing Notice: You selected ${selectedCount} attendees and ${includedCount} are included; the extra ${overageCount} may attract additional billing.`
            : null,
        ]
          .filter(Boolean)
          .join("\n")
      : "";
  const sponsorSection =
    payload.registrationType === "sponsor" && payload.shareLink
      ? `\nYour attendee invite link: ${payload.shareLink}\n`
      : "";

  return [
    `Hello ${payload.firstName},`,
    "",
    "Your registration for the CCISONFI Conference 2026 has been received successfully.",
    "",
    `Registration Type: ${role}`,
    `Organisation: ${payload.organisation}`,
    sponsorCountSection,
    sponsorSection,
    "Thank you for registering.",
    "",
    "Regards,",
    "CCISONFI Team",
  ].join("\n");
}

export async function sendRegistrationEmail(payload: RegistrationEmailPayload) {
  const config = getMailerConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: `${config.fromName} <${config.fromEmail}>`,
    to: payload.to,
    subject: "CCISONFI Registration Confirmation",
    text: buildRegistrationEmailText(payload),
    html: buildRegistrationEmailHtml(payload),
  });
}