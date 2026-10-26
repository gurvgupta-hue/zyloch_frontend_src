# Contributing Guidelines

Thank you for contributing to this project.

This document defines the standards and procedures for contributing code, documentation, configuration, infrastructure, tests, and other changes to this repository.

All contributors are expected to follow:

- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- Repository security requirements
- Applicable organizational development and security policies

---

# 1. Contribution Workflow

All changes should follow this general workflow:

```text
Create Branch
    ↓
Make Changes
    ↓
Run Local Tests
    ↓
Run Security Checks
    ↓
Commit Changes
    ↓
Push Branch
    ↓
Create Pull Request
    ↓
Automated CI / Security Validation
    ↓
Code Review
    ↓
Approval
    ↓
Merge
```

Direct commits to protected branches are not permitted unless explicitly authorized.

---

# 2. Branching Strategy

Create a branch from the latest default branch.

Recommended branch naming:

```text
feature/<description>
fix/<description>
security/<description>
hotfix/<description>
docs/<description>
refactor/<description>
chore/<description>
```

Examples:

```text
feature/add-sbom-generation
fix/mongodb-timeout
security/update-vulnerable-dependency
docs/update-api-guide
```

Keep branch names short and descriptive.

---

# 3. Keep Your Branch Updated

Before opening or updating a Pull Request:

```bash
git checkout main
git pull origin main

git checkout <your-branch>
git rebase main
```

Alternatively, use your team's approved merge workflow.

Resolve merge conflicts locally whenever possible.

---

# 4. Commit Guidelines

Commits should be:

- Small
- Focused
- Reviewable
- Descriptive
- Related to a single logical change

Recommended commit format:

```text
<type>: <short description>
```

Examples:

```text
feat: add repository inventory scanner
fix: handle MongoDB connection timeout
security: update vulnerable axios dependency
docs: update deployment instructions
refactor: simplify authentication middleware
test: add API authorization tests
```

Recommended commit types:

```text
feat
fix
security
docs
refactor
test
build
ci
chore
```

Avoid vague commit messages such as:

```text
update
changes
fix stuff
working
final
test
```

---

# 5. Pull Request Requirements

Every change should be submitted through a Pull Request unless an approved emergency process exists.

Pull Requests should include:

- Clear title
- Description of the change
- Reason for the change
- Testing performed
- Security impact, when applicable
- Related issue or ticket, when applicable
- Screenshots or logs when useful

Example:

```text
## Summary

Adds SBOM generation to the CI workflow.

## Changes

- Added CycloneDX SBOM generation
- Added SBOM artifact upload
- Added dependency validation

## Testing

- Tested locally
- CI pipeline passed
- Dependency scanner passed

## Security Impact

Improves software supply-chain visibility.

## Related Issue

Closes #123
```

---

# 6. Pull Request Size

Keep Pull Requests reasonably small.

Avoid combining unrelated changes in a single Pull Request.

For large changes, consider splitting the work into:

```text
PR 1 - Infrastructure
PR 2 - Backend changes
PR 3 - Frontend changes
PR 4 - Security controls
PR 5 - Documentation
```

Smaller Pull Requests are easier to review and reduce security and operational risk.

---

# 7. Code Review Requirements

Pull Requests require review before merge.

Reviewers should verify:

- Correctness
- Security
- Maintainability
- Test coverage
- Dependency changes
- Configuration changes
- Error handling
- Authentication and authorization
- Input validation
- Logging behavior
- Secrets handling

Security-sensitive changes may require additional review from:

```text
Security Team
Platform Team
Repository Owners
CODEOWNERS
```

Authors should not approve their own Pull Requests where repository controls support separation of duties.

---

# 8. Protected Repository Files

Certain files protect repository identity, governance, or security controls.

Examples include:

```text
.github/.repository-id
.repo-watermark
.github/CODEOWNERS
.github/workflows/*
SECURITY.md
CODE_OF_CONDUCT.md
CONTRIBUTING.md
```

Contributors must not remove or bypass these files without explicit authorization.

Changes to protected files may require additional approval.

Pull Requests attempting to delete protected repository metadata may be automatically blocked.

---

# 9. Repository Identification and Watermarking

This repository may contain files used to identify repository ownership and provenance.

Examples:

```text
.github/.repository-id
.repo-watermark
```

These files must not be:

- Deleted
- Renamed
- Replaced
- Altered without authorization
- Excluded from copies intentionally
- Bypassed through CI manipulation

If a legitimate modification is required, obtain repository-owner approval.

---

# 10. Coding Standards

Contributors should follow the coding conventions already used in the project.

At a minimum:

- Use meaningful variable names.
- Keep functions focused.
- Avoid unnecessary complexity.
- Document non-obvious behavior.
- Handle errors appropriately.
- Avoid duplicated code where practical.
- Validate untrusted input.
- Avoid hardcoded configuration.
- Do not hardcode credentials.
- Prefer secure defaults.

Language-specific linting and formatting requirements should also be followed.

---

# 11. Testing Requirements

Changes should include appropriate tests.

Depending on the project, this may include:

```text
Unit Tests
Integration Tests
API Tests
Security Tests
End-to-End Tests
Regression Tests
Infrastructure Validation
```

Before opening a Pull Request, run relevant tests locally where possible.

Example:

```bash
npm test
```

or:

```bash
pytest
```

or:

```bash
go test ./...
```

A Pull Request should not be merged when required tests are failing.

---

# 12. Security Requirements

Security is part of the development lifecycle.

Contributors must not knowingly introduce:

- Secrets
- Vulnerable dependencies
- Malicious packages
- Backdoors
- Insecure authentication
- Authorization bypasses
- Unsafe deserialization
- Command injection
- SQL injection
- Cross-site scripting
- Weak cryptography
- Unnecessary permissions
- Unsafe infrastructure configuration

Security controls should not be disabled simply to make a build pass.

---

# 13. Secrets

Never commit:

```text
Passwords
API Keys
Tokens
SSH Keys
Private Keys
Cloud Credentials
Database Credentials
Certificates containing private keys
```

Use environment variables or approved secret-management platforms.

Example:

```bash
DATABASE_PASSWORD=${DATABASE_PASSWORD}
```

Do not use:

```text
DATABASE_PASSWORD=my-secret-password
```

If a secret is accidentally committed, immediately:

1. Revoke or rotate the secret.
2. Notify the appropriate repository or security owner.
3. Remove the secret from the repository where appropriate.
4. Review whether the credential was used.

---

# 14. Dependency Management

New dependencies should be introduced only when necessary.

Before adding a dependency, consider:

- Is it actively maintained?
- Is the source trustworthy?
- Does it have known vulnerabilities?
- Is the license acceptable?
- Is a standard library alternative available?
- Is the package name correct?
- Could it be a typosquatting package?

Dependency updates may be handled through:

```text
Dependabot
Renovate
Approved automated tooling
```

Dependency changes should pass repository security checks.

---

# 15. Software Supply-Chain Security

Where configured, contributions must pass controls such as:

```text
Dependency Review
SCA
SBOM Generation
Secret Scanning
CodeQL
SAST
Container Scanning
IaC Scanning
Artifact Signing
Provenance Validation
```

Do not intentionally bypass these controls.

---

# 16. AI-Generated Code

AI-assisted coding tools may be used where permitted.

Examples:

```text
GitHub Copilot
ChatGPT
Claude
Gemini
AI coding agents
```

The contributor remains responsible for all submitted code.

AI-generated code must be reviewed for:

- Security
- Correctness
- Licensing
- Hallucinated APIs
- Vulnerable dependencies
- Secrets
- Unsafe shell commands
- Excessive permissions
- Data leakage

AI-generated code receives the same review and testing requirements as human-written code.

---

# 17. Infrastructure as Code

Infrastructure changes should be reviewed carefully.

Examples include:

```text
Terraform
Kubernetes
Helm
Docker
Docker Compose
CloudFormation
Bicep
Ansible
GitHub Actions
```

Avoid:

```text
0.0.0.0/0 exposure without justification
privileged containers
host networking without justification
hardcoded cloud credentials
wildcard IAM permissions
unrestricted security groups
latest image tags for production
```

Use least privilege and secure defaults.

---

# 18. CI/CD Workflow Changes

Changes under:

```text
.github/workflows/
```

should receive additional scrutiny.

Reviewers should verify:

- Workflow permissions
- Secret usage
- Third-party GitHub Actions
- Action version pinning
- Artifact handling
- Deployment permissions
- Fork behavior
- Pull Request trust boundaries

Avoid unnecessarily granting:

```yaml
permissions: write-all
```

Prefer explicit least-privilege permissions.

---

# 19. Third-Party GitHub Actions

Use trusted GitHub Actions wherever possible.

For security-sensitive workflows, pin actions to a trusted version or commit.

Example:

```yaml
uses: actions/checkout@v4
```

Organizations with stricter supply-chain controls may pin to full commit SHAs.

Review new third-party actions before introducing them.

---

# 20. Documentation

User-facing or operational changes should include documentation updates where appropriate.

This may include:

```text
README.md
Deployment Guides
API Documentation
Architecture Documentation
Runbooks
Security Documentation
```

Documentation should reflect actual system behavior.

---

# 21. Breaking Changes

Clearly identify breaking changes in the Pull Request.

Include:

- What changes
- Who is affected
- Required migration steps
- Rollback procedure
- Compatibility considerations

Example:

```text
BREAKING CHANGE:

API endpoint /api/v1/login has been replaced with /api/v2/login.

Consumers must update before deployment.
```

---

# 22. Security Vulnerabilities

Do not report exploitable security vulnerabilities through public GitHub issues.

Follow the process documented in:

```text
SECURITY.md
```

Use GitHub Private Vulnerability Reporting when enabled.

---

# 23. Merge Requirements

A Pull Request may be merged only after required controls pass.

Typical requirements include:

```text
Required Reviews        PASS
Build                   PASS
Unit Tests              PASS
Integration Tests       PASS
CodeQL                  PASS
Secret Scan             PASS
Dependency Review       PASS
SCA                     PASS
Repository Integrity    PASS
```

Required security checks must not be bypassed without documented authorization.

---

# 24. Merge Strategy

The repository may use one of the following strategies:

```text
Squash and Merge
Rebase and Merge
Merge Commit
```

The repository owner should define the preferred method.

For most development repositories, `Squash and Merge` is recommended to maintain a clean history.

---

# 25. Emergency Changes

Emergency or production-critical changes should still maintain appropriate controls.

Where normal procedures must be bypassed:

1. Document the reason.
2. Limit the change to the minimum required.
3. Obtain appropriate approval.
4. Validate the change.
5. Perform a post-change review.
6. Restore normal controls.

Emergency access should not become a normal development workflow.

---

# 26. Contributor Checklist

Before submitting a Pull Request, confirm:

```text
[ ] My branch is based on the latest default branch.

[ ] The change has a clear purpose.

[ ] I have reviewed my own code.

[ ] Tests have been added or updated where appropriate.

[ ] Existing tests pass.

[ ] No secrets or credentials are included.

[ ] Dependencies are trusted and necessary.

[ ] Security implications have been considered.

[ ] Documentation has been updated where necessary.

[ ] Repository identity files remain intact.

[ ] I have not disabled security controls.

[ ] CI/CD workflows follow least privilege.

[ ] AI-generated code, if used, has been manually reviewed.

[ ] The Pull Request description explains the change.

[ ] Breaking changes are clearly documented.
```

---

# 27. Questions

If you are unsure about:

- Contribution requirements
- Security requirements
- Architecture decisions
- Dependency approvals
- Repository policies

Contact the repository maintainers before submitting significant changes.

---

## Repository Governance

This repository follows:

```text
CODE_OF_CONDUCT.md
CONTRIBUTING.md
SECURITY.md
CODEOWNERS
```

Together, these files define the project's contribution, security, ownership, and ethical-development expectations.