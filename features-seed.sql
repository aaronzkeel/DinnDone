-- Dinner Bell Features Seed
-- ~200 features organized by milestone with dependencies
-- Foundation (0-19): No dependencies
-- Grocery List (20-64): Depends on Foundation
-- Meal Helper (65-109): Depends on Foundation
-- Weekly Planning (110-154): Depends on Foundation
-- Notifications (155-199): Depends on Foundation

-- ============================================================================
-- MILESTONE 1: FOUNDATION (Features 0-19)
-- ============================================================================

INSERT INTO features (id, priority, category, name, description, steps, passes, in_progress, dependencies) VALUES
(0, 0, 'foundation', 'Next.js project initializes without errors', 'Project scaffolding with Next.js App Router, TypeScript, and Tailwind CSS', '["Step 1: Run npm install", "Step 2: Run npm run dev", "Step 3: Verify app loads at localhost:3000 without console errors"]', 0, 0, '[]'),

(1, 1, 'foundation', 'Tailwind configured with Harvest Hug + Brick palette', 'Custom color tokens from DESIGN-TOKENS.md are available in Tailwind', '["Step 1: Check tailwind.config.js has custom colors", "Step 2: Verify primary (#E2A93B), secondary (#4F6E44), danger (#B94A34) are defined", "Step 3: Test colors render correctly in a component"]', 0, 0, '[0]'),

(2, 2, 'foundation', 'Google Fonts loaded (Lora + Plus Jakarta Sans)', 'Typography configured per DESIGN-TOKENS.md', '["Step 1: Check fonts are imported in layout or CSS", "Step 2: Verify Lora renders for headings", "Step 3: Verify Plus Jakarta Sans renders for body text"]', 0, 0, '[0]'),

(3, 3, 'foundation', 'Convex backend connected', 'Convex provider wraps the app and connects to deployment', '["Step 1: ConvexProvider is in layout.tsx", "Step 2: NEXT_PUBLIC_CONVEX_URL is set in .env.local", "Step 3: No connection errors in console"]', 0, 0, '[0]'),

(4, 4, 'foundation', 'Convex schema defines all core entities', 'Database schema includes HouseholdMember, WeekPlan, PlannedMeal, GroceryItem, Store, Notification, NotificationPreferences', '["Step 1: Check convex/schema.ts exists", "Step 2: Verify all 7 entity tables are defined", "Step 3: Run npx convex dev and verify schema syncs"]', 0, 0, '[3]'),

(5, 5, 'security', 'Convex Auth configured with Google OAuth', 'Authentication system allows Google sign-in', '["Step 1: Auth provider is configured in Convex", "Step 2: Google OAuth credentials are set", "Step 3: Sign in with Google button works"]', 0, 0, '[3]'),

(6, 6, 'security', 'User can sign in with Google', 'Complete Google OAuth flow works end-to-end', '["Step 1: Click Sign in with Google", "Step 2: Complete Google OAuth flow", "Step 3: Redirected back to app as authenticated user"]', 0, 0, '[5]'),

(7, 7, 'security', 'User can sign out', 'Sign out clears session and returns to login', '["Step 1: Click sign out button", "Step 2: Session is cleared", "Step 3: Redirected to login/home page"]', 0, 0, '[6]'),

(8, 8, 'security', 'Protected routes require authentication', 'Unauthenticated users are redirected to sign in', '["Step 1: Try to access /grocery-list without signing in", "Step 2: Verify redirect to sign in page", "Step 3: After sign in, redirected to original destination"]', 0, 0, '[6]'),

(9, 9, 'functional', 'HouseholdMember seeded for Zink family', 'Database contains Aaron, Katie, Lizzie, Ethan, Elijah with correct roles', '["Step 1: Query HouseholdMember table", "Step 2: Verify 5 members exist", "Step 3: Verify Aaron and Katie are admins, kids are viewers"]', 0, 0, '[4]'),

(10, 10, 'navigation', 'App shell renders with header', 'Header shows app name (Dinner Bell) and user menu', '["Step 1: Load any page", "Step 2: Verify header displays Dinner Bell in Lora font", "Step 3: Verify user avatar/menu is visible when signed in"]', 0, 0, '[2, 6]'),

(11, 11, 'navigation', 'Bottom tab navigation renders', 'Mobile navigation with 4 tabs: Home, Plan, List, Notifications', '["Step 1: Load app on mobile viewport", "Step 2: Verify bottom nav is visible", "Step 3: Verify all 4 tabs are present and tappable"]', 0, 0, '[0]'),

(12, 12, 'navigation', 'Tab navigation switches views', 'Tapping tabs navigates to correct routes', '["Step 1: Tap Plan tab", "Step 2: Verify /weekly-planning route loads", "Step 3: Tap List tab, verify /grocery-list loads"]', 0, 0, '[11]'),

(13, 13, 'style', 'Active tab shows highlight state', 'Current tab is visually distinguished from others', '["Step 1: Navigate to Grocery List", "Step 2: Verify List tab has active styling", "Step 3: Other tabs show inactive styling"]', 0, 0, '[12]'),

(14, 14, 'style', 'App uses correct button colors', 'Green for go, Gold for change, Red for danger per DESIGN-TOKENS.md', '["Step 1: Find a primary action button", "Step 2: Verify it uses Sage Green (#4F6E44)", "Step 3: Find a secondary button, verify Gold (#E2A93B)"]', 0, 0, '[1]'),

(15, 15, 'style', 'Dark mode toggles correctly', 'App respects system preference and allows manual toggle', '["Step 1: Set system to dark mode", "Step 2: Verify app uses dark palette", "Step 3: Toggle to light mode, verify colors change"]', 0, 0, '[1]'),

(16, 16, 'style', 'Cards use correct background colors', 'Card components use Harvest Hug palette', '["Step 1: View a card component", "Step 2: Verify light mode uses #F3E8D6", "Step 3: Verify dark mode uses #221A14"]', 0, 0, '[1]'),

(17, 17, 'functional', 'PWA manifest configured', 'App can be installed as PWA with correct name and icons', '["Step 1: Check manifest.json exists", "Step 2: Verify name is Dinner Bell", "Step 3: Verify icons are configured"]', 0, 0, '[0]'),

(18, 18, 'functional', 'Service worker registered', 'Basic service worker for PWA functionality', '["Step 1: Load app in production mode", "Step 2: Check DevTools > Application > Service Workers", "Step 3: Verify service worker is registered"]', 0, 0, '[17]'),

(19, 19, 'functional', 'OpenRouter API connection works', 'Backend can call OpenRouter with configured API key', '["Step 1: Create test Convex action that calls OpenRouter", "Step 2: Verify OPENROUTER_API_KEY is set", "Step 3: Verify response is received from Gemini 3 Flash"]', 0, 0, '[3]');

-- ============================================================================
-- MILESTONE 2: GROCERY LIST (Features 20-64)
-- ============================================================================

INSERT INTO features (id, priority, category, name, description, steps, passes, in_progress, dependencies) VALUES
(20, 20, 'functional', 'Grocery List page renders', 'GroceryListView component loads at /grocery-list', '["Step 1: Navigate to /grocery-list", "Step 2: Verify page loads without errors", "Step 3: Verify GroceryListView component renders"]', 0, 0, '[10, 12]'),

(21, 21, 'functional', 'Store filter pills display', 'StoreFilters component shows All + configured stores', '["Step 1: View Grocery List page", "Step 2: Verify filter pills are visible at top", "Step 3: Verify All, Meijer, Costco, Aldi, Trader Joes are shown"]', 0, 0, '[20]'),

(22, 22, 'functional', 'Tapping store filter filters items', 'Selecting a store shows only items for that store', '["Step 1: Add items to multiple stores", "Step 2: Tap Costco filter", "Step 3: Verify only Costco items are visible"]', 0, 0, '[21, 25]'),

(23, 23, 'functional', 'All filter shows all items', 'Tapping All removes store filter', '["Step 1: Filter by Costco", "Step 2: Tap All filter", "Step 3: Verify items from all stores are visible"]', 0, 0, '[22]'),

(24, 24, 'functional', 'Items grouped by store', 'GroceryListView shows items organized under store headings', '["Step 1: Add items to different stores", "Step 2: Verify store section headings appear", "Step 3: Verify items appear under correct store"]', 0, 0, '[20]'),

(25, 25, 'functional', 'User can add grocery item', 'AddItemInput allows adding new items to a store', '["Step 1: Find Add item input in a store section", "Step 2: Type item name and press Enter", "Step 3: Verify item appears in the list"]', 0, 0, '[20, 4]'),

(26, 26, 'functional', 'Added item saves to Convex', 'New grocery items persist in database', '["Step 1: Add a new item", "Step 2: Refresh the page", "Step 3: Verify item still appears"]', 0, 0, '[25]'),

(27, 27, 'functional', 'User can add item with quantity', 'Items can have optional quantity like 2 lbs or 1 dozen', '["Step 1: Add item with quantity (e.g., Apples 2 lbs)", "Step 2: Verify quantity displays with item", "Step 3: Verify quantity persists after refresh"]', 0, 0, '[25]'),

(28, 28, 'functional', 'User can check off item', 'Tapping checkbox marks item as checked', '["Step 1: Find an unchecked item", "Step 2: Tap the checkbox", "Step 3: Verify item shows checked state"]', 0, 0, '[25]'),

(29, 29, 'functional', 'Checked items move to bottom', 'Checked items appear in Checked section', '["Step 1: Check off an item", "Step 2: Verify item moves to Checked section at bottom", "Step 3: Verify item has strikethrough or dimmed styling"]', 0, 0, '[28]'),

(30, 30, 'functional', 'User can uncheck item', 'Unchecking returns item to active list', '["Step 1: Find a checked item", "Step 2: Tap to uncheck", "Step 3: Verify item returns to its store section"]', 0, 0, '[29]'),

(31, 31, 'functional', 'User can edit item name', 'Inline editing allows changing item name', '["Step 1: Tap on item name or edit icon", "Step 2: Change the name", "Step 3: Verify new name saves and displays"]', 0, 0, '[25]'),

(32, 32, 'functional', 'User can edit item quantity', 'Quantity can be updated after creation', '["Step 1: Edit an existing item", "Step 2: Change the quantity", "Step 3: Verify new quantity displays"]', 0, 0, '[27]'),

(33, 33, 'functional', 'User can delete item', 'Items can be removed from list', '["Step 1: Find delete button or swipe action", "Step 2: Delete an item", "Step 3: Verify item is removed from list and database"]', 0, 0, '[25]'),

(34, 34, 'functional', 'User can move item to different store', 'Items can be reassigned to another store', '["Step 1: Open item edit or drag to new store", "Step 2: Change store assignment", "Step 3: Verify item appears under new store"]', 0, 0, '[25]'),

(35, 35, 'functional', 'Drag and drop reorders items within store', 'Items can be reordered by dragging', '["Step 1: Long press or drag an item", "Step 2: Drop in new position within same store", "Step 3: Verify order persists after refresh"]', 0, 0, '[24]'),

(36, 36, 'style', 'Organic badge displays on organic items', 'Items flagged as organic show a badge', '["Step 1: Add an item marked as organic", "Step 2: Verify organic badge/icon displays", "Step 3: Verify badge uses appropriate styling"]', 0, 0, '[25]'),

(37, 37, 'functional', 'User can toggle organic flag', 'Organic status can be set when adding or editing', '["Step 1: Add or edit an item", "Step 2: Toggle organic flag on", "Step 3: Verify organic badge appears"]', 0, 0, '[36]'),

(38, 38, 'functional', 'Linked meals show on item', 'Items linked to planned meals show meal indicator', '["Step 1: View item that came from a weekly plan", "Step 2: Verify linked meal name displays", "Step 3: Tapping shows which meals need this item"]', 0, 0, '[25]'),

(39, 39, 'functional', 'User can add new store', 'Store management allows adding custom stores', '["Step 1: Open store management", "Step 2: Add a new store name", "Step 3: Verify new store appears in filters and sections"]', 0, 0, '[21]'),

(40, 40, 'functional', 'User can rename store', 'Existing stores can be renamed', '["Step 1: Open store management", "Step 2: Edit store name", "Step 3: Verify new name displays everywhere"]', 0, 0, '[39]'),

(41, 41, 'functional', 'User can delete store', 'Stores with no items can be removed', '["Step 1: Open store management", "Step 2: Delete a store", "Step 3: Verify store is removed from filters"]', 0, 0, '[39]'),

(42, 42, 'functional', 'Real-time sync between users', 'Changes appear instantly for other household members', '["Step 1: Open list on two devices", "Step 2: Add item on device 1", "Step 3: Verify item appears on device 2 within seconds"]', 0, 0, '[26]'),

(43, 43, 'error-handling', 'Empty state shows when no items', 'Helpful message when grocery list is empty', '["Step 1: Delete all items from list", "Step 2: Verify empty state message displays", "Step 3: Verify message encourages adding first item"]', 0, 0, '[20]'),

(44, 44, 'error-handling', 'Empty state for filtered store', 'Message when selected store has no items', '["Step 1: Filter to a store with no items", "Step 2: Verify appropriate message displays", "Step 3: Verify user can still add items"]', 0, 0, '[22]'),

(45, 45, 'error-handling', 'Handles very long item names', 'Long names truncate gracefully', '["Step 1: Add item with very long name (50+ chars)", "Step 2: Verify name truncates with ellipsis", "Step 3: Full name visible on tap/hover"]', 0, 0, '[25]'),

(46, 46, 'error-handling', 'Handles special characters in names', 'Items with quotes, ampersands work correctly', '["Step 1: Add item like Peanut Butter & Jelly", "Step 2: Verify displays correctly", "Step 3: Verify saves and loads correctly"]', 0, 0, '[25]'),

(47, 47, 'style', 'Store sections have distinct visual separation', 'Each store section is clearly delineated', '["Step 1: View list with multiple stores", "Step 2: Verify visual separation between stores", "Step 3: Verify store headers are prominent"]', 0, 0, '[24]'),

(48, 48, 'style', 'Checked items have muted styling', 'Checked items are visually de-emphasized', '["Step 1: Check off an item", "Step 2: Verify strikethrough or opacity change", "Step 3: Verify checked section header indicates count"]', 0, 0, '[29]'),

(49, 49, 'style', 'Add item input has clear affordance', 'Users can easily find where to add items', '["Step 1: View a store section", "Step 2: Verify + Add item or input field is visible", "Step 3: Verify it has clear placeholder text"]', 0, 0, '[25]'),

(50, 50, 'accessibility', 'Checkbox has proper aria label', 'Screen readers announce item name with checkbox', '["Step 1: Inspect checkbox element", "Step 2: Verify aria-label includes item name", "Step 3: Test with screen reader"]', 0, 0, '[28]'),

(51, 51, 'accessibility', 'Store filters are keyboard navigable', 'Users can tab through and select filters', '["Step 1: Focus on filter pills", "Step 2: Tab through options", "Step 3: Press Enter to select, verify it works"]', 0, 0, '[21]'),

(52, 52, 'accessibility', 'Drag and drop has keyboard alternative', 'Reordering works without mouse', '["Step 1: Focus on an item", "Step 2: Use keyboard shortcut to move", "Step 3: Verify item reorders"]', 0, 0, '[35]'),

(53, 53, 'functional', 'Grocery list works offline', 'PWA caches list for offline viewing', '["Step 1: Load grocery list while online", "Step 2: Go offline", "Step 3: Verify list still displays"]', 0, 0, '[18, 20]'),

(54, 54, 'functional', 'Offline changes sync when back online', 'Edits made offline sync to Convex', '["Step 1: Go offline", "Step 2: Check off an item", "Step 3: Go online, verify change syncs"]', 0, 0, '[53]'),

(55, 55, 'functional', 'Voice input adds items', 'Microphone button captures speech to add items', '["Step 1: Tap microphone button", "Step 2: Say item name", "Step 3: Verify item is added to list"]', 0, 0, '[25]'),

(56, 56, 'style', 'List is responsive on mobile', 'Layout works well on phone screens', '["Step 1: View on mobile viewport (375px)", "Step 2: Verify no horizontal scroll", "Step 3: Verify touch targets are large enough"]', 0, 0, '[20]'),

(57, 57, 'style', 'List is responsive on tablet', 'Layout adapts to tablet screens', '["Step 1: View on tablet viewport (768px)", "Step 2: Verify layout uses space well", "Step 3: Verify still usable with touch"]', 0, 0, '[20]'),

(58, 58, 'style', 'List is responsive on desktop', 'Layout works on large screens', '["Step 1: View on desktop viewport (1280px)", "Step 2: Verify max-width constraint", "Step 3: Verify comfortable reading width"]', 0, 0, '[20]'),

(59, 59, 'functional', 'Clear all checked items', 'Bulk action to remove all checked items', '["Step 1: Check off multiple items", "Step 2: Find Clear checked button", "Step 3: Verify all checked items are removed"]', 0, 0, '[29]'),

(60, 60, 'functional', 'Item count shows per store', 'Store headers show number of items', '["Step 1: View store section header", "Step 2: Verify item count displays", "Step 3: Verify count updates when items added/removed"]', 0, 0, '[24]'),

(61, 61, 'functional', 'Total item count shows', 'Header shows total items in list', '["Step 1: View grocery list header", "Step 2: Verify total count displays", "Step 3: Verify count updates dynamically"]', 0, 0, '[20]'),

(62, 62, 'style', 'Filter pills scroll horizontally if needed', 'Many stores dont break layout', '["Step 1: Add 6+ stores", "Step 2: Verify filter pills scroll horizontally", "Step 3: Verify no layout break"]', 0, 0, '[21]'),

(63, 63, 'functional', 'Recently checked items can be quickly re-added', 'History of recent items for quick add', '["Step 1: Check off and clear an item", "Step 2: Find recent items suggestion", "Step 3: Tap to re-add to list"]', 0, 0, '[59]'),

(64, 64, 'error-handling', 'Duplicate item warning', 'Alert when adding item that already exists', '["Step 1: Add Milk to list", "Step 2: Try to add Milk again", "Step 3: Verify warning or merge prompt"]', 0, 0, '[25]');

-- ============================================================================
-- MILESTONE 3: MEAL HELPER (Features 65-109)
-- ============================================================================

INSERT INTO features (id, priority, category, name, description, steps, passes, in_progress, dependencies) VALUES
(65, 65, 'functional', 'Meal Helper page renders', 'MealHelperHome component loads at /meal-helper or home', '["Step 1: Navigate to Meal Helper tab", "Step 2: Verify page loads without errors", "Step 3: Verify MealHelperHome component renders"]', 0, 0, '[10, 12]'),

(66, 66, 'functional', 'Tonights Plan card displays', 'TonightPlanCard shows current days planned meal', '["Step 1: Have a weekly plan with todays meal", "Step 2: View Meal Helper", "Step 3: Verify tonights meal name and details show"]', 0, 0, '[65]'),

(67, 67, 'functional', 'Tonights Plan shows cook name', 'Card displays who is cooking tonight', '["Step 1: View Tonights Plan card", "Step 2: Verify cook name displays (Aaron or Katie)", "Step 3: Verify cook avatar if available"]', 0, 0, '[66]'),

(68, 68, 'functional', 'Tonights Plan shows effort tier', 'Easy/Medium/Involved indicator displays', '["Step 1: View Tonights Plan card", "Step 2: Verify effort tier badge shows", "Step 3: Verify appropriate color/icon for tier"]', 0, 0, '[66]'),

(69, 69, 'functional', 'This works button confirms meal', 'Tapping This works opens meal details', '["Step 1: View Tonights Plan card", "Step 2: Tap This works (green button)", "Step 3: Verify MealOptionDetails screen opens"]', 0, 0, '[66]'),

(70, 70, 'functional', 'New plan button opens swap flow', 'Tapping New plan shows week meals to swap', '["Step 1: View Tonights Plan card", "Step 2: Tap New plan (gold button)", "Step 3: Verify WeekSwapList screen opens"]', 0, 0, '[66]'),

(71, 71, 'functional', 'Im wiped button opens emergency exit', 'Zero-energy options appear', '["Step 1: View Tonights Plan card", "Step 2: Tap Im wiped button", "Step 3: Verify EmergencyExit screen opens"]', 0, 0, '[66]'),

(72, 72, 'functional', 'Meal details shows ingredients', 'MealOptionDetails lists all ingredients', '["Step 1: Open meal details", "Step 2: Verify ingredients list displays", "Step 3: Verify quantities show with each ingredient"]', 0, 0, '[69]'),

(73, 73, 'functional', 'Meal details shows prep steps', 'Cooking instructions display in order', '["Step 1: Open meal details", "Step 2: Verify numbered steps display", "Step 3: Verify steps are readable and complete"]', 0, 0, '[69]'),

(74, 74, 'functional', 'Meal details shows time estimates', 'Prep time and cook time display', '["Step 1: Open meal details", "Step 2: Verify prep time shows (e.g., 15 min)", "Step 3: Verify cook time shows (e.g., 30 min)"]', 0, 0, '[69]'),

(75, 75, 'functional', 'Meal details shows cleanup rating', 'Cleanup difficulty indicator (1-3)', '["Step 1: Open meal details", "Step 2: Verify cleanup rating displays", "Step 3: Verify visual indicator (dishes icon or similar)"]', 0, 0, '[69]'),

(76, 76, 'functional', 'Week swap list shows other meals', 'WeekSwapList displays this weeks planned meals', '["Step 1: Open swap flow", "Step 2: Verify list of meals for the week shows", "Step 3: Verify each meal shows day and name"]', 0, 0, '[70]'),

(77, 77, 'functional', 'User can select meal to swap', 'Tapping a meal selects it for swap', '["Step 1: View week swap list", "Step 2: Tap a different days meal", "Step 3: Verify selection is indicated"]', 0, 0, '[76]'),

(78, 78, 'functional', 'Swap meal updates tonights plan', 'Confirming swap changes the plan', '["Step 1: Select a meal to swap", "Step 2: Confirm the swap", "Step 3: Verify tonights meal has changed"]', 0, 0, '[77]'),

(79, 79, 'functional', 'Swap updates database', 'Meal swap persists in Convex', '["Step 1: Complete a swap", "Step 2: Refresh the page", "Step 3: Verify swap persisted"]', 0, 0, '[78]'),

(80, 80, 'functional', 'Emergency exit shows leftovers option', 'Leftovers is first zero-energy option', '["Step 1: Open Emergency Exit", "Step 2: Verify Leftovers option displays", "Step 3: Verify it has minimal effort indicator"]', 0, 0, '[71]'),

(81, 81, 'functional', 'Emergency exit shows freezer meal option', 'Freezer meal is available option', '["Step 1: Open Emergency Exit", "Step 2: Verify Freezer meal option displays", "Step 3: Verify helpful description"]', 0, 0, '[71]'),

(82, 82, 'functional', 'Emergency exit shows takeout option', 'Clean takeout suggestion available', '["Step 1: Open Emergency Exit", "Step 2: Verify Takeout option displays", "Step 3: Verify it suggests healthy-ish options"]', 0, 0, '[71]'),

(83, 83, 'functional', 'Selecting emergency option updates plan', 'Choosing leftovers/freezer/takeout saves', '["Step 1: Select Leftovers", "Step 2: Confirm selection", "Step 3: Verify tonights plan shows Leftovers"]', 0, 0, '[80]'),

(84, 84, 'functional', 'Ingredient check panel opens', 'Check ingredients button shows ingredient status', '["Step 1: View meal details", "Step 2: Tap Check ingredients", "Step 3: Verify IngredientsCheckPanel opens"]', 0, 0, '[72]'),

(85, 85, 'functional', 'User can mark ingredients as available', 'Checkboxes for each ingredient', '["Step 1: View ingredient check panel", "Step 2: Check off ingredients you have", "Step 3: Verify checked state saves"]', 0, 0, '[84]'),

(86, 86, 'functional', 'Missing ingredients highlighted', 'Unchecked ingredients show as needed', '["Step 1: Leave some ingredients unchecked", "Step 2: Verify they are visually highlighted", "Step 3: Verify count of missing items shows"]', 0, 0, '[85]'),

(87, 87, 'functional', 'Add missing to grocery list', 'One-tap adds missing ingredients to list', '["Step 1: Have missing ingredients", "Step 2: Tap Add to grocery list", "Step 3: Verify items added to grocery list"]', 0, 0, '[86, 25]'),

(88, 88, 'functional', 'Chat with Zylo available', 'Chat interface for AI conversation', '["Step 1: Find chat input on Meal Helper", "Step 2: Verify Zylo greeting or prompt displays", "Step 3: Verify text input is available"]', 0, 0, '[65, 19]'),

(89, 89, 'functional', 'User can send chat message', 'Typing and sending works', '["Step 1: Type a message in chat input", "Step 2: Press send or Enter", "Step 3: Verify message appears in chat"]', 0, 0, '[88]'),

(90, 90, 'functional', 'Zylo responds to messages', 'AI generates contextual responses', '["Step 1: Send a message like What can I make?", "Step 2: Wait for response", "Step 3: Verify Zylo responds with helpful suggestion"]', 0, 0, '[89]'),

(91, 91, 'functional', 'Chat shows conversation history', 'Previous messages display in order', '["Step 1: Send multiple messages", "Step 2: Verify all messages display", "Step 3: Verify correct order (oldest to newest)"]', 0, 0, '[89]'),

(92, 92, 'functional', 'Zylo suggests meals based on inventory', 'AI considers what you have on hand', '["Step 1: Ask What can I make with chicken?", "Step 2: Verify Zylo suggests chicken-based meals", "Step 3: Verify suggestions are from recipe library"]', 0, 0, '[90]'),

(93, 93, 'functional', 'Zylo respects dietary preferences', 'AI filters suggestions by household needs', '["Step 1: Have household member with dairy-free preference", "Step 2: Ask for suggestions", "Step 3: Verify dairy-free options are prioritized or noted"]', 0, 0, '[90, 9]'),

(94, 94, 'functional', 'Chat message shows loading state', 'Indicator while Zylo is thinking', '["Step 1: Send a message", "Step 2: Verify loading indicator appears", "Step 3: Verify indicator disappears when response arrives"]', 0, 0, '[89]'),

(95, 95, 'error-handling', 'Empty state when no plan exists', 'Helpful message if no weekly plan', '["Step 1: View Meal Helper with no weekly plan", "Step 2: Verify message prompts to create plan", "Step 3: Verify link to Weekly Planning"]', 0, 0, '[65]'),

(96, 96, 'error-handling', 'Chat handles AI errors gracefully', 'Error message if OpenRouter fails', '["Step 1: Simulate API failure", "Step 2: Send a message", "Step 3: Verify friendly error message displays"]', 0, 0, '[90]'),

(97, 97, 'style', 'Tonights Plan card matches design', 'Card styling per screenshots', '["Step 1: Compare to product-plan screenshot", "Step 2: Verify colors match Harvest Hug palette", "Step 3: Verify typography uses correct fonts"]', 0, 0, '[66]'),

(98, 98, 'style', 'Effort tier badges have correct colors', 'Easy=green, Medium=gold, Involved=orange', '["Step 1: View Easy meal", "Step 2: Verify green badge", "Step 3: Check Medium and Involved meals too"]', 0, 0, '[68]'),

(99, 99, 'style', 'Chat messages have distinct styling', 'User vs Zylo messages are visually different', '["Step 1: View chat with messages from both", "Step 2: Verify user messages align right, one color", "Step 3: Verify Zylo messages align left, different color"]', 0, 0, '[91]'),

(100, 100, 'style', 'Emergency Exit uses calming design', 'Low-stress visual design for tired users', '["Step 1: Open Emergency Exit", "Step 2: Verify soft colors, no harsh contrasts", "Step 3: Verify encouraging tone in copy"]', 0, 0, '[71]'),

(101, 101, 'accessibility', 'Chat input has proper labels', 'Screen reader can identify input purpose', '["Step 1: Inspect chat input", "Step 2: Verify aria-label or label present", "Step 3: Test with screen reader"]', 0, 0, '[88]'),

(102, 102, 'accessibility', 'Action buttons are keyboard accessible', 'This works, New plan, Im wiped can be tabbed to', '["Step 1: Tab to Tonights Plan card", "Step 2: Verify can tab to each button", "Step 3: Verify Enter activates button"]', 0, 0, '[66]'),

(103, 103, 'functional', 'Zylo remembers conversation context', 'Follow-up questions work naturally', '["Step 1: Ask about chicken recipes", "Step 2: Follow up with What about a vegetarian option?", "Step 3: Verify Zylo understands context switch"]', 0, 0, '[90]'),

(104, 104, 'functional', 'Quick suggestion cards from Zylo', 'AI can show tappable meal suggestions', '["Step 1: Ask Zylo for suggestions", "Step 2: Verify MealSuggestionCards display", "Step 3: Verify tapping card shows details"]', 0, 0, '[90]'),

(105, 105, 'style', 'Meal Helper responsive on mobile', 'Layout works on phone screens', '["Step 1: View on 375px viewport", "Step 2: Verify no overflow", "Step 3: Verify touch targets adequate"]', 0, 0, '[65]'),

(106, 106, 'functional', 'Zylo voice matches Fandom setting', 'If Samwise voice selected, responses have that flavor', '["Step 1: Set Fandom Voice to Samwise in settings", "Step 2: Chat with Zylo", "Step 3: Verify response has Samwise-style phrasing"]', 0, 0, '[90]'),

(107, 107, 'functional', 'Motivational quote displays', 'Zylo shows encouraging message', '["Step 1: View Tonights Plan card", "Step 2: Verify quote like Youre not behind youre human displays", "Step 3: Verify quote rotates or is contextual"]', 0, 0, '[66]'),

(108, 108, 'functional', 'Kid-friendly badge shows when applicable', 'Meals tagged as kid-friendly show badge', '["Step 1: View a kid-friendly meal", "Step 2: Verify Kid-friendly badge displays", "Step 3: Verify badge styling is clear"]', 0, 0, '[66]'),

(109, 109, 'functional', 'Prep time badge shows on card', 'Quick time indicator on Tonights Plan', '["Step 1: View Tonights Plan card", "Step 2: Verify prep time pill shows (e.g., 15 min)", "Step 3: Verify styling matches design"]', 0, 0, '[66]');

-- ============================================================================
-- MILESTONE 4: WEEKLY PLANNING (Features 110-154)
-- ============================================================================

INSERT INTO features (id, priority, category, name, description, steps, passes, in_progress, dependencies) VALUES
(110, 110, 'functional', 'Weekly Planning page renders', 'WeeklyPlanningView loads at /weekly-planning', '["Step 1: Navigate to Plan tab", "Step 2: Verify page loads without errors", "Step 3: Verify WeeklyPlanningView component renders"]', 0, 0, '[10, 12]'),

(111, 111, 'functional', 'Week selector displays current week', 'WeekSelector shows current week dates', '["Step 1: View Weekly Planning", "Step 2: Verify week selector shows date range", "Step 3: Verify current week is selected by default"]', 0, 0, '[110]'),

(112, 112, 'functional', 'Week selector can navigate to next week', 'Arrow or button to see future weeks', '["Step 1: Click next week arrow", "Step 2: Verify dates update to next week", "Step 3: Verify meals for next week display"]', 0, 0, '[111]'),

(113, 113, 'functional', 'Week selector can navigate to previous week', 'Can view past weeks', '["Step 1: Click previous week arrow", "Step 2: Verify dates update to previous week", "Step 3: Verify historical meals display"]', 0, 0, '[111]'),

(114, 114, 'functional', 'Day cards display for all 7 days', 'Each day of week has a card', '["Step 1: View week plan", "Step 2: Count day cards", "Step 3: Verify 7 cards from Monday-Sunday or Sunday-Saturday"]', 0, 0, '[110]'),

(115, 115, 'functional', 'Day card shows meal name', 'Planned meal displays on each card', '["Step 1: View a day card", "Step 2: Verify meal name is prominent", "Step 3: Verify it matches the plan"]', 0, 0, '[114]'),

(116, 116, 'functional', 'Day card shows assigned cook', 'Cook name/avatar displays', '["Step 1: View a day card", "Step 2: Verify cook indicator shows", "Step 3: Verify correct cook (Aaron or Katie)"]', 0, 0, '[114]'),

(117, 117, 'functional', 'Day card shows who is eating', 'Eater avatars or names display', '["Step 1: View a day card", "Step 2: Verify eater indicators show", "Step 3: Verify matches planned eaters"]', 0, 0, '[114]'),

(118, 118, 'functional', 'Tapping day card opens edit modal', 'EditDayModal appears on tap', '["Step 1: Tap a day card", "Step 2: Verify modal opens", "Step 3: Verify current meal info displays in modal"]', 0, 0, '[114]'),

(119, 119, 'functional', 'Edit modal shows alternative meals', 'Swap options display in modal', '["Step 1: Open edit modal", "Step 2: Verify alternative meal suggestions show", "Step 3: Verify at least 2-3 alternatives"]', 0, 0, '[118]'),

(120, 120, 'functional', 'User can swap meal in modal', 'Selecting alternative changes the meal', '["Step 1: Open edit modal", "Step 2: Tap an alternative meal", "Step 3: Verify meal changes on the day card"]', 0, 0, '[119]'),

(121, 121, 'functional', 'Swap persists to database', 'Meal swap saves to Convex', '["Step 1: Swap a meal", "Step 2: Refresh page", "Step 3: Verify swap persisted"]', 0, 0, '[120]'),

(122, 122, 'functional', 'User can reassign cook in modal', 'Cook selector shows Aaron and Katie', '["Step 1: Open edit modal", "Step 2: Find cook assignment section", "Step 3: Tap different cook and verify change"]', 0, 0, '[118]'),

(123, 123, 'functional', 'Cook reassignment persists', 'New cook saves to database', '["Step 1: Reassign cook", "Step 2: Close modal", "Step 3: Verify day card shows new cook"]', 0, 0, '[122]'),

(124, 124, 'functional', 'User can toggle eaters in modal', 'Family members can be added/removed', '["Step 1: Open edit modal", "Step 2: Find eater toggles", "Step 3: Toggle a family member off, verify change"]', 0, 0, '[118]'),

(125, 125, 'functional', 'Eater changes persist', 'Modified eaters save to database', '["Step 1: Change who is eating", "Step 2: Close modal", "Step 3: Verify day card shows updated eaters"]', 0, 0, '[124]'),

(126, 126, 'functional', 'Looks good button approves plan', 'Approving draft plan changes status', '["Step 1: View draft week plan", "Step 2: Tap Looks good button", "Step 3: Verify plan status changes to Approved"]', 0, 0, '[110]'),

(127, 127, 'functional', 'Approving plan triggers pantry audit', 'PantryAudit screen opens after approval', '["Step 1: Approve a plan", "Step 2: Verify pantry audit screen appears", "Step 3: Verify items to check are listed"]', 0, 0, '[126]'),

(128, 128, 'functional', 'Pantry audit lists ingredients to check', 'Items from planned meals display', '["Step 1: View pantry audit", "Step 2: Verify ingredient list shows", "Step 3: Verify items are from the weeks meals"]', 0, 0, '[127]'),

(129, 129, 'functional', 'User can confirm items on hand', 'Checking items marks them as available', '["Step 1: View pantry audit", "Step 2: Check off items you have", "Step 3: Verify checked state"]', 0, 0, '[128]'),

(130, 130, 'functional', 'Completing pantry audit generates grocery list', 'Unchecked items become grocery items', '["Step 1: Complete pantry audit (check some, leave others)", "Step 2: Tap Done", "Step 3: Verify grocery list has unchecked items"]', 0, 0, '[129, 25]'),

(131, 131, 'functional', 'Generated grocery items linked to meals', 'Items show which meal they are for', '["Step 1: View generated grocery items", "Step 2: Verify linked meal indicator shows", "Step 3: Verify correct meal association"]', 0, 0, '[130]'),

(132, 132, 'functional', 'AI generates draft week plan', 'Zylo creates initial plan suggestion', '["Step 1: Navigate to week with no plan", "Step 2: Tap Generate plan button", "Step 3: Verify AI generates 7-day plan"]', 0, 0, '[110, 19]'),

(133, 133, 'functional', 'Generated plan is 80/20 familiar/new', 'Most meals are family favorites', '["Step 1: Generate a plan", "Step 2: Review the 7 meals", "Step 3: Verify ~5-6 are familiar, 1-2 are new ideas"]', 0, 0, '[132]'),

(134, 134, 'functional', 'Generated plan rotates cooks fairly', 'Aaron and Katie split cooking', '["Step 1: Generate a plan", "Step 2: Count cook assignments", "Step 3: Verify roughly even split"]', 0, 0, '[132]'),

(135, 135, 'functional', 'Generated plan considers dietary needs', 'Plan accounts for family preferences', '["Step 1: Set dietary preferences", "Step 2: Generate a plan", "Step 3: Verify meals respect preferences"]', 0, 0, '[132, 9]'),

(136, 136, 'functional', 'Plan status shows correctly', 'Draft/Approved/In-Progress/Completed states', '["Step 1: View different week plans", "Step 2: Verify correct status badge shows", "Step 3: Verify status changes as week progresses"]', 0, 0, '[110]'),

(137, 137, 'functional', 'Only admins can approve plan', 'Viewer accounts cannot approve', '["Step 1: Sign in as kid account", "Step 2: View weekly plan", "Step 3: Verify Looks good button is hidden or disabled"]', 0, 0, '[126, 8]'),

(138, 138, 'functional', 'Only admins can reassign cook', 'Viewers cannot change cook assignment', '["Step 1: Sign in as viewer", "Step 2: Open edit modal", "Step 3: Verify cook selector is disabled"]', 0, 0, '[122, 8]'),

(139, 139, 'error-handling', 'Empty state when no plan exists', 'Helpful prompt to generate plan', '["Step 1: View week with no plan", "Step 2: Verify empty state message", "Step 3: Verify Generate plan button is prominent"]', 0, 0, '[110]'),

(140, 140, 'error-handling', 'Empty state for no alternatives', 'Message when no swap options available', '["Step 1: Open edit modal with no alternatives", "Step 2: Verify helpful message displays", "Step 3: Verify manual entry option exists"]', 0, 0, '[119]'),

(141, 141, 'style', 'Day cards match design screenshots', 'Styling per product-plan reference', '["Step 1: Compare to screenshot", "Step 2: Verify colors match palette", "Step 3: Verify spacing and typography"]', 0, 0, '[114]'),

(142, 142, 'style', 'Today is highlighted', 'Current day has distinct styling', '["Step 1: View current week", "Step 2: Find todays card", "Step 3: Verify it has highlight or badge"]', 0, 0, '[114]'),

(143, 143, 'style', 'Past days are dimmed', 'Completed days have muted styling', '["Step 1: View current week mid-week", "Step 2: Check past days", "Step 3: Verify dimmed or crossed-off appearance"]', 0, 0, '[114]'),

(144, 144, 'style', 'Modal has proper focus trap', 'Tab stays within modal when open', '["Step 1: Open edit modal", "Step 2: Press Tab repeatedly", "Step 3: Verify focus cycles within modal"]', 0, 0, '[118]'),

(145, 145, 'accessibility', 'Day cards have proper ARIA', 'Screen reader announces day and meal', '["Step 1: Inspect day card", "Step 2: Verify aria-label includes day and meal name", "Step 3: Test with screen reader"]', 0, 0, '[114]'),

(146, 146, 'accessibility', 'Modal can be closed with Escape', 'Keyboard dismissal works', '["Step 1: Open edit modal", "Step 2: Press Escape", "Step 3: Verify modal closes"]', 0, 0, '[118]'),

(147, 147, 'functional', 'Week plan syncs in real-time', 'Changes visible to other users immediately', '["Step 1: Open plan on two devices", "Step 2: Make a change on device 1", "Step 3: Verify change appears on device 2"]', 0, 0, '[110]'),

(148, 148, 'style', 'Weekly Planning responsive on mobile', 'Layout works on phone screens', '["Step 1: View on 375px viewport", "Step 2: Verify day cards stack vertically", "Step 3: Verify no horizontal overflow"]', 0, 0, '[110]'),

(149, 149, 'style', 'Weekly Planning responsive on tablet', 'Better layout on larger screens', '["Step 1: View on 768px viewport", "Step 2: Verify improved layout", "Step 3: Verify still touch-friendly"]', 0, 0, '[110]'),

(150, 150, 'functional', 'Can create plan multiple weeks ahead', 'Plan future weeks in advance', '["Step 1: Navigate 2-3 weeks ahead", "Step 2: Generate or create plan", "Step 3: Verify plan saves for that future week"]', 0, 0, '[112, 132]'),

(151, 151, 'functional', 'Viewer can toggle their own eating status', 'Kids can mark themselves as not eating', '["Step 1: Sign in as kid", "Step 2: Open day where theyre listed as eating", "Step 3: Verify can toggle self off (but not others)"]', 0, 0, '[124, 8]'),

(152, 152, 'functional', 'Effort tier shows on day card', 'Easy/Medium/Involved indicator visible', '["Step 1: View day cards", "Step 2: Verify effort tier badge shows", "Step 3: Verify color coding matches Meal Helper"]', 0, 0, '[114]'),

(153, 153, 'functional', 'Plan generation shows loading state', 'Indicator while AI is generating', '["Step 1: Click Generate plan", "Step 2: Verify loading spinner or skeleton shows", "Step 3: Verify completes when plan ready"]', 0, 0, '[132]'),

(154, 154, 'error-handling', 'Handles AI generation failure', 'Error message if plan generation fails', '["Step 1: Simulate API failure", "Step 2: Try to generate plan", "Step 3: Verify friendly error message and retry option"]', 0, 0, '[132]');

-- ============================================================================
-- MILESTONE 5: NOTIFICATIONS (Features 155-199)
-- ============================================================================

INSERT INTO features (id, priority, category, name, description, steps, passes, in_progress, dependencies) VALUES
(155, 155, 'functional', 'Notifications page renders', 'NotificationsView loads at /notifications', '["Step 1: Navigate to Notifications tab", "Step 2: Verify page loads without errors", "Step 3: Verify NotificationsView component renders"]', 0, 0, '[10, 12]'),

(156, 156, 'functional', 'Notification history displays', 'Past notifications show in list', '["Step 1: Have some notifications in database", "Step 2: View Notifications page", "Step 3: Verify notification cards display"]', 0, 0, '[155]'),

(157, 157, 'functional', 'NotificationCard shows message', 'Notification text displays clearly', '["Step 1: View a notification card", "Step 2: Verify message text is visible", "Step 3: Verify appropriate length/truncation"]', 0, 0, '[156]'),

(158, 158, 'functional', 'NotificationCard shows timestamp', 'Relative time displays (2h ago, Yesterday)', '["Step 1: View notification card", "Step 2: Verify timestamp shows", "Step 3: Verify relative format (not absolute)"]', 0, 0, '[156]'),

(159, 159, 'functional', 'NotificationCard shows type icon', 'Each type has distinct icon', '["Step 1: View different notification types", "Step 2: Verify each has unique icon", "Step 3: Verify icons match spec (sun, snowflake, etc.)"]', 0, 0, '[156]'),

(160, 160, 'functional', 'Pending notification shows action buttons', 'Unresolved notifications have actions', '["Step 1: View pending notification", "Step 2: Verify action buttons display", "Step 3: Verify primary and secondary actions visible"]', 0, 0, '[156]'),

(161, 161, 'functional', 'Tapping action resolves notification', 'Action button marks notification done', '["Step 1: View pending notification", "Step 2: Tap primary action (e.g., Looks good)", "Step 3: Verify notification shows resolved state"]', 0, 0, '[160]'),

(162, 162, 'functional', 'Resolved notification shows checkmark', 'Visual indicator of completed action', '["Step 1: View resolved notification", "Step 2: Verify checkmark or done indicator", "Step 3: Verify which action was taken shows"]', 0, 0, '[161]'),

(163, 163, 'functional', 'Resolved notification hides action buttons', 'No buttons on completed notifications', '["Step 1: View resolved notification", "Step 2: Verify action buttons are gone", "Step 3: Verify clean resolved appearance"]', 0, 0, '[161]'),

(164, 164, 'functional', 'Crisis Day Mute toggle displays', 'CrisisMuteBanner shows toggle', '["Step 1: View Notifications page", "Step 2: Verify Crisis Day Mute toggle is visible", "Step 3: Verify toggle is in off state by default"]', 0, 0, '[155]'),

(165, 165, 'functional', 'User can enable Crisis Day Mute', 'Toggle turns on 24-hour mute', '["Step 1: Tap Crisis Day Mute toggle", "Step 2: Verify toggle shows on state", "Step 3: Verify confirmation or immediate activation"]', 0, 0, '[164]'),

(166, 166, 'functional', 'Crisis Day Mute shows countdown', 'Time remaining displays when active', '["Step 1: Enable Crisis Day Mute", "Step 2: Verify countdown shows", "Step 3: Verify format like Paused until 8:00 PM tomorrow"]', 0, 0, '[165]'),

(167, 167, 'functional', 'User can disable Crisis Day Mute early', 'Toggle can turn off before 24 hours', '["Step 1: Have Crisis Day Mute active", "Step 2: Tap toggle to disable", "Step 3: Verify notifications resume"]', 0, 0, '[165]'),

(168, 168, 'functional', 'Crisis Day Mute auto-expires after 24 hours', 'Mute turns off automatically', '["Step 1: Enable Crisis Day Mute", "Step 2: Wait or simulate 24 hours passing", "Step 3: Verify mute disables automatically"]', 0, 0, '[165]'),

(169, 169, 'functional', 'Notification settings accessible', 'Settings icon/button opens preferences', '["Step 1: Find settings icon on Notifications page", "Step 2: Tap to open settings", "Step 3: Verify NotificationSettings view opens"]', 0, 0, '[155]'),

(170, 170, 'functional', 'Can toggle notification types on/off', 'Individual type toggles available', '["Step 1: Open notification settings", "Step 2: Find toggle for Daily Brief", "Step 3: Toggle off and verify saves"]', 0, 0, '[169]'),

(171, 171, 'functional', 'Disabled type stops those notifications', 'Toggled-off types dont send', '["Step 1: Disable Leftover Check-In type", "Step 2: Trigger a leftover notification", "Step 3: Verify notification is not created"]', 0, 0, '[170]'),

(172, 172, 'functional', 'Can set quiet hours', 'Start and end time for no notifications', '["Step 1: Open notification settings", "Step 2: Find quiet hours picker", "Step 3: Set 9PM-7AM and verify saves"]', 0, 0, '[169]'),

(173, 173, 'functional', 'Quiet hours suppress notifications', 'No notifications during quiet period', '["Step 1: Set quiet hours", "Step 2: Trigger notification during quiet time", "Step 3: Verify notification held until quiet hours end"]', 0, 0, '[172]'),

(174, 174, 'functional', 'Fandom Voice selector available', 'Can choose notification personality', '["Step 1: Open notification settings", "Step 2: Find Fandom Voice selector", "Step 3: Verify options like Default, Samwise, Nacho Libre"]', 0, 0, '[169]'),

(175, 175, 'functional', 'Selecting Fandom Voice saves preference', 'Voice choice persists', '["Step 1: Select Samwise voice", "Step 2: Close and reopen settings", "Step 3: Verify Samwise is still selected"]', 0, 0, '[174]'),

(176, 176, 'functional', 'Fandom Voice affects notification text', 'Selected voice changes message flavor', '["Step 1: Set Samwise voice", "Step 2: Receive a new notification", "Step 3: Verify message has Samwise-style phrasing"]', 0, 0, '[175]'),

(177, 177, 'functional', 'Daily Brief notification generates at 7AM', 'Morning notification with tonights plan', '["Step 1: Have a weekly plan", "Step 2: Wait for or simulate 7AM", "Step 3: Verify Daily Brief notification created"]', 0, 0, '[156]'),

(178, 178, 'functional', 'Strategic Pivot notification at 4PM', 'Afternoon check-in notification', '["Step 1: Have approved plan", "Step 2: Simulate 4PM", "Step 3: Verify Strategic Pivot notification"]', 0, 0, '[156]'),

(179, 179, 'functional', 'Thaw Guardian notification at 7:30PM', 'Evening thaw reminder', '["Step 1: Have meal tomorrow needing thaw", "Step 2: Simulate 7:30PM", "Step 3: Verify Thaw Guardian notification"]', 0, 0, '[156]'),

(180, 180, 'functional', 'Weekly Plan Ready notification', 'Notification when AI drafts new plan', '["Step 1: Have AI generate weekly plan", "Step 2: Verify notification created", "Step 3: Verify message mentions plan is ready"]', 0, 0, '[156, 132]'),

(181, 181, 'functional', 'Cook Reminder evening notification', 'Heads-up for tomorrows cook at 7:30PM', '["Step 1: Be assigned as cook tomorrow", "Step 2: Simulate 7:30PM", "Step 3: Verify cook reminder notification"]', 0, 0, '[156]'),

(182, 182, 'functional', 'Cook Reminder morning notification', 'Day-of reminder at 7AM', '["Step 1: Be assigned as cook today", "Step 2: Simulate 7AM", "Step 3: Verify morning cook reminder"]', 0, 0, '[156]'),

(183, 183, 'error-handling', 'Empty state when no notifications', 'Helpful message for empty history', '["Step 1: Clear all notifications", "Step 2: View Notifications page", "Step 3: Verify All caught up or similar message"]', 0, 0, '[155]'),

(184, 184, 'error-handling', 'All resolved shows caught-up state', 'Message when everything is done', '["Step 1: Resolve all pending notifications", "Step 2: View notifications list", "Step 3: Verify celebratory or encouraging message"]', 0, 0, '[161]'),

(185, 185, 'style', 'Notification types have distinct colors', 'Each type has unique background/icon color', '["Step 1: View different notification types", "Step 2: Verify Daily Brief has yellow/amber", "Step 3: Verify Thaw Guardian has cyan, etc."]', 0, 0, '[159]'),

(186, 186, 'style', 'Crisis Day Mute has prominent styling', 'Toggle is easy to find when needed', '["Step 1: View Notifications page", "Step 2: Verify Crisis Day Mute banner is prominent", "Step 3: Verify it doesnt get lost in the list"]', 0, 0, '[164]'),

(187, 187, 'style', 'Active Crisis Day Mute dims notifications', 'Visual indicator mute is active', '["Step 1: Enable Crisis Day Mute", "Step 2: Verify notifications list appears dimmed", "Step 3: Verify clear indicator mute is on"]', 0, 0, '[165]'),

(188, 188, 'accessibility', 'Action buttons keyboard accessible', 'Can tab to and activate buttons', '["Step 1: Focus on notification card", "Step 2: Tab to action button", "Step 3: Press Enter, verify action triggers"]', 0, 0, '[160]'),

(189, 189, 'accessibility', 'Toggle switches have aria-pressed', 'Screen reader announces toggle state', '["Step 1: Inspect Crisis Day Mute toggle", "Step 2: Verify aria-pressed attribute", "Step 3: Verify state announced by screen reader"]', 0, 0, '[164]'),

(190, 190, 'accessibility', 'Screen reader announces notification content', 'Full notification readable', '["Step 1: Navigate to notification with screen reader", "Step 2: Verify type, message, time announced", "Step 3: Verify actions are announced"]', 0, 0, '[156]'),

(191, 191, 'functional', 'PWA push notifications work', 'Browser push notifications send', '["Step 1: Enable push permissions", "Step 2: Trigger a notification", "Step 3: Verify push notification appears"]', 0, 0, '[18, 156]'),

(192, 192, 'functional', 'Push notification has action buttons', 'Can respond from lock screen', '["Step 1: Receive push notification", "Step 2: Verify action buttons in notification", "Step 3: Tap action, verify it registers"]', 0, 0, '[191]'),

(193, 193, 'functional', 'Can enable/disable push notifications', 'Toggle for push permission', '["Step 1: Open notification settings", "Step 2: Find push notifications toggle", "Step 3: Toggle and verify permission prompt or disable"]', 0, 0, '[169, 191]'),

(194, 194, 'style', 'Notifications page responsive on mobile', 'Layout works on phone screens', '["Step 1: View on 375px viewport", "Step 2: Verify no overflow", "Step 3: Verify cards stack properly"]', 0, 0, '[155]'),

(195, 195, 'functional', 'Notification preferences are per-user', 'Each household member has own settings', '["Step 1: Set preferences as Aaron", "Step 2: Sign in as Katie", "Step 3: Verify Katie has different/default settings"]', 0, 0, '[169]'),

(196, 196, 'functional', 'Long notification message truncates', 'Very long messages dont break layout', '["Step 1: Create notification with long message", "Step 2: Verify message truncates", "Step 3: Verify can expand or view full message"]', 0, 0, '[157]'),

(197, 197, 'functional', 'Notification actions trigger appropriate flows', 'Adjust action opens relevant screen', '["Step 1: Receive Daily Brief with Adjust action", "Step 2: Tap Adjust", "Step 3: Verify navigates to Weekly Planning or Meal Helper"]', 0, 0, '[161]'),

(198, 198, 'style', 'Settings page organized clearly', 'Notification settings well grouped', '["Step 1: View notification settings", "Step 2: Verify logical grouping (types, quiet hours, voice)", "Step 3: Verify clear labels and descriptions"]', 0, 0, '[169]'),

(199, 199, 'functional', 'Notifications sync in real-time', 'New notifications appear without refresh', '["Step 1: Have app open", "Step 2: Trigger a new notification from backend", "Step 3: Verify notification appears immediately"]', 0, 0, '[156]');
