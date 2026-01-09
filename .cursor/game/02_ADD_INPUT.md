# Step 2: Add Player Input & Validation

**Goal:** Let players click colors to reproduce the sequence. Check if they got it right.

**After this step:** Players can play the game! Click sequence → see if correct → next round or game over.

**Builds on:** Step 1 (sequence display)

---

## What We're Adding

Now players can:
1. Watch the sequence (Step 1 - already works)
2. **NEW:** Click buttons to reproduce sequence
3. **NEW:** Submit their answer
4. **NEW:** See if they got it right or wrong

Still not included:
- Timeouts (coming in Step 3)
- Elimination/multiplayer scoring (coming in Step 4)
- Sound (coming in Step 5)

---

## Backend Requirements

### Updated Game State

**Add to state:**
```
- gamePhase: 'showing_sequence' | 'input_phase' | 'round_result'
- submissions: { playerId: { sequence: [...], isCorrect: boolean } }
- roundWinner: playerId or null
```

### New Logic Needed

**1. Sequence Validation**
- Check if submitted sequence matches current sequence
- Must match EXACTLY (right colors, right order, right length)

**2. Process Submissions**
- When player submits, validate immediately
- If correct: Player advances to next round
- If wrong: Game over (for now - we'll add elimination later)

**3. Round Progression**
- If correct: Generate new sequence (longer by 1)
- If wrong: End game

### New Events to Implement

**Client → Server:**
```
Event: 'simon:submit_sequence'
Data: {
  gameCode: string
  playerId: string
  sequence: ['red', 'blue', ...]
}
```

**Server → Client:**
```
Event: 'simon:input_phase'
Data: {
  round: number
}
```

```
Event: 'simon:result'
Data: {
  playerId: string
  playerName: string
  isCorrect: boolean
  correctSequence: [...]
}
```

### Game Flow

**After sequence displays:**
1. Wait 500ms
2. Broadcast `simon:input_phase` event
3. Player builds their sequence by clicking
4. Player clicks Submit button
5. Server validates
6. Server broadcasts result
7. If correct: Start next round (back to Step 1 flow)
8. If wrong: Game over

---

## Frontend Requirements

### New UI Elements

**Add to screen:**
- Input area showing your sequence as you build it
- Submit button (appears when sequence length matches target)
- Result display (correct/wrong)

**Updated button states:**
- DISABLED during sequence display
- ENABLED during input phase
- Clickable and responsive

### Building Sequence Display

**As player clicks:**
- Show sequence of colored circles/squares
- Display: "Your sequence: 🔴 🔵 🟡" (or color names)
- Clear indication of progress: "2 of 3 colors"

**Submit button:**
- Appears when sequence length = target length
- Big, obvious: "SUBMIT"
- Disabled if sequence incomplete
- Enabled when ready

### Visual Feedback

**During input:**
- Buttons light up when clicked (brief flash)
- Sequence builds visually
- Submit button state changes

**After submission:**
- Disable all buttons
- Show "Checking..." message
- Wait for result

**Result display:**
- If CORRECT: Green checkmark + "Correct! Next round..."
- If WRONG: Red X + "Wrong sequence. Game over."
- Show correct sequence if wrong

### Phase Management

**Phase 1: Sequence Display** (from Step 1)
- Buttons disabled
- Watch animation

**Phase 2: Input Phase** (NEW)
- Buttons enabled
- Click to build sequence
- Submit when ready

**Phase 3: Result** (NEW)
- Buttons disabled
- Show result
- Pause before next round or end

---

## Testing This Step

**Test Cases:**

1. **Correct sequence:**
   - Watch sequence: [RED, BLUE]
   - Click: RED, BLUE
   - Submit
   - See: "Correct!"
   - Advance to Round 2

2. **Wrong color:**
   - Watch: [RED, BLUE]
   - Click: RED, YELLOW
   - Submit
   - See: "Wrong! Correct was: RED, BLUE"
   - Game over

3. **Wrong order:**
   - Watch: [RED, BLUE]
   - Click: BLUE, RED
   - Submit
   - See: "Wrong!"

4. **Wrong length:**
   - Watch: [RED, BLUE]
   - Click: RED
   - Submit button stays disabled (can't submit)

**Success criteria:**
- ✅ Buttons enable after sequence displays
- ✅ Clicking adds color to your sequence
- ✅ Submit button appears when sequence complete
- ✅ Correct sequence advances round
- ✅ Wrong sequence shows error
- ✅ Can play through multiple rounds
- ✅ Multiple players can play independently

---

## UI Examples

### Building Sequence View

```
Your sequence: 
[🔴] [🔵] [  ]

2 of 3 colors selected
```

### Submit Button States

```
[SUBMIT] (gray, disabled) - incomplete sequence
[SUBMIT] (green, enabled) - ready to submit
[Checking...] (gray, disabled) - after submit
```

### Result Display

```
✅ CORRECT!
Next round starting...
```

```
❌ WRONG SEQUENCE
Correct was: RED → BLUE → YELLOW
Game Over
```

---

## Workshop Teaching Points

**After completing this step, emphasize:**

1. **Input validation:** Server checks correctness
2. **User feedback:** Clear visual states
3. **Progressive disclosure:** Submit only when ready
4. **Error handling:** Show what went wrong
5. **Game loop:** Correct → harder, wrong → end

**Celebrate:** "You can play the game now! 🎮"

**Preview:** "Next step: Add pressure with countdown timers!"

---

## Technical Notes

### Validation Logic

**Pseudocode:**
```
function validateSequence(submitted, correct):
  if submitted.length !== correct.length:
    return false
  
  for each position:
    if submitted[position] !== correct[position]:
      return false
  
  return true
```

### Click Handling

**When button clicked:**
1. Check if in input phase
2. Check if sequence incomplete
3. Add color to player's sequence
4. Update display
5. Check if sequence complete → enable submit

**When submit clicked:**
1. Disable submit button
2. Send to server
3. Show "Checking..."
4. Wait for result

### State Management

**Track:**
- Player's current sequence: []
- Target sequence length: number
- Can submit: boolean
- Phase: showing | input | result

---

## Common Issues & Solutions

**Issue: Can't click buttons**
- Solution: Check input phase started
- Solution: Check buttons are enabled

**Issue: Submit button doesn't appear**
- Solution: Check sequence length matches target

**Issue: Wrong validation**
- Solution: Check array comparison (order matters!)

**Issue: Can submit incomplete sequence**
- Solution: Check length before enabling submit

**Issue: Result doesn't display**
- Solution: Check event listener for result event

---

## Next Step Preview

**Step 3 will add:**
- Countdown timer
- Time pressure
- Timeout handling (ran out of time = wrong)

The game becomes much more intense! ⏰