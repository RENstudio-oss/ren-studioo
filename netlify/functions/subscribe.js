const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

exports.handler = async event => {
  if (event.httpMethod !== "POST") return json(405, { message: "Method not allowed" });

  let input;
  try {
    input = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { message: "Invalid request" });
  }

  if (String(input.website || "").trim()) return json(200, { ok: true });

  const email = String(input.email || "").trim().toLowerCase();
  const firstName = String(input.firstName || "").trim().slice(0, 100);
  const consent = input.consent === true;
  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number.parseInt(process.env.BREVO_LIST_ID || "3", 10);

  if (!isEmail(email) || !consent) {
    return json(400, { message: "A valid email and consent are required" });
  }
  if (!apiKey || !Number.isInteger(listId)) {
    console.error("Newsletter environment variables are missing");
    return json(503, { message: "Newsletter service is not configured" });
  }

  const contact = { email, listIds: [listId], updateEnabled: true };
  if (firstName) contact.attributes = { FIRSTNAME: firstName };

  try {
    const response = await fetch(BREVO_CONTACTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(contact)
    });

    if (!response.ok) {
      console.error("Brevo contact request failed", response.status, await response.text());
      return json(502, { message: "Newsletter provider rejected the request" });
    }
    return json(200, { ok: true });
  } catch (error) {
    console.error("Brevo contact request failed", error);
    return json(502, { message: "Newsletter provider is unavailable" });
  }
};

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify(body)
  };
}
