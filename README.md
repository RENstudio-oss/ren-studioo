# REN Studio — Netlify CMS Edition

This project uses the exact REN Studio v5 frontend with Decap CMS (formerly Netlify CMS). Posts and images can be published from `/admin/` without editing HTML.

## What happens when you publish

1. You create a post in the CMS.
2. Decap saves a Markdown file and uploaded image to the GitHub repository.
3. Netlify notices the change and runs `node build.js`.
4. The homepage, article page and category pages are rebuilt automatically.
5. Netlify publishes the new version.

No third-party build packages are required.

## Test on your computer

1. Make sure Node.js 18 or newer is installed.
2. Open a terminal inside this folder.
3. Run `node build.js`.
4. Open `_site/index.html`.

The static preview works locally. The `/admin/` login requires the Netlify/Git setup described below.

## Put the project on GitHub

Create a new GitHub repository and upload the **contents of this folder**, not the outer ZIP. The repository root must contain:

```text
admin/
content/
site/
build.js
netlify.toml
package.json
```

## Deploy through Netlify

1. In Netlify, choose **Add new project → Import an existing project**.
2. Connect GitHub and choose the repository.
3. Netlify reads `netlify.toml` automatically:
   - Build command: `node build.js`
   - Publish directory: `_site`
4. Deploy the site.

## Enable the CMS login

This starter uses Decap's `git-gateway` backend.

1. In the Netlify project, open **Configuration → Identity**.
2. Enable Identity.
3. Set registration to **Invite only**.
4. Under Identity services, enable **Git Gateway**.
5. Invite your own email address.
6. Accept the invitation and create the password.
7. Open `https://YOUR-SITE.netlify.app/admin/`.
8. Sign in and create or edit posts.

If Identity is not offered in your Netlify account, use the GitHub backend plus an OAuth provider instead. Do not make the site public with open registration.

## CMS fields

- Title
- Publish date
- Short homepage description
- Cover image
- Category
- Featured switch
- Reading time
- Markdown article body

The newest post marked **Featured** becomes the large homepage feature. The next three posts become the story rows.

## Before AdSense

The policy pages are included, but must be updated to match the real owner, contact email, hosting, analytics and advertising services. Connect the Contact form to a real service. Configure Google's certified consent-management platform when required; the included preview notice is not a certified CMP.
