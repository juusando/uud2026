<!-- AI Interaction Rules (IMPORTANT)
- **ALWAYS ask clarifying questions before starting** - never implement without asking questions first
- **Do NOT open preview automatically** - only open when explicitly asked
- **Be concise** - skip verbose explanations and step-by-step narration
- **No repetition** - don't repeat what you're doing or explain the obvious
- **Action-focused** - provide code and brief context only
- **No developer explanations** - user is not a developer, no details or explanations
- **Never auto-preview** - don't run preview after completing tasks
- Show alternatives only when there are genuine trade-offs
- Highlight critical issues or edge cases briefly
- Always provide working, complete code (no placeholders)
- **ANSWER MY QUESTIONS** - Always answer the user's questions, even if they're not directly related to the task before you start implementing. 
 - **ALWAYS WRITE FULL CODE** - I must deliver complete, working code and perform changes directly; do not ask the user to execute steps.

## Efficiency Rules (CRITICAL - COST CONTROL)
- **NO TODO LISTS** - Only use todo_write for genuinely complex multi-step tasks (3+ major steps)
- **NO EXCESSIVE SEARCHING** - Don't search/explore unless absolutely necessary
- **NO TEST FILES** - Never create test files unless explicitly requested
- **NO SERVER RESTARTS** - Use existing running servers, don't restart unnecessarily
- **NO "LET ME CHECK" LOOPS** - Avoid repeated verification steps
- **DIRECT ACTION** - If you can do it in 1-3 tool calls, just do it
- **MAXIMUM 5 TOOL CALLS** - For simple tasks, limit yourself to 5 tool calls total
- **DON'T BREAK WORKING CODE** - Never modify unrelated functions or styles that are working
- **NO PERMISSION ASKING** - Skip asking permission for safe changes
- **MAX 50 WORDS RESPONSE** - Keep responses under 50 words unless complex
- **NO BACKUP FILES** - Never create backup or duplicate files
- **NO VALIDATION LOOPS** - Don't double-check after changes unless critical
- **SKIP ERROR HANDLING** - Don't add error handling unless explicitly requested
- **NO ALTERNATIVES** - Don't suggest alternatives unless asked
- **NO DOCUMENTATION** - Never create docs/README unless explicitly requested
- **SKIP DEPENDENCY CHECKS** - Don't verify dependencies unless failing
- **NO UNUSED CODE** - Never leave unused code or files in the project


## Comprehensive Task Completion (CRITICAL)
- **COMPLETE EVERYTHING NEEDED** - When given any task, complete the primary task AND automatically identify and fix any related issues that would prevent it from working
- **PROACTIVE PROBLEM SOLVING** - Check for and resolve dependencies, prerequisites, conflicts, missing imports, routing issues, authentication blocks, database connectivity, CSS conflicts, JavaScript errors, performance issues, and security vulnerabilities
- **END-TO-END FUNCTIONALITY** - Test complete functionality and fix any errors discovered during testing
- **FULL INTEGRATION** - Ensure complete integration with existing systems, never leave partial implementations
- **BLOCKING ISSUE RESOLUTION** - Automatically fix anything that could stop the requested feature from working properly
- **DELIVER WORKING SOLUTIONS** - Always deliver fully functional features, not just code that might not work due to other issues

## External Documentation
- **Always check PocketBase documentation** at https://pocketbase.io/docs/ when working with PocketBase features
- Reference official PocketBase docs for API methods, authentication, and database operations
- Verify PocketBase syntax and best practices from official documentation before implementing them in PocketBase

- Dont restart the server in a new terminal to capture the preview URL. -->