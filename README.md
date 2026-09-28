# Janvi's Interactive Room — Portfolio Hero Section

An interactive, playful 2.5D room hero section for personal portfolios and Framer websites. Designed and coded with draggable objects, animations, interactive notifications, and dynamic lighting.

---

## 🚀 How to Use in Framer

1. **Copy the Component Code**
   - Open [`framer/JanviRoom.tsx`](framer/JanviRoom.tsx) and copy its entire contents.

2. **Create a Code Component in Framer**
   - Open your project in Framer.
   - Go to **Assets** → **Code** → **New Component**.
   - Name it `JanviRoom.tsx` and paste the code.

3. **Set the Asset Base URL**
   - Add the component to your Framer canvas.
   - In the right-hand properties sidebar, locate **Asset URL** and set it to:
     ```
     https://cdn.jsdelivr.net/gh/iamjanvikatole-ux/Portfolio-hero-section@main/framer/room3/
     ```
     *(or `https://cdn.jsdelivr.net/gh/iamjanvikatole-ux/Portfolio-hero-section@main/room3/`)*

4. **Customize Properties**
   - **Background**: Customize room background color (default `#F6F1E9`).
   - **Padding**: Adjust outer padding around the room.
   - **Reset Button**: Toggle the floating reset button on/off.
   - **Load Satoshi**: Toggle loading the Satoshi font automatically.

---

## ✨ Features & Interactions

- **🛋️ Draggable Furniture & Objects**: Drag books, plants, frames, figurines, coffee mug, and accessories around the room with realistic physics and stacking orders.
- **💡 Interactive Lamp**: Click/tap the lavender lamp to turn the warm ambient lighting glow on and off.
- **🐶 Sleeping & Happy Puppy**: Ambient breathing animations and floating sleep Z's; tap to wake and play with the puppy.
- **👩‍💻 Janvi at Her Laptop**: Ambient breathing animation and interactive speech bubble / notifications.
- **🔔 Notification Popups**: Cycles through realistic notifications (Figma feedback, messages, calendar design crits, and emails).
- **🌿 Swaying Foliage**: Gentle pendulum swaying animations for the hanging pothos and potted plants.
- **🔄 One-Click Reset**: Floating button smoothly resets all rearranged objects back to their original positions.

---

## 📁 Repository Structure

```
├── framer/
│   ├── JanviRoom.tsx      # Framer React component
│   └── room3/             # Room asset PNGs (for CDN serving)
│       ├── books.png
│       ├── candle.png
│       ├── chai.png
│       ├── dog.png
│       ├── girl.png
│       ├── lamp.png
│       ├── sofa.png
│       └── ...
├── room3/                 # Root asset mirror for direct CDN access
└── README.md
```

---

## 🛠️ Credits & Attribution

Designed and created for Janvi's portfolio showcase.
Repository: [iamjanvikatole-ux/Portfolio-hero-section](https://github.com/iamjanvikatole-ux/Portfolio-hero-section)
