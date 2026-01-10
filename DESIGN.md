# Neural Knowledge Map - Design Specification

## Project Overview
An interactive 3D brain-like visualization tool for personal knowledge management and learning. Users can create neurons (nodes) that represent concepts, connect them with weighted edges, and store rich information within each neuron.

## Visual Style: Organic Brain-Like Aesthetic
- **Theme**: Dark background with neon/glowing effects (cyberpunk neural aesthetic)
- **Neurons**: Glowing spheres that pulse subtly
- **Connections**: Electrical pulse/synapse-like lines with glow effects
- **Colors**: Neon blues, purples, pinks with glowing halos
- **Effects**: Particle effects, bloom, glow shaders

## 3D Visualization

### Layout System
- **Type**: 3D Force-Directed Graph
- **Container**: Spherical boundary (brain-like constraint)
- **Physics**:
  - Connected nodes attract each other
  - Unconnected nodes repel
  - Weights affect attraction strength
  - Nodes settle into organic, brain-like structures

### Camera & Controls
- Orbit controls (rotate, pan, zoom)
- Smooth camera transitions
- Click-to-focus on nodes
- Auto-rotate when idle (optional)

## Node (Neuron) System

### Node Properties
- **ID**: Unique identifier
- **Title**: Short name/label
- **Position**: x, y, z coordinates (can be overridden manually)
- **Content**:
  - Rich text/Markdown description
  - Images (uploaded files)
  - Links/URLs
  - List of connected nodes with weights
- **Metadata**:
  - Created timestamp
  - Modified timestamp
  - View count (optional)

### Node Appearance
- Glowing sphere
- Size based on number of connections (optional)
- Pulsing animation
- Label visible on hover or when close

### Node Types
- Single type only (all neurons are equal)
- Differentiation comes from connections and content

## Edge (Connection) System

### Edge Properties
- **Source Node ID**
- **Target Node ID**
- **Weight**: 0-1 scale (or 0-10, TBD)
  - Represents connection strength
  - Affects visual appearance
  - Influences force-directed layout

### Edge Visualization
- **Thickness**: Proportional to weight
- **Color Intensity**: Brighter/more saturated for higher weights
- **Animation**: Electrical pulses traveling along edges
- **Glow**: Stronger connections glow more intensely

### Edge States
- **Default**: Subtle glow, thin line
- **Hover** (when node is hovered): Brighten connected edges
- **Selected** (when node is clicked): Full brightness, pulse effect

## User Interactions

### Node Creation
- **Primary**: Floating `+` button (bottom-right corner)
- Clicking opens creation form in side panel:
  - Title input (required)
  - Initial description (optional)
  - Create button

### Node Selection
- **Hover**:
  - Node brightens and scales slightly
  - Node label appears
  - Connected edges light up
  - Connected nodes highlight subtly
- **Click**:
  - Node fully selected
  - Side panel slides in from right
  - Connected edges pulse
  - Camera smoothly focuses on node (optional)

### Node Editing
- Drag nodes to manually reposition (overrides force-directed position)
- Edit content in side panel
- Delete from side panel

### Connection Creation
- **Method 1**: Drag from node to node
  - Enter connection mode (Shift+Click or toggle button)
  - Click source node
  - Drag line to target node
  - Release to create connection
  - Popup to set weight

- **Method 2**: Via side panel
  - Open node in side panel
  - "Add Connection" button
  - Search/select target node
  - Set weight with slider
  - Save

### Connection Editing
- Edit weight in side panel when viewing either connected node
- Delete connection from side panel
- Click on edge directly to edit (stretch goal)

## Side Panel Design

### Behavior
- Slides in from **right side**
- Overlay with semi-transparent backdrop
- Close via:
  - X button in top-right
  - Clicking backdrop
  - ESC key
  - Clicking another node (replaces content)

### Layout
```
┌─────────────────────────────┐
│ [X]                         │ ← Close button
│                             │
│ Node Title                  │ ← Editable title
│ ─────────────────────────   │
│                             │
│ Description                 │ ← Rich text editor
│ [Markdown supported]        │
│                             │
│ ─────────────────────────   │
│                             │
│ Images                      │ ← Image gallery
│ [📷 Upload Image]           │
│                             │
│ ─────────────────────────   │
│                             │
│ Links                       │ ← URL list
│ • https://example.com       │
│ [+ Add Link]                │
│                             │
│ ─────────────────────────   │
│                             │
│ Connections (3)             │ ← Connected nodes
│ • Node A ━━━━━━━ 0.8       │ ← Weight indicator
│ • Node B ━━━━━━━ 0.5       │
│ • Node C ━━━━━━━ 0.3       │
│ [+ Add Connection]          │
│                             │
│ ─────────────────────────   │
│                             │
│ [Delete Node]               │ ← Danger zone
│                             │
└─────────────────────────────┘
```

### Content Sections
1. **Title**: Large, editable heading
2. **Description**: Markdown editor with preview
3. **Images**: Grid gallery with upload button
4. **Links**: List of URLs with titles and delete option
5. **Connections**: List of connected nodes with:
   - Node name (clickable to navigate)
   - Weight visualization (bar or number)
   - Edit weight button
   - Remove connection button
6. **Add Connection**: Button to create new connections
7. **Metadata**: Created/modified dates (collapsed by default)
8. **Delete**: Red button at bottom

## UI Controls & HUD

### Top Bar (Optional)
- App title/logo
- Search nodes
- View controls (toggle labels, toggle edges, etc.)
- Settings

### Bottom Bar
- `+` Create Node button (primary action)
- View mode toggles
- Zoom controls (optional, mouse wheel is primary)

### Floating Controls
- Mini-map (overview of node positions)
- Reset camera view
- Toggle auto-rotate

## Data Storage

### Phase 1: localStorage
```typescript
interface Neuron {
  id: string;
  title: string;
  description: string; // Markdown
  images: string[]; // Base64 or URLs
  links: Array<{url: string, title: string}>;
  position: {x: number, y: number, z: number} | null;
  createdAt: number;
  modifiedAt: number;
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number; // 0-1
}

interface Graph {
  neurons: Neuron[];
  connections: Connection[];
  metadata: {
    version: string;
    lastModified: number;
  }
}
```

### Future: Database Migration Path
- Design data layer with repository pattern
- Keep storage interface abstract
- Easy swap to: Firebase, Supabase, PostgreSQL, etc.
- Export/import functionality for backup

## Technical Stack (Confirmed)

### Core
- **React** 19.2.0 - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool

### 3D Graphics
- **Three.js** 0.182.0 - 3D rendering
- **@react-three/fiber** 9.5.0 - React renderer for Three.js
- **@react-three/drei** 10.7.7 - Useful helpers/components

### State Management
- **Zustand** 5.0.9 - Global state (neurons, connections, UI state)

### Additional Libraries Needed
- **react-markdown** - Markdown rendering
- **react-simplemde-editor** or **@uiw/react-md-editor** - Markdown editing
- **d3-force-3d** - Force-directed graph physics
- **@react-three/postprocessing** - Bloom/glow effects (optional)

## Component Architecture

```
src/
├── components/
│   ├── Scene/
│   │   ├── NeuralScene.tsx          # Main 3D canvas
│   │   ├── Neuron.tsx                # Individual neuron sphere
│   │   ├── Connection.tsx            # Edge line with effects
│   │   ├── ForceGraph.tsx            # Force-directed layout logic
│   │   └── Effects.tsx               # Post-processing (bloom, etc.)
│   ├── UI/
│   │   ├── SidePanel.tsx             # Detail panel
│   │   ├── CreateNodeButton.tsx      # Floating + button
│   │   ├── TopBar.tsx                # App header
│   │   ├── SearchBar.tsx             # Node search
│   │   └── ConnectionEditor.tsx      # Connection UI
│   └── Editors/
│       ├── MarkdownEditor.tsx        # Rich text editor
│       ├── ImageGallery.tsx          # Image upload/display
│       └── LinkList.tsx              # URL manager
├── store/
│   ├── graphStore.ts                 # Zustand store for graph data
│   └── uiStore.ts                    # UI state (selected node, panel open, etc.)
├── hooks/
│   ├── useForceLayout.ts             # Force-directed physics
│   ├── useLocalStorage.ts            # Persistence
│   └── useKeyboardShortcuts.ts       # Keyboard controls
├── utils/
│   ├── storage.ts                    # localStorage abstraction
│   ├── graphAlgorithms.ts            # Graph utilities
│   └── idGenerator.ts                # Unique IDs
└── types/
    └── index.ts                      # TypeScript interfaces
```

## Color Palette (Brain Theme)

### Primary Colors
- **Background**: `#0a0a0f` (deep dark blue-black)
- **Neurons**:
  - Base: `#6366f1` (indigo)
  - Glow: `#818cf8` (light indigo)
- **Connections**:
  - Weak (0-0.3): `#3b82f6` (blue) at 30% opacity
  - Medium (0.3-0.7): `#8b5cf6` (purple) at 60% opacity
  - Strong (0.7-1.0): `#ec4899` (pink) at 90% opacity

### UI Elements
- **Panel Background**: `#1a1a2e` with 95% opacity
- **Text**: `#e5e7eb` (light gray)
- **Accents**: `#10b981` (green for actions)
- **Danger**: `#ef4444` (red for delete)

## Performance Considerations

- Limit initial render to 1000 nodes (with virtualization for more)
- Use instancing for repeated geometries
- Optimize force calculation with spatial hashing
- Debounce localStorage writes
- Lazy load images
- LOD (Level of Detail) for distant neurons

## Development Phases

### Phase 1: Core Visualization ✓ (Next)
- Set up Three.js scene
- Render basic neurons and connections
- Camera controls
- Basic lighting and effects

### Phase 2: Force-Directed Layout
- Implement 3D force simulation
- Spherical boundary constraint
- Manual drag override

### Phase 3: Interactions
- Hover effects
- Click selection
- Camera focus

### Phase 4: Side Panel & CRUD
- Side panel component
- Create/Read/Update/Delete neurons
- localStorage persistence

### Phase 5: Connections UI
- Drag-to-connect
- Panel-based connection editing
- Weight visualization

### Phase 6: Rich Content
- Markdown editor
- Image upload
- Link management

### Phase 7: Polish
- Animations and transitions
- Keyboard shortcuts
- Search functionality
- Export/import
- Performance optimization

## Open Questions / Future Enhancements

- [ ] Should there be a tutorial/onboarding?
- [ ] Undo/redo functionality?
- [ ] Multiple graph "brains" (separate knowledge domains)?
- [ ] Collaborative features (far future)?
- [ ] Mobile responsiveness (touch controls)?
- [ ] Graph analytics (centrality, clusters, etc.)?
- [ ] Animation speed controls for pulses?

---

**Ready to start implementation!** 🧠✨
