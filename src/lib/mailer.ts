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
    throw new Error(`Missing required Mailjet env var: ${name}`);
  }
  return value;
}

function getMailerConfig() {
  const publicKey = getRequiredEnv("MAILJET_API_PUBLIC_KEY");
  const privateKey = getRequiredEnv("MAILJET_API_PRIVATE_KEY");
  const fromEmail = getRequiredEnv("MAILJET_FROM_EMAIL");
  const fromName = process.env.MAILJET_FROM_NAME?.trim() || "CCISONFI";

  return {
    publicKey,
    privateKey,
    fromEmail,
    fromName,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildRegistrationEmailText(payload: RegistrationEmailPayload) {
  const includedCount =
    payload.registrationType === "sponsor" && payload.sponsorshipCategory
      ? sponsorshipCategoryLimits[payload.sponsorshipCategory]
      : null;
  const selectedCount = payload.registrationType === "sponsor" ? payload.staffCount ?? null : null;
  const overageCount =
    selectedCount && includedCount && selectedCount > includedCount
      ? selectedCount - includedCount
      : 0;

  const lines = [
    `Hello ${payload.firstName},`,
    "",
    "Your registration for the CCISONFI Conference 2026 has been received successfully.",
    `Registration Type: ${payload.registrationType === "sponsor" ? "Sponsor" : "Attendee"}`,
    `Organisation: ${payload.organisation}`,
  ];

  if (payload.registrationType === "sponsor") {
    lines.push(`Sponsorship Category: ${payload.sponsorshipCategory ?? "N/A"}`);
    lines.push(`Selected Attendees: ${selectedCount ?? "N/A"}`);
    lines.push(`Included Attendees: ${includedCount ?? "N/A"}`);
    if (overageCount > 0) {
      lines.push(`Overage: ${overageCount} attendee(s) may attract extra billing.`);
    }
    if (payload.shareLink) {
      lines.push("");
      lines.push(`Your attendee invite link: ${payload.shareLink}`);
    }
  }

  lines.push("");
  lines.push("Thank you for registering.");
  lines.push("CCISONFI Team");

  return lines.join("\n");
}

function buildRegistrationEmailHtml(payload: RegistrationEmailPayload) {
  const includedCount =
    payload.registrationType === "sponsor" && payload.sponsorshipCategory
      ? sponsorshipCategoryLimits[payload.sponsorshipCategory]
      : null;
  const selectedCount = payload.registrationType === "sponsor" ? payload.staffCount ?? null : null;
  const overageCount =
    selectedCount && includedCount && selectedCount > includedCount
      ? selectedCount - includedCount
      : 0;

  const safeFirstName = escapeHtml(payload.firstName);
  const safeOrganisation = escapeHtml(payload.organisation);
  const safeSponsorshipCategory = escapeHtml(payload.sponsorshipCategory ?? "N/A");
  const safeIncludedCount = escapeHtml(String(includedCount ?? "N/A"));
  const safeSelectedCount = escapeHtml(String(selectedCount ?? "N/A"));
  const safeOverageCount = escapeHtml(String(overageCount));
  const safeShareLink = payload.shareLink ? escapeHtml(payload.shareLink) : "";

  if (payload.registrationType !== "sponsor") {
    return `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CCISONFI Registration Confirmed</title>
      </head>
      <body style="margin: 0; padding: 24px 12px; background: #ffffff; font-family: Poppins, Inter, Segoe UI, Arial, sans-serif;">
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
              <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.7; color: #334155;">Hello ${safeFirstName}, your registration for the CCISONFI Conference 2026 has been received successfully.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <div style="padding: 18px; border: 1px solid #e2e8f0; background: #f8fafc;">
                <p style="margin: 0 0 12px 0; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: #64748b;">Registration Details</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;"><strong>Registration Type:</strong> Attendee</p>
                <p style="margin: 0; font-size: 14px; color: #0f172a;"><strong>Organisation:</strong> ${safeOrganisation}</p>
              </div>
            </td>
          </tr>
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
      </body>
      </html>
    `;
  }

  const overageSection =
    overageCount > 0
      ? `
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            <div style="padding: 14px 16px; border: 1px solid #f5c98b; background: #fff8ee;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                You selected <strong>${safeSelectedCount}</strong> attendees while your ${safeSponsorshipCategory} package includes <strong>${safeIncludedCount}</strong>. The extra <strong>${safeOverageCount}</strong> may attract additional billing.
              </p>
            </div>
          </td>
        </tr>
      `
      : "";

  const shareLinkSection =
    payload.shareLink
      ? `
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            <div style="padding: 16px; border: 1px solid #dbe3f0; background: #f8fbff;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #334155;"><strong>Your attendee invite link</strong></p>
              <a href="${safeShareLink}" style="font-size: 14px; color: #1d4ed8; word-break: break-all; text-decoration: none;">
                ${safeShareLink}
              </a>
            </div>
          </td>
        </tr>
      `
      : "";

  return `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>CCISONFI Sponsor Registration Confirmed</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; background: #ffffff; font-family: Poppins, Inter, Segoe UI, Arial, sans-serif;">
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
            <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.7; color: #334155;">Hello ${safeFirstName}, your registration for the CCISONFI Conference 2026 has been received successfully.</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            <div style="padding: 18px; border: 1px solid #e2e8f0; background: #f8fafc;">
              <p style="margin: 0 0 12px 0; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: #64748b;">Registration Details</p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;"><strong>Registration Type:</strong> Sponsor</p>
              <p style="margin: 0; font-size: 14px; color: #0f172a;"><strong>Organisation:</strong> ${safeOrganisation}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            <div style="padding: 18px; border: 1px solid #e2e8f0; background: #fcfdff;">
              <p style="margin: 0 0 12px 0; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: #64748b;">Sponsorship Summary</p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;"><strong>Category:</strong> ${safeSponsorshipCategory}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;"><strong>Included Attendees:</strong> ${safeIncludedCount}</p>
              <p style="margin: 0; font-size: 14px; color: #0f172a;"><strong>Selected Attendees:</strong> ${safeSelectedCount}</p>
            </div>
          </td>
        </tr>
        ${overageSection}
        ${shareLinkSection}
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
    </body>
    </html>
  `;
}

export async function sendRegistrationEmail(payload: RegistrationEmailPayload) {
  const config = getMailerConfig();
  const fromContact = {
    Email: config.fromEmail,
    Name: config.fromName,
  };
  const toContacts = [
    {
      Email: payload.to,
      Name: payload.firstName?.trim() || payload.to,
    },
  ];

  const token = Buffer.from(`${config.publicKey}:${config.privateKey}`).toString("base64");
  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify({
      Messages: [
        {
          From: fromContact,
          To: toContacts,
          Subject: "CCISONFI Registration Confirmation",
          TextPart: buildRegistrationEmailText(payload),
          HTMLPart: buildRegistrationEmailHtml(payload),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mailjet send failed: ${response.status} ${errorText}`);
  }
}