
# Zenith Global - Product Requirement Document

## Overview
- **Summary**: Rebranding the existing "China Express" website to "Zenith Global" with a new UI theme (dark background, gold/red accent colors, Montserrat fonts). All existing functionality remains unchanged.
- **Purpose**: Update the brand identity and visual design while preserving all existing features and functionality.
- **Target Users**: Existing users of the import service from China to Africa.

## Goals
- Update project name from "China Express" to "Zenith Global"
- Change UI theme to dark (black) background with gold/red accents
- Update fonts to Montserrat
- Update all branding elements (logo, metadata, UI components, etc.)

## Non-Goals (Out of Scope)
- Changing any existing functionality
- Adding new features
- Modifying the backend API
- Changing the data model

## Background & Context
- The existing project is a Next.js 16 application for an import service from China to Africa.
- The current UI has a light theme with specific colors; we need to change to a dark theme with gold/red.

## Functional Requirements
- **FR-1**: Update all occurrences of "China Express" to "Zenith Global" in the codebase
- **FR-2**: Update the color scheme to use dark (black) background, gold (#B8941E), and red (#C8102E) accents
- **FR-3**: Update fonts to use Montserrat

## Non-Functional Requirements
- **NFR-1**: All existing functionality must continue to work exactly the same
- **NFR-2**: The UI must be responsive and performant
- **NFR-3**: The rebranding must be consistent across all pages and components

## Constraints
- **Technical**: Must use the existing Next.js 16, Tailwind CSS, and component library
- **Business**: Must not break any existing features
- **Dependencies**: No new external dependencies

## Assumptions
- The user will provide or we'll use the existing logo placeholder
- The color scheme is derived from the provided image (black, gold, red)
- Montserrat fonts are available via Google Fonts

## Acceptance Criteria

### AC-1: Project Name Updated
- **Given**: The website is loaded
- **When**: User views any page
- **Then**: All references to "China Express" are replaced with "Zenith Global"
- **Verification**: `programmatic` | `human-judgment`

### AC-2: UI Theme Updated
- **Given**: The website is loaded
- **When**: User views any page
- **Then**: The UI uses a dark (black) background, gold (#B8941E) and red (#C8102E) accent colors
- **Verification**: `human-judgment`

### AC-3: Fonts Updated
- **Given**: The website is loaded
- **When**: User views any page
- **Then**: The fonts used are Montserrat
- **Verification**: `human-judgment`

### AC-4: All Functionality Preserved
- **Given**: The website is loaded
- **When**: User uses any existing feature
- **Then**: The feature works exactly as before
- **Verification**: `programmatic` | `human-judgment`

## Open Questions
- None (all requirements are clear from the provided image)
