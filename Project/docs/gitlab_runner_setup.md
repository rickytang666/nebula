# Setting up a GitLab CI Runner on macOS

Since you need a runner to execute your pipeline, here is how to set up one on your local machine (macOS).

## 1. Install GitLab Runner

Using Homebrew:

```bash
brew install gitlab-runner
```

## 2. Register the Runner

1.  Go to your GitLab Project.
2.  Navigate to **Settings** > **CI/CD**.
3.  Expand the **Runners** section.
4.  Click **New Project Runner** (or find the registration token under "Specific runners").
5.  Copy the **Registration Token**.

Run the registration command in your terminal:

```bash
gitlab-runner register
```

Follow the prompts:
-   **GitLab instance URL**: Usually `https://gitlab.com/` (or your self-hosted URL).
-   **Registration token**: Paste the token you copied.
-   **Description**: e.g., `mac-runner`.
-   **Tags**: Leave empty or add tags (e.g., `macos`).
-   **Maintenance note**: Optional.
-   **Executor**: Choose `docker` (recommended) or `shell`.
    -   If you choose `docker`, you'll need to specify a default image (e.g., `ruby:2.7` or `alpine:latest`).

## 3. Start the Runner

```bash
brew services start gitlab-runner
```

## 4. Verify

Go back to **Settings** > **CI/CD** > **Runners** in GitLab. You should see your new runner listed with a green circle indicating it's active.

## Troubleshooting

-   **Docker**: If you chose the `docker` executor, make sure Docker Desktop is running.
-   **"Cannot connect to the Docker daemon" Error**:
    You need to mount the Docker socket so the runner can spawn sibling containers.
    1.  Open your runner config: `nano ~/.gitlab-runner/config.toml`
    2.  Find the `[runners.docker]` section.
    3.  Add `"/var/run/docker.sock:/var/run/docker.sock"` to the `volumes` list.
        ```toml
        volumes = ["/cache", "/var/run/docker.sock:/var/run/docker.sock"]
        ```
    4.  Restart the runner: `brew services restart gitlab-runner`

-   **Permissions**: If using `shell` executor, the runner executes commands as your user. Ensure it has permissions to run `gcloud`, `docker`, etc.
