# Step 1: Basic Simon Game - Sequence Display

**Goal:** Get the core sequence generation and display working. Players can watch the sequence animate, but can't interact yet.

**After this step:** You'll have a working sequence display that shows random color patterns.

---

## What We're Building

A simple app that:
1. Shows 4 colored buttons (Red, Blue, Yellow, Green)
2. Generates a random sequence (starts with 1 color)
3. Animates the sequence (lights up each color for 1 second)
4. Repeats with longer sequences

**Not yet included:**
- Player input (coming in Step 2)
- Timing/timeouts (coming in Step 3)
- Elimination (coming in Step 4)
- Sound (coming in Step 5)

---

## Backend Requirements

### Game State to Track

**Minimum state:**
```
- round: number (starts at 1)
- currentSequence: array of colors
- gameStatus: 'showing_sequence' | 'finished'
```

### Sequence Generation

**Rules:**
- Round 1 = 1 random color
- Round 2 = 2 random colors
- Round 3 = 3 random colors
- Colors: RED, BLUE, YELLOW, GREEN

**Example sequences:**
- Round 1: [RED]
- Round 2: [BLUE, YELLOW]
- Round 3: [RED, BLUE, GREEN]

### What Server Does

1. **Start Game:**
   - Initialize round = 1
   - Generate sequence for round 1
   - Send sequence to all players

2. **Show Sequence:**
   - Broadcast `show_sequence` event with:
     - Round number
     - Sequence array
   - Wait for sequence to finish displaying

3. **Next Round (for now, automatic):**
   - Increment round
   - Generate longer sequence
   - Repeat

**Stop at Round 5 for testing** (we'll remove this limit later)

### Events to Implement

**Server → Client:**
```
Event: 'simon:show_sequence'
Data: {
  round: number
  sequence: ['red', 'blue', 'yellow', 'green', ...]
}
```

---

## Frontend Requirements

### UI Layout

**Screen:**
- Top: "Round X" display
- Middle: 4 color buttons (2×2 grid)
- Bottom: Status message

**Color Buttons:**
- RED (top-left)
- BLUE (top-right)  
- YELLOW (bottom-left)
- GREEN (bottom-right)

**Size:** Large! At least 150px × 150px each

### Animation Behavior

**When sequence event received:**

1. Show message: "Watch the sequence!"
2. For each color in sequence:
   - Light up that button (brighter + larger)
   - Hold for 1 second
   - Dim back to normal
   - Pause 200ms before next color
3. Show message: "Sequence complete!"
4. Wait 3 seconds
5. Ready for next round

**Visual states:**
- Normal: Regular button appearance
- Active: Brighter, slightly larger (scale 1.1)
- All buttons disabled (no clicking yet)

### What to Display

**Top section:**
- "Round X"
- Big, clear text

**Middle section:**
- 4 color buttons in grid

**Bottom section:**
- "Watch the sequence!" (during animation)
- "Sequence complete!" (after animation)
- "Next round starting..." (between rounds)

---

## Testing This Step

**Manual test:**
1. Start the game
2. See Round 1 with 1 color light up
3. Wait 3 seconds
4. See Round 2 with 2 colors light up
5. Continue through Round 5
6. Game stops

**Success criteria:**
- ✅ Sequence generates randomly
- ✅ Each color lights up for exactly 1 second
- ✅ Sequence plays in correct order
- ✅ Pause between colors (200ms)
- ✅ Round number displays correctly
- ✅ Multiple players see same sequence
- ✅ Longer sequences work (test up to 5 colors)

---

## Technical Notes

### Button Styling (CSS/Tailwind)

**Colors:**
- Red: `bg-red-500`
- Blue: `bg-blue-500`
- Yellow: `bg-yellow-400`
- Green: `bg-green-500`

**Active state:**
- Brightness: `brightness-150`
- Scale: `scale-110`
- Transition: `transition-all duration-200`

### Animation Timing

```
For sequence [RED, BLUE, YELLOW]:

0.0s: RED lights up
1.0s: RED dims
1.2s: BLUE lights up
2.2s: BLUE dims
2.4s: YELLOW lights up
3.4s: YELLOW dims
3.6s: Sequence complete
```

### Platform Integration

**Reuse from platform:**
- Room creation/joining ✅
- Player authentication ✅
- WebSocket connection ✅
- Routing to game page ✅

**Only add:**
- Sequence generation logic
- Sequence display component
- Animation timing

---

## Workshop Teaching Points

**After completing this step, emphasize:**

1. **Visual feedback:** Colors lighting up creates anticipation
2. **Platform reuse:** We didn't rebuild room/auth/sockets!
3. **Incremental building:** Game works even without input
4. **Testing early:** We can see it working immediately
5. **Foundation:** This is the BASE - everything else adds to it

**Celebrate:** "You built a working sequence display! 🎉"

**Preview:** "Next step: Let players try to reproduce it!"

---

## Common Issues & Solutions

**Issue: Sequence animates too fast**
- Solution: Check timing (1000ms per color)

**Issue: Colors don't light up**
- Solution: Check active state CSS

**Issue: Players see different sequences**
- Solution: Server must broadcast same sequence to all

**Issue: Animation stutters**
- Solution: Use CSS transitions, not JS intervals

**Issue: Can't see what's happening**
- Solution: Add console.log for each color

---

## Next Step Preview

**Step 2 will add:**
- Player input (clicking colors)
- Submit button
- Sequence validation
- "Correct" or "Wrong" feedback

But for now, just enjoy watching the sequence! 👀