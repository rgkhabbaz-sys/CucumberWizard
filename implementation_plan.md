# Implementation Plan - The Wizard-Wolf’s Cucumber Crusade (Web Edition)

**Goal**: Create a visually spectacular, hilarious third-person endless action game in the browser using React Three Fiber.

> [!IMPORTANT]
> **Platform Adaptation**: As an AI agent in a web environment, I cannot use Unity or Unreal Engine. I will build this using **React Three Fiber (Three.js)**. This allows for high-fidelity 3D graphics, physics, and shaders directly in the browser, meeting the visual and gameplay goals.

## User Review Required
- **Art Style**: Characters will be constructed from **geometric primitives** (Spheres, Capsules, Cylinders) styled to look like "Bobble-heads" since I cannot generate external 3D model files (FBX/GLTF). This fits the "stylized" requirement perfectly.
- **Performance**: High-fidelity post-processing (Bloom, Volumetric lighting simulation) requires a decent GPU.

## Tech Stack
- **Framework**: Vite + React
- **3D Engine**: `@react-three/fiber` (Three.js)
- **Physics**: `@react-three/rapier` (For the critical "ragdoll" impulse mechanics)
- **Helpers**: `@react-three/drei` (Camera, Environment, Textures)
- **Post-Processing**: `@react-three/postprocessing` (Bloom, Vignette, Noise for "Film" look)
- **State**: `zustand` (Game state, score, weapon upgrades)
- **Styling**: Tailwind CSS (UI Overlay)

## Proposed Changes

### Core Setup
#### [NEW] [package.json](file:///Users/rajikhabbaz/Documents/Vibe Coding/CucumberWizard/package.json)
- Dependencies: `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, `@react-three/postprocessing`, `zustand`, `leva` (for debug).

#### [NEW] [vite.config.js](file:///Users/rajikhabbaz/Documents/Vibe Coding/CucumberWizard/vite.config.js)
- Standard Vite React config.

### Game Components

#### [NEW] [src/App.jsx](file:///Users/rajikhabbaz/Documents/Vibe Coding/CucumberWizard/src/App.jsx)
- Main entry point.
- Canvas setup with Shadows and Post-processing.
- UI Overlay (Health, Score, Cucumber Level).

#### [NEW] [src/game/World.jsx](file:///Users/rajikhabbaz/Documents/Vibe Coding/CucumberWizard/src/game/World.jsx)
- Manages the procedural generation of castle tiles.
- Lighting setup (Ambient + Point lights for torches).

#### [NEW] [src/game/Player.jsx](file:///Users/rajikhabbaz/Documents/Vibe Coding/CucumberWizard/src/game/Player.jsx)
- **Visuals**: Wizard-Werewolf composition (Brown capsule body, Blue Cone hat).
- **Controls**: WASD + Mouse look.
- **Weapon**: The "Cucumber" (Green Capsule) attached to hand.
- **Logic**: Attack animation (swing), Raycast/Collider activation.

#### [NEW] [src/game/Enemy.jsx](file:///Users/rajikhabbaz/Documents/Vibe Coding/CucumberWizard/src/game/Enemy.jsx)
- **Visuals**: Configurable "Costumes" for Einstein, Newton, Plato, Napoleon, Caesar.
    - *Einstein*: White sphere hair.
    - *Newton*: Big wig + Apple.
    - *Napoleon*: Short cylinder body + Sideways hat.
- **Physics**: RigidBody with low damping for maximum "fling" effect.
- **AI**: Simple follow player logic.

#### [NEW] [src/store.js](file:///Users/rajikhabbaz/Documents/Vibe Coding/CucumberWizard/src/store.js)
- Zustand store for Score, Cucumber Level, Player Health.

## Verification Plan

### Automated Tests
- None (Visual heavy project).

### Manual Verification
1. **Visuals**: Verify "Bobble-head" proportions and "High-Fidelity" lighting (Bloom/Shadows).
2. **Movement**: Test WASD movement feels "loping/bouncy".
3. **Combat**: Test "Whack" mechanic.
    - **Success**: Enemy flies backwards when hit.
    - **Visual**: Green slime particles on hit.
    - **Progression**: Cucumber grows after hits.
4. **Performance**: Ensure smooth 60fps with post-processing on.
