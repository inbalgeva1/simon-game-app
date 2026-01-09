# Step 4: Add Elimination & Multiplayer Competition

**Goal:** Transform into competitive multiplayer game. Wrong answer = eliminated. Fastest correct = +1 point.

**After this step:** Full competitive game! Players battle to stay alive and score points.

**Builds on:** Steps 1-3 (sequence + input + timing)

---

## What We're Adding

The big transformation:
1-3: Solo game (you vs sequence)
4: **Multiplayer competition** (you vs other players)

**NEW:**
- Multiple players playing simultaneously
- Fastest CORRECT submission wins the round
- Wrong answer or timeout = ELIMINATED
- Eliminated players become spectators
- Game continues until 1 player left or all eliminated
- Winner = highest score

Still not included:
- Sound (coming in Step 5)

---

## Backend Requirements

### Updated Game State

**Add:**
```
- scores: { playerId: number }
- playerStatuses: { playerId: 'active' | 'eliminated' }
- submissions: { 
    playerId: {
      sequence: [...],
      timestamp: number,
      isCorrect: boolean
    }
  }
- roundWinner: playerId
```

### New Game Rules

**Scoring:**
- FASTEST correct submission: +1 point
- Other correct submissions: 0 points (but stay alive!)
- Wrong submission: Eliminated (no points)
- Timeout: Eliminated (no points)

**Elimination:**
- Once eliminated, status = 'eliminated'
- Can't submit anymore
- Becomes spectator
- Score frozen

**End Conditions:**
- Only 1 active player remains → That player wins
- All players eliminated in same round → Highest score wins
- No correct answers in round → Highest score wins

### Round Processing Logic

**When all active players submit (or timeout):**

1. **Collect submissions:**
   - Check each submission for correctness
   - Record timestamp for each

2. **Eliminate wrong answers:**
   - Any wrong sequence → eliminate
   - Any timeout → eliminate

3. **Find fastest correct:**
   - Filter to only correct submissions
   - Find earliest timestamp
   - Award +1 point to that player

4. **Check end conditions:**
   - Count active players
   - If ≤1: Game over
   - Otherwise: Next round

5. **Broadcast results:**
   - Round winner
   - Eliminations
   - Updated scores
   - Updated statuses

### New Events

**Server → Client:**
```
Event: 'simon:player_submitted'
Data: {
  playerId: string
  playerName: string
  // Don't reveal if correct/wrong yet!
}
```

```
Event: 'simon:player_eliminated'
Data: {
  playerId: string
  playerName: string
  reason: 'wrong_sequence' | 'timeout'
}
```

```
Event: 'simon:round_result'
Data: {
  roundWinner: { playerId, name } | null
  eliminations: [{ playerId, name, reason }, ...]
  scores: { playerId: number, ... }
  playerStatuses: { playerId: 'active' | 'eliminated', ... }
}
```

```
Event: 'simon:game_finished'
Data: {
  winner: { playerId, name, score }
  finalScores: [{ playerId, name, score }, ...]
  // Sorted by score
}
```

### Handling Edge Cases

**All players wrong:**
- No one gets a point
- All eliminated
- Game over → highest existing score wins

**Only one player correct:**
- That player gets +1 point
- Others eliminated
- If that player is last standing → game over

**Multiple players correct:**
- Fastest gets +1 point
- Others get 0 points but stay alive
- Continue to next round

**Tie (exact same timestamp):**
- BOTH players get +1 point
- Both stay alive

---

## Frontend Requirements

### Player Status Display

**Status Bar (top of screen):**
```
┌──────────────────────────────────┐
│ Round 3                          │
│                                  │
│ YOU: 2 pts ⭐                    │ ← Active (you)
│ Alice: 1 pt ✅                   │ ← Active
│ Bob: 0 pts ❌                    │ ← Eliminated
│ Carol: 3 pts ❌                  │ ← Eliminated
└──────────────────────────────────┘
```

**Visual indicators:**
- Active players: Normal color + ⭐ or ✅
- Eliminated players: Gray + ❌
- Current player (you): Highlighted/bordered

### Spectator Mode

**When you're eliminated:**

**Display:**
- Clear message: "You were eliminated!"
- Reason: "Wrong sequence" or "Timeout"
- Your final score
- "Watching as spectator..."

**What you can see:**
- Sequence display (watch)
- Timer countdown
- Other players' statuses
- Round results
- Final winner

**What you can't do:**
- Click buttons (disabled)
- Submit sequence
- Interact with game

**Purpose:**
- Stay engaged
- See who wins
- Learn strategies
- Prepare for next game

### Phase-by-Phase Display

**Phase 1: Sequence Display**
- All players watch together
- Status bar shows all players

**Phase 2: Input Phase**

**If ACTIVE:**
- Buttons enabled
- Build your sequence
- Submit button
- See when others submit: "Alice submitted ✓"

**If ELIMINATED:**
- Buttons disabled
- Can't submit
- Watch others play
- See submissions happening

**Phase 3: Results**
- Show round winner
- Show eliminations with reasons
- Show updated scores
- Animate changes

### Real-Time Updates

**Show when players submit:**
```
✅ Alice submitted!
✅ Bob submitted!
⏰ Carol hasn't submitted yet...
```

**Show eliminations:**
```
❌ Bob eliminated - wrong sequence
❌ Carol eliminated - timeout
✅ Alice wins the round! +1 pt
```

### Competitive Tension

**Create urgency:**
- Show who submitted already
- Count: "3 of 4 players submitted"
- Pressure to be fast AND correct

**Celebrate winners:**
- Highlight round winner
- Animate score increase
- Show "+1" floating up

**Soften elimination:**
- Clear but not harsh
- "Eliminated" not "YOU LOSE"
- Encourage spectating

---

## Testing This Step

**Test Cases:**

1. **2 players, both correct:**
   - Both submit correct sequence
   - Faster player gets +1 point
   - Slower player gets 0 but stays alive
   - Both advance to next round

2. **2 players, one wrong:**
   - Player A: correct
   - Player B: wrong
   - Player A gets +1 and stays
   - Player B eliminated
   - Player A continues alone

3. **2 players, both wrong:**
   - Both submit wrong
   - Both eliminated
   - Game over
   - Highest score wins (or tie)

4. **4 players, gradual elimination:**
   - Round 1: All correct, fastest gets +1
   - Round 2: One wrong (eliminated)
   - Round 3: Another wrong (eliminated)
   - Round 4: Last 2 compete
   - Round 5: Winner determined

5. **Timeout scenario:**
   - Player A submits correct
   - Player B times out
   - Player A gets +1
   - Player B eliminated

6. **Exact tie:**
   - Two players submit correct at exact same millisecond
   - Both get +1 point
   - Both stay alive

7. **Spectator experience:**
   - Get eliminated
   - See game continue
   - See other players' sequence
   - See final winner

**Success criteria:**
- ✅ Fastest correct gets +1 point
- ✅ Other correct get 0 but stay alive
- ✅ Wrong answer eliminates immediately
- ✅ Timeout eliminates
- ✅ Eliminated become spectators
- ✅ Spectators can see but not play
- ✅ Game ends at right time
- ✅ Winner determined correctly
- ✅ Scores display accurately
- ✅ Tie handling works

---

## Workshop Teaching Points

**After completing this step, emphasize:**

1. **Competitive dynamics:** Fastest AND correct wins
2. **High stakes:** One mistake = out
3. **Spectator engagement:** Eliminated players stay interested
4. **Fair competition:** Server timestamps prevent cheating
5. **Complete game:** This is playable for real!

**Celebrate:** "You built a full competitive multiplayer game! 🏆"

**Preview:** "Next step: Add sound to make it feel like classic Simon!"

---

## Technical Notes

### Timestamp-Based Ranking

**Server must:**
- Record submission timestamp: `Date.now()`
- Compare timestamps to find fastest
- Use server time (not client time)
- Handle ties (same millisecond)

### Processing All Submissions

**Wait for all active players:**
```javascript
const activePlayers = getActivePlayers();
const submissions = getSubmissions();

// Wait until all active submitted OR timeout
if (submissions.length >= activePlayers.length) {
  processRound();
}
```

### State Transitions

**Player states:**
```
active → eliminated (wrong or timeout)
eliminated → stays eliminated (permanent)
```

**Game states:**
```
showing_sequence → input_phase → round_result
  ↓ (if >1 active)              ↓ (if ≤1 active)
showing_sequence              game_finished
```

---

## Common Issues & Solutions

**Issue: Slower player feels bad**
- Solution: Emphasize "correct = survive"
- Solution: Show "Great job staying alive!"

**Issue: Eliminated players leave**
- Solution: Make spectator mode engaging
- Solution: Show elimination kindly

**Issue: Unfair timestamps (network lag)**
- Solution: Use server timestamps only
- Solution: Accept that network lag exists

**Issue: Game doesn't end**
- Solution: Check end conditions after each round
- Solution: Verify active player count

**Issue: Spectator can still click**
- Solution: Disable buttons for eliminated
- Solution: Check status before accepting input

**Issue: Scores don't update**
- Solution: Broadcast scores after each round
- Solution: Verify client updates state

---

## Next Step Preview

**Step 5 will add:**
- Color tones (classic Simon sounds!)
- Success/failure sounds
- Timer warning sounds
- Victory fanfare
- Mute control

Sound transforms the experience! 🔊