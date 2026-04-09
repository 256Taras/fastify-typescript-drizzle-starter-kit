---
description: Lock a test file so Claude cannot edit it. Use the test-as-oracle pattern — write the test first, lock it, then ask Claude to make the implementation pass.
allowed-tools: Bash(touch:*), Bash(ls:*), Read
argument-hint: <test-file-path>
---

# /lock-test — Test-as-Oracle pattern

Test file: `$ARGUMENTS`

## Steps

1. Verify the file exists:
   ```!
   ls -la $ARGUMENTS
   ```

2. Read the test to confirm it makes sense:
   - Read `$ARGUMENTS`

3. Create the lock file:
   ```
   touch $ARGUMENTS.lock
   ```

4. Confirm:
   ```!
   ls -la ${ARGUMENTS}.lock
   ```

5. Tell me: "Test is locked. I will now make the implementation pass without modifying the test. To unlock later: `rm $ARGUMENTS.lock`"

## Pattern usage

```
1. You write tests/e2e/users/create-user.test.ts with expected behaviors
2. /lock-test tests/e2e/users/create-user.test.ts
3. "Implement the create user mutation so this test passes"
4. Claude physically cannot cheat by changing the test
5. When done: rm tests/e2e/users/create-user.test.ts.lock
```
