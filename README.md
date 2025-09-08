# gflow-worker

This is a Cloudflare Worker that provides an API for storing and retrieving tick data in a Cloudflare D1 database.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js and npm](https://nodejs.org/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

## Setup

1.  **Clone the repository or download the files.**

2.  **Install dependencies:**
    At present, this project has no external dependencies that need to be installed via npm.

3.  **Configure your D1 Database:**
    Open the `wrangler.toml` file. You need to replace the placeholder for `database_id` with your actual D1 database ID. You can find this by running the following command:

    ```bash
    npx wrangler d1 info gflow
    ```

    This command will output information about your `gflow` database, including the `uuid` which is your `database_id`.

## Deployment

To deploy the worker to your Cloudflare account, run the following command:

```bash
npx wrangler deploy
```

This will publish your worker and it will be accessible at the URL provided in the command's output.

## Usage

Once deployed, you can interact with the worker using any HTTP client, such as `curl`.

### Saving Data (POST)

To save a JSON payload, send a `POST` request to the worker's URL. The worker will automatically determine the `day` from the maximum `time` in the payload.

```bash
curl -X POST <YOUR_WORKER_URL> \
-H "Content-Type: application/json" \
-d @szo.json
```

Replace `<YOUR_WORKER_URL>` with the actual URL of your deployed worker. The `szo.json` file should be in the same directory where you are running the command.

### Retrieving Data (GET)

To retrieve the stored ticks for a specific day, send a `GET` request with a `day` query parameter.

```bash
curl "<YOUR_WORKER_URL>?day=2025-09-08"
```

Replace `<YOUR_WORKER_URL>` with your worker's URL and adjust the `day` parameter as needed. This will return the full JSON payload that was saved for that day.

If the `day` parameter is not provided, the worker will automatically query for the current day's data based on the UTC+8 timezone.
```bash
curl "<YOUR_WORKER_URL>"
```
