---
name: Bad percentage data root cause
description: How inflated percentage values (>100) got into studentTestResults and how it was fixed.
---

During a test session, an upload-marks call with incorrect `totalMarks` (too small) created 4 rows where `percentage` was 2033–2667 instead of 0–100. These inflated the dashboard `avgScore` to 174%.

**Fix applied:**
- Deleted the 4 bad rows via a one-off cleanup script.
- Added server-side guard in `upload-marks`: if `result.score > totalMarks * 1.05`, skip the student and add a descriptive message to `skippedNames`.

**Why:** The `percentage` column is a postgres `real` (float) with no constraint; any value can be stored. The dashboard computes per-student averages and then averages those, so a single inflated row inflates the whole result dramatically.

**How to apply:** If dashboard avgScore looks impossible (>100), query `studentTestResultsTable` for rows with `percentage > 100` and remove them. The cleanup script pattern is in the git history.
