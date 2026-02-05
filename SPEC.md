# Reward Spinner - Functional Specification

## 1. Overview
A web-based reward system for an 8-year-old child, featuring three distinct "spinners" (Sparrow, Owl, Reward) based on time of day and task completion. The app tracks earned rewards and manages specific rules for when each spinner can be used.

## 2. The Spinners

### 2.1. Sparrow Spinner (The Morning Bird)
*   **Theme:** Bright Yellow/Orange, Morning sun, cheerful.
*   **Availability:** Morning (Start of day until 3:00 PM).
*   **Logic:** Rewards won here are stored in a "Backpack" (inventory) to be redeemed later (after school).
*   **Segments & Probability (Weighted):**
    *   Math Practice (Medium)
    *   Percy (English App) (Medium)
    *   Homework (High)
    *   Screen Time: 10 mins (Low)

### 2.2. Owl Spinner (The Night Owl)
*   **Theme:** Deep Blue/Purple, Stars, Moon.
*   **Availability:** After School (3:00 PM - 8:00 PM).
*   **Logic:** Rewards can be redeemed immediately or stored.
*   **Segments & Probability:**
    *   Math Practice (Low)
    *   Percy (Medium)
    *   Screen Time: 10 mins (Medium)
    *   Screen Time: 1 Hour (Very Low - Rare)

### 2.3. Reward Spinner (The Golden Prize)
*   **Theme:** Gold/Rainbow, Sparkles, Treasure chest.
*   **Availability:** Locked by default. Unlocks *only* when a "Special Task" is marked as complete.
*   **Segments & Probability:**
    *   Homework (Very Low - "Bad Luck" slot)
    *   Percy (Low)
    *   Screen Time: 10 mins (Medium)
    *   Screen Time: 1 Hour (High)
    *   **Jackpot:** "Choose Your Own" (Very Low - 1-2%)

## 3. Core Features

### 3.1. Time Management
*   App checks system time on load and periodically.
*   **06:00 - 15:00:** Sparrow Mode active.
*   **15:00 - 20:00:** Owl Mode active.
*   **20:00 - 06:00:** Sleep Mode (Spinners locked, nice "Go to sleep" message).
*   *Override:* A hidden "Parent Mode" or toggle to simulate different times/holidays for testing.

### 3.2. Special Tasks
*   A "Mission Board" section.
*   Parent can add/toggle a "Special Task" (e.g., "Clean Room", "Finish Piano").
*   Completing it generates a one-time "Golden Ticket" to spin the Reward Spinner.

### 3.3. Inventory ("My Loot")
*   Visual list of rewards won.
*   "Redeem" button next to each reward (marks it as used/removes it).
*   Persistence: Uses `localStorage` to save rewards and task state.

## 4. Technical Stack
*   **Framework:** React (Vite) + Tailwind CSS (for easy styling/animations).
*   **State Management:** React Context or simple State + LocalStorage.
*   **Animation:** Framer Motion (for smooth spins and popups) + Confetti.
*   **Icons:** Lucide React or Heroicons.
*   **Sound:** Simple MP3 beeps/fanfare (optional but requested).

## 5. User Interface (UI)
*   **Header:** Current Time, "My Loot" counter.
*   **Main Stage:** The active Spinner (large, centered).
*   **Navigation/Status:** Tabs or indicators showing which bird is active (Sparrow vs Owl).
*   **Footer:** Mission Board access.

## 6. Implementation Plan
1.  **Setup:** Vite project, Tailwind.
2.  **Core Component:** Generic `Wheel` component (canvas or CSS based) that accepts segments and colors.
3.  **Logic:** Time-based switching hook.
4.  **State:** Reward storage and redemption.
5.  **Polish:** Sounds, confetti, animations.
