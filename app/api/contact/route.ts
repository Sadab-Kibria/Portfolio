export async function POST(request: Request) {
  const endpoint = process.env.FORMSUBMIT_ENDPOINT;

  if (!endpoint) {
    return Response.json(
      {
        ok: false,
        error: {
          message: "Contact form is not configured. Please try again later.",
        },
      },
      { status: 500 }
    );
  }

  let name = "";
  let email = "";
  let message = "";
  let subject = "New Portfolio Contact Message";
  let gotcha = "";

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const json = await request.json();
      name = typeof json.name === "string" ? json.name.trim() : "";
      email = typeof json.email === "string" ? json.email.trim() : "";
      message = typeof json.message === "string" ? json.message.trim() : "";
      if (typeof json._subject === "string" && json._subject.trim()) {
        subject = json._subject.trim();
      }
      gotcha = typeof json._gotcha === "string" ? json._gotcha.trim() : "";
    } catch {
      return Response.json(
        {
          ok: false,
          error: {
            message: "Invalid request payload.",
          },
        },
        { status: 400 }
      );
    }
  } else {
    try {
      const formData = await request.formData();
      const rawName = formData.get("name");
      const rawEmail = formData.get("email");
      const rawMessage = formData.get("message");
      const rawSubject = formData.get("_subject");
      const rawGotcha = formData.get("_gotcha");

      name = typeof rawName === "string" ? rawName.trim() : "";
      email = typeof rawEmail === "string" ? rawEmail.trim() : "";
      message = typeof rawMessage === "string" ? rawMessage.trim() : "";
      if (typeof rawSubject === "string" && rawSubject.trim()) {
        subject = rawSubject.trim();
      }
      gotcha = typeof rawGotcha === "string" ? rawGotcha.trim() : "";
    } catch {
      return Response.json(
        {
          ok: false,
          error: {
            message: "Invalid form submission.",
          },
        },
        { status: 400 }
      );
    }
  }

  // Honeypot check: silently discard bot submissions
  if (gotcha) {
    return Response.json({ ok: true }, { status: 200 });
  }

  // Validation
  if (!name || name.length > 100) {
    return Response.json(
      {
        ok: false,
        error: {
          message: "Name is required and must not exceed 100 characters.",
        },
      },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.length > 254 || !emailRegex.test(email)) {
    return Response.json(
      {
        ok: false,
        error: {
          message: "A valid email address is required (up to 254 characters).",
        },
      },
      { status: 400 }
    );
  }

  if (!message || message.length < 10 || message.length > 5000) {
    return Response.json(
      {
        ok: false,
        error: {
          message: "Message must be between 10 and 5000 characters.",
        },
      },
      { status: 400 }
    );
  }

  const forwardData = new FormData();
  forwardData.append("_subject", subject);
  forwardData.append("name", name);
  forwardData.append("email", email);
  forwardData.append("message", message);

  try {
    const upstreamResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: forwardData,
    });

    let upstreamResult: {
      ok?: boolean;
      success?: boolean | string;
      message?: string;
      error?: { message?: string };
    } | null = null;

    try {
      upstreamResult = await upstreamResponse.json();
    } catch {
      // Upstream response may not be JSON
    }

    const isSuccess =
      upstreamResponse.ok &&
      (!upstreamResult ||
        (upstreamResult.ok !== false &&
          upstreamResult.success !== false &&
          upstreamResult.success !== "false"));

    if (!isSuccess) {
      const errorMsg =
        upstreamResult?.error?.message ||
        upstreamResult?.message ||
        "Unable to send your message. Please try again.";

      return Response.json(
        {
          ok: false,
          error: {
            message: errorMsg,
          },
        },
        { status: upstreamResponse.ok ? 502 : upstreamResponse.status }
      );
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json(
      {
        ok: false,
        error: {
          message: "Unable to send your message due to a network error. Please try again.",
        },
      },
      { status: 502 }
    );
  }
}
