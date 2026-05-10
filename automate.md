# SDK Automated Publishing Plan

This document outlines the plan to automate publishing of all three PingBus SDKs (**Node**, **Python**, **Java**) to their respective package registries using a **single GitHub Actions workflow** triggered by a version tag.

---

## Trigger Strategy

A single git tag pushed to the repository triggers the entire pipeline:

```bash
git tag v0.6.0
git push origin v0.6.0
```

The tag format must match `v*.*.*` (e.g. `v0.6.0`, `v1.0.0`, `v1.2.3`).

The version number is extracted from the tag automatically — no manual version bumping in each SDK file during CI.

---

## High-Level Flow

```
git tag v0.6.0 → push tag
         │
         ▼
  GitHub Actions triggers
         │
    ┌────┴──────────────────────────┐
    │   Extract version from tag    │
    │   (strips the leading 'v')    │
    └────┬──────────────────────────┘
         │
    ┌────▼──────────────────────────────────────────────────────┐
    │  3 parallel jobs                                          │
    │                                                           │
    │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
    │  │  Node SDK    │  │ Python SDK   │  │   Java SDK     │  │
    │  │              │  │              │  │                │  │
    │  │ npm version  │  │ sed version  │  │ mvn versions:  │  │
    │  │ npm publish  │  │ twine upload │  │ set + deploy   │  │
    │  │  → NPM       │  │  → PyPI      │  │  → Maven       │  │
    │  └──────────────┘  └──────────────┘  │    Central     │  │
    │                                       └────────────────┘  │
    └───────────────────────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │  Create GitHub Release        │
    │  with auto-generated notes    │
    └───────────────────────────────┘
```

---

## Workflow File Location

```
.github/workflows/publish-sdks.yml
```

This single file handles all three SDKs in parallel jobs.

---

## Required GitHub Secrets

Go to **Settings > Secrets and variables > Actions** and add:

| Secret | Used By | Where to Get It |
| :--- | :--- | :--- |
| `NPM_TOKEN` | Node SDK | npmjs.com → Account → Access Tokens → Generate (Automation type) |
| `PYPI_TOKEN` | Python SDK | pypi.org → Account Settings → API Tokens → Add token |
| `CENTRAL_USERNAME` | Java SDK | central.sonatype.com → Account → Generate User Token |
| `CENTRAL_PASSWORD` | Java SDK | Same as above (the token secret, not your login password) |
| `GPG_PRIVATE_KEY` | Java SDK | `gpg --armor --export-secret-keys YOUR_KEY_ID` |
| `GPG_PASSPHRASE` | Java SDK | The passphrase used when creating your GPG key |

> [!IMPORTANT]
> Maven Central requires all artifacts to be **GPG signed**. Your GPG key must already be uploaded to a public keyserver:
> ```bash
> gpg --keyserver keyserver.ubuntu.com --send-keys YOUR_KEY_ID
> ```

---

## Per-SDK Publishing Details

### Node SDK (`sdks/node`)

- **Registry:** npmjs.com
- **Package name:** `@pingbus/sdk`
- **Version source:** `package.json` → bumped at publish time using `npm version`
- **Build step:** `npm run build` (compiles TypeScript via `tsc`)
- **Publish command:** `npm publish --access public`
- **Auth:** `NPM_TOKEN` written to `.npmrc`

### Python SDK (`sdks/python`)

- **Registry:** PyPI
- **Package name:** `pingbus`
- **Version source:** `setup.py` → version string replaced by `sed` using the tag
- **Build step:** `python -m build` (generates `.whl` and `.tar.gz` in `dist/`)
- **Publish command:** `twine upload dist/*`
- **Auth:** `PYPI_TOKEN` via `TWINE_PASSWORD` env variable

### Java SDK (`sdks/java`)

- **Registry:** Maven Central (via Sonatype Central Portal)
- **Coordinates:** `io.github.divyanshsaraswat:pingbus`
- **Version source:** `pom.xml` → bumped using `mvn versions:set`
- **Build step:** `mvn clean package` (compiles, runs tests, generates sources + javadoc JARs)
- **Sign step:** `maven-gpg-plugin` signs all artifacts using the imported GPG key
- **Publish command:** `mvn deploy` (central-publishing-maven-plugin handles upload + auto-publish)
- **Auth:** `CENTRAL_USERNAME` + `CENTRAL_PASSWORD` injected into Maven `settings.xml`

---

## Version Bumping Strategy

No manual edits needed. At CI time, the version in each SDK's config file is updated to match the tag:

| SDK | File | How |
| :--- | :--- | :--- |
| Node | `package.json` | `npm version $VERSION --no-git-tag-version` |
| Python | `setup.py` | `sed -i "s/version=\".*\"/version=\"$VERSION\"/" setup.py` |
| Java | `pom.xml` | `mvn versions:set -DnewVersion=$VERSION -DgenerateBackupPoms=false` |

---

## GitHub Release

After all three jobs complete successfully, a final job creates a **GitHub Release** using the tag, with auto-generated release notes from commit history.

---

## Pre-Publish Checklist (Before Tagging)

Before pushing a version tag, confirm:

- [ ] All SDK source code is correct and up-to-date on `main`
- [ ] NPM account has the `@pingbus` scope claimed
- [ ] PyPI account owns the `pingbus` package name
- [ ] Sonatype Central account is verified and namespace `io.github.divyanshsaraswat` is claimed
- [ ] GPG key is uploaded to a public keyserver
- [ ] All 6 GitHub Secrets are configured in the repository

---

## Rollback

If a bad version is published:

| Registry | Rollback Action |
| :--- | :--- |
| **NPM** | `npm deprecate @pingbus/sdk@<version> "broken release"` — cannot delete, only deprecate |
| **PyPI** | Go to pypi.org → Manage → Delete release (allowed within first hour) |
| **Maven Central** | Cannot be deleted once published — publish a patch version (e.g. `v0.6.1`) immediately |
