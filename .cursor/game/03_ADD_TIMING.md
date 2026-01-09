# Step 3: Add Timing & Countdown

**Goal:** Add countdown timers to create time pressure. If player doesn't submit in time, they lose.

**After this step:** Game has real pressure! Race against the clock to reproduce sequences.

**Builds on:** Steps 1-2 (sequence display + player input)

---

## What We're Adding

Now the game has:
1. Sequence display (Step 1)
2. Player input (Step 2)
3. **NEW:** Countdown timer (visible to player)
4. **NEW:** Timeout enforcement (run out of time = wrong)
5. **NEW:** Dynamic timeout (longer sequences = more time)

Still not included:
- Multiplayer elimination (coming in Step 4)
- Sound (coming in Step 5)

---

## Backend Requirements

### Timeout Calculation

**Formula:**
```
timeout = 15 + (sequenceLength × 2) seconds
```

**Examples:**
- 1 color: 15 + 2 = 17 seconds
- 2 colors: 15 + 4 = 19 seconds
- 3 colors: 15 + 6 = 21 seconds
- 5 colors: 15 + 10 = 25 seconds

**Why:** Gives more time for longer sequences, but keeps pressure

### Updated Game State

**Add to state:**
```
- timeoutAt: timestamp (when timeout occurs)
- timerStartedAt: timestamp (when input phase began)
```

### New Server Logic

**1. Start Input Phase:**
- Calculate timeout based on sequence length
- Set server timer
- Broadcast timeout timestamp to clients
- If timer expires: treat as wrong answer

**2. Handle Timeout:**
- When timer expires:
  - If player hasn't submitted: Mark as wrong
  - Send timeout event
  - End game (for now)

**3. Handle Early Submission:**
- If player submits before timeout:
  - Cancel server timer
  - Process normally (validate + result)

### New Events

**Server → Client:**
```
Event: 'simon:input_phase'
Data: {
  round: number
  timeoutAt: timestamp (Date.now() + timeout * 1000)
  timeoutSeconds: number (for display)
}
```

```
Event: 'simon:timeout'
Data: {
  playerId: string
  playerName: string
  correctSequence: [...]
}
```

### Server Timer Management

**Important:**
- Set `setTimeout` when input phase starts
- Clear `setTimeout` if player submits early
- Track timer IDs per room
- Clean up timers on game end

---

## Frontend Requirements

### Timer Display

**Location:** Top-center or bottom-center (very visible!)

**Visual states:**
- Green: >10 seconds remaining
- Yellow: 5-10 seconds remaining  
- Red: <5 seconds remaining
- Pulsing: <3 seconds remaining

**Size:** LARGE - at least 48px font

**Format:** "15s" or "00:15" (seconds remaining)

### Timer Behavior

**On input_phase event:**
1. Receive timeoutAt timestamp
2. Calculate seconds remaining
3. Start countdown display
4. Update every 100ms for smooth animation
5. Change colors based on time
6. Pulse when <3 seconds

**When player submits:**
- Stop timer
- Show "Checking..." instead

**On timeout:**
- Timer hits 0
- Show "Time's Up!" message
- Display result (wrong + correct sequence)

### Visual Feedback

**Timer colors:**
```
>10s: text-green-500
5-10s: text-yellow-500
<5s: text-red-500
<3s: text-red-600 + animate-pulse
```

**Timer size changes:**
```
>5s: Regular size (48px)
<5s: Larger (60px) + bold
<3s: Even larger (72px) + bolder
```

### Updated UI Layout

```
┌─────────────────────────┐
│   Round X               │
│                         │
│   ⏱️  15s               │  ← NEW: Big timer
│                         │
│   [RED]    [BLUE]       │
│   [YELLOW] [GREEN]      │
│                         │
│   Your sequence: ...    │
│   [SUBMIT]              │
└─────────────────────────┘
```

---

## Testing This Step

**Test Cases:**

1. **Submit before timeout:**
   - Watch sequence
   - See timer: 17 seconds
   - Build sequence quickly
   - Submit at 10 seconds remaining
   - Normal result

2. **Timeout with no submission:**
   - Watch sequence
   - See timer countdown
   - Don't click anything
   - Timer hits 0
   - See "Time's Up!" + wrong result

3. **Timeout while building:**
   - Watch sequence
   - Click some colors but don't finish
   - Timer hits 0
   - See "Time's Up!" + wrong result

4. **Different timeouts for different lengths:**
   - Round 1: 17 seconds
   - Round 2: 19 seconds
   - Round 3: 21 seconds
   - Verify formula works

5. **Visual states:**
   - Start: Green timer
   - At 8 seconds: Yellow
   - At 4 seconds: Red
   - At 2 seconds: Red + pulsing

**Success criteria:**
- ✅ Timer displays correctly
- ✅ Timer counts down smoothly
- ✅ Colors change at right thresholds
- ✅ Pulsing animation at <3 seconds
- ✅ Timeout enforced (can't submit after 0)
- ✅ Early submission cancels timer
- ✅ Longer sequences get more time
- ✅ Timer synced across players

---

## Technical Notes

### Timer Implementation

**Client-side countdown:**
```javascript
const secondsRemaining = Math.max(0, 
  Math.floor((timeoutAt - Date.now()) / 1000)
);

// Update every 100ms for smooth display
setInterval(() => {
  updateTimerDisplay();
}, 100);
```

**Server-side enforcement:**
```javascript
const timeoutMs = calculateTimeout(sequence.length) * 1000;
const timer = setTimeout(() => {
  handlePlayerTimeout(gameCode, playerId);
}, timeoutMs);

// Store timer ID to cancel if player submits
timeouts.set(gameCode, timer);
```

### Handling Time Zones

**Use timestamps, not durations:**
- Server sends: `timeoutAt: Date.now() + 17000`
- Client calculates: `remaining = timeoutAt - Date.now()`
- Works regardless of time zone or clock drift

### Animation Performance

**Optimize:**
- Use CSS transitions for color changes
- Use requestAnimationFrame for smooth countdown
- Don't update DOM on every millisecond
- Update display every 100ms (sufficient for seconds)

---

## Workshop Teaching Points

**After completing this step, emphasize:**

1. **Time pressure:** Changes game feel completely
2. **Visual urgency:** Colors/size/pulsing create tension
3. **Fair timing:** Formula scales with difficulty
4. **Server authority:** Server enforces timeout, client displays
5. **UX polish:** Smooth animations matter

**Celebrate:** "Game feels intense now! ⏰"

**Preview:** "Next step: Multiplayer competition and elimination!"

---

## Common Issues & Solutions

**Issue: Timer jumps or stutters**
- Solution: Update every 100ms, not every ms
- Solution: Use requestAnimationFrame

**Issue: Timer doesn't sync between players**
- Solution: Use server timestamps, not durations
- Solution: Calculate from timeoutAt

**Issue: Can submit after timeout**
- Solution: Disable submit button at 0 seconds
- Solution: Server validates timestamp

**Issue: Timer goes negative**
- Solution: Use Math.max(0, remaining)

**Issue: Timeout doesn't fire on server**
- Solution: Check timer cleanup
- Solution: Verify setTimeout called

**Issue: Visual states don't change**
- Solution: Check threshold values
- Solution: Verify CSS classes applied

---

## UI/UX Tips

**Make it feel urgent:**
- Bigger numbers = more visible
- Red = danger
- Pulsing = panic!
- Sound effects would help (Step 5!)

**But not TOO stressful:**
- Don't flash too aggressively
- Give enough time (formula is balanced)
- Clear visual states

**Accessibility:**
- Don't rely only on color
- Add text: "TIME RUNNING OUT"
- Ensure timer is keyboard-accessible

---

## Next Step Preview

**Step 4 will add:**
- Multiplayer competitive scoring
- Elimination system
- Spectator mode
- "Fastest correct wins" mechanic
- Game continues after elimination

This is where it becomes truly competitive! 🏆