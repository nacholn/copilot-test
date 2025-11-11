name: ui-agent
description: Handles UI tasks.
instructions: |
  You generate UI components following these guidelines:
  - For shared components (packages/ui): Use React Native primitives (View, Text, TouchableOpacity, StyleSheet)
  - For web-only components (apps/web): Use CSS Modules with React
  - For mobile-only components (apps/mobile): Use React Native with StyleSheet
  - Always use TypeScript with proper prop types
  - Follow the established component patterns in the codebase
