1. Dashboard stats with Cube.js
2. Add member count to opportunities
3. Add member count to fellowships
4. API endpoint to remove members from fellowships
5. API endpoint to remove members from opportunities

>>UI
- Make sure filters in each list table work
- Have one configurable table dialog component to show tables: it should handle pagination, adjustable visible columns etc. Each model that will ever be used on this dialog should be configured to work so. This is to enable anywhere in the app, a user can just click to see a table of a model be it members or any other.
- Huge refactor to have one consistent file-naming, consistent and documented folder-structure, new-state implementation for members and fellowships implementations, new-query-builder for all models
