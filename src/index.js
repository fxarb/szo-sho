const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai', // UTC+8
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export default {
  async fetch(request, env) {
    const { method } = request;

    if (method === "POST") {
      return handlePost(request, env);
    }

    if (method === "GET") {
      return handleGet(request, env);
    }

    return new Response("Method Not Allowed", { status: 405 });
  },
};

async function handlePost(request, env) {
  try {
    const json = await request.json();
    const ticks = JSON.stringify(json);

    const maxTime = Object.values(json).reduce((max, { time }) => {
      return time > max ? time : max;
    }, 0);

    if (maxTime === 0) {
      return new Response("Invalid JSON payload: 'time' field not found or is 0.", { status: 400 });
    }


    const day = formatter.format(new Date(maxTime));

    const { success } = await env.DB.prepare(
      "INSERT INTO full_tick (day, ticks) VALUES (?, ?)"
    )
      .bind(day, ticks)
      .run();

    if (success) {
      return new Response(`Data for day ${day} saved successfully.`, { status: 201 });
    } else {
      return new Response("Failed to save data.", { status: 500 });
    }
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}

async function handleGet(request, env) {
  const { searchParams } = new URL(request.url);
  let day = searchParams.get("day");

  if (!day) {
    // If day is blank, query for today's data in UTC+8
    day = formatter.format(new Date());
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT ticks FROM full_tick WHERE day = ?"
    )
      .bind(day)
      .all();

    if (results && results.length > 0) {
      // Assuming 'ticks' is stored as a JSON string, we return it directly.
      const ticks = results[0].ticks;
      return new Response(ticks, {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(`No data found for day: ${day}`, { status: 404 });
    }
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
