
# Zenith Global - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: Update Metadata and Layout (Project Name, Fonts, Colors)
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - Update metadata in app/layout.js from "China Express" to "Zenith Global"
  - Change fonts from Fraunces/Plus_Jakarta_Sans/JetBrains_Mono to Montserrat
  - Update background color to dark (black) and text colors appropriately
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-1.1: Check that metadata.title.default and metadata.title.template are updated
  - `human-judgement` TR-1.2: Verify that Montserrat fonts are loaded and used
  - `human-judgement` TR-1.3: Verify background is dark and colors are gold/red
- **Notes**: Update app/globals.css and tailwind.config.js if needed

## [x] Task 2: Update Header Component
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - Update the Header component to use Zenith Global branding
  - Update logo and colors to match dark theme
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgement` TR-2.1: Verify Header displays Zenith Global branding correctly
  - `human-judgement` TR-2.2: Verify Header colors match dark theme

## [x] Task 3: Update Footer and BottomNav Components
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - Update Footer and BottomNav to use Zenith Global branding
  - Update colors to match dark theme
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgement` TR-3.1: Verify Footer displays Zenith Global branding correctly
  - `human-judgement` TR-3.2: Verify BottomNav colors match dark theme

## [x] Task 4: Update Home Page and Other Pages
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - Update app/page.js and other pages to use dark theme colors
  - Update all occurrences of "China Express" to "Zenith Global" in page content
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgement` TR-4.1: Verify Home page uses dark theme correctly
  - `human-judgement` TR-4.2: Verify all page content is updated to Zenith Global

## [x] Task 5: Update All UI Components (Cards, Buttons, etc.)
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - Update UI components in components/ui/ and other component folders to use dark theme colors
  - Ensure all components look good on dark background
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` TR-5.1: Verify ProductCard uses dark theme colors
  - `human-judgement` TR-5.2: Verify buttons and other UI elements use gold/red accents

## [x] Task 6: Update Admin Pages and Other Sections
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - Update admin pages, catalogue, tracking, etc. to use dark theme
  - Ensure all functionality is preserved
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `human-judgement` TR-6.1: Verify admin pages use dark theme correctly
  - `programmatic` TR-6.2: Verify all existing links and functionality still work

## [x] Task 7: Verify All Functionality is Preserved
- **Priority**: P0
- **Depends On**: All previous tasks
- **Description**: 
  - Test all existing features to ensure they still work
  - Check for any broken links or functionality
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-7.1: Run the dev server and test all main pages
  - `human-judgement` TR-7.2: Verify all features (catalogue, tracking, etc.) are working
