To test your updated instructions agent:

1. **Go to your EAC app** (http://localhost:3001)
2. **Open the terminal panel** (chat section)
3. **Type a test command** like:
   ```
   /instructions create effective reddit marketing posts for SaaS products
   ```

This should now generate:

- **Filename**: `reddit-marketing-saas-posts.md` (instead of the old messy name)
- **Header**: `# Instructions: Create Effective Reddit Marketing Posts For SaaS Products` (instead of the verbose duplicate)

The changes I made are:

- Better filename normalization (kebab-case, LLM-generated)
- Cleaner header generation (removes redundant "create instructions for" phrases)
- More robust fallback logic

If you still see old files with messy names, those are existing files in your database. The new logic only applies to newly created instruction files.
