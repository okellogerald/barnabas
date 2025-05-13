-Statistics for the dashboard. You talked about implementing sth with cube.js
-If possible, member-count for each `opportunity`
-If possible, member-count for each `fellowship`

>>UI
- Work on the member count on the fellowship list and details page. 
- Add a members table on fellowship
- Have one configurable table dialog component to show tables: it should handle pagination, adjustable visible columns etc. Each model that will ever be used on this dialog should be configured to work so. This is to enable anywhere in the app, a user can just click to see a table of a model be it members or any other.
- Huge refactor to have one consistent file-naming, consistent and documented folder-structure, new-state implementation for members and fellowships implementations, new-query-builder for all models