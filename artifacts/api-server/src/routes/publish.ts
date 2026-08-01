import { Router } from "express";

const publishRouter = Router();

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function buildSiteHTML(opts: {
  videoId: string | null;
  adsenseId: string;
}): string {
  const { videoId, adsenseId } = opts;

  const adBlock = adsenseId
    ? `<ins class="adsbygoogle"
         style="display:inline-block;width:320px;height:50px"
         data-ad-client="${adsenseId}"
         data-ad-slot="auto"></ins>
       <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}" crossorigin="anonymous"></script>
       <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>`
    : `<div style="width:320px;height:50px;background:#f0fdf4;border:1.5px dashed #059669;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:Arial;font-size:11px;color:#059669;font-weight:600;">Espace AdSense</div>`;

  const videoBlock = videoId
    ? `<iframe
         src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1"
         allow="autoplay; encrypted-media; fullscreen"
         allowfullscreen
         frameborder="0"
         style="width:100%;height:100%;border:none;"></iframe>`
    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-family:Arial;font-size:14px;">Aucune vidéo configurée</div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
  <title>Mon Mini-Site</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;overflow:hidden;background:#000;font-family:Arial,sans-serif}
    .ad-bar{position:fixed;top:0;left:0;right:0;height:60px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;z-index:999}
    .video{position:absolute;top:60px;left:0;right:0;bottom:0}
  </style>
</head>
<body>
  <div class="ad-bar">${adBlock}</div>
  <div class="video">${videoBlock}</div>
</body>
</html>`;
}

publishRouter.post("/publish", async (req, res) => {
  const { youtubeUrl = "", adsenseId = "", domainType, subdomainName = "", customDomain = "" } =
    req.body as {
      youtubeUrl?: string;
      adsenseId?: string;
      domainType?: string;
      subdomainName?: string;
      customDomain?: string;
    };

  const vercelToken = process.env["VERCEL_ACCESS_TOKEN"];
  const githubToken = process.env["GITHUB_ACCESS_TOKEN"];

  if (!vercelToken) {
    res.status(500).json({ error: "VERCEL_ACCESS_TOKEN not configured" });
    return;
  }

  const videoId = extractVideoId(youtubeUrl);
  const html = buildSiteHTML({ videoId, adsenseId });
  const projectName =
    (domainType === "subdomain" ? subdomainName : customDomain?.split(".")[0]) ||
    "mchap-site";

  try {
    // --- Deploy to Vercel ---
    const vResp = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        files: [{ file: "index.html", data: html }],
        projectSettings: { framework: null },
        target: "production",
      }),
    });

    const vData = (await vResp.json()) as Record<string, unknown>;

    if (!vResp.ok) {
      req.log.error({ vData }, "Vercel deploy error");
      res.status(502).json({ error: "Vercel deployment failed" });
      return;
    }

    const deployedUrl = `https://${vData["url"] as string}`;

    // --- Push index.html to GitHub (best-effort) ---
    let githubCommitUrl: string | null = null;
    if (githubToken) {
      try {
        const userR = await fetch("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${githubToken}` },
        });
        const user = (await userR.json()) as Record<string, unknown>;
        const owner = user["login"] as string;

        const existingR = await fetch(
          `https://api.github.com/repos/${owner}/Mchap/contents/index.html`,
          { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json" } },
        );
        const existing = existingR.ok
          ? ((await existingR.json()) as Record<string, unknown>)
          : null;

        const body: Record<string, unknown> = {
          message: `🚀 Mini-site mis à jour — ${new Date().toISOString()}`,
          content: Buffer.from(html).toString("base64"),
        };
        if (existing?.["sha"]) body["sha"] = existing["sha"];

        const pushR = await fetch(
          `https://api.github.com/repos/${owner}/Mchap/contents/index.html`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${githubToken}`,
              "Content-Type": "application/json",
              Accept: "application/vnd.github+json",
            },
            body: JSON.stringify(body),
          },
        );
        if (pushR.ok) {
          const pushData = (await pushR.json()) as Record<string, unknown>;
          const commit = pushData["commit"] as Record<string, unknown> | undefined;
          githubCommitUrl = (commit?.["html_url"] as string) ?? null;
        }
      } catch (ghErr) {
        req.log.warn({ ghErr }, "GitHub push skipped");
      }
    }

    res.json({ url: deployedUrl, githubCommitUrl, status: "deployed" });
  } catch (err) {
    req.log.error({ err }, "Publish failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default publishRouter;
