# What is Temperature in AI? — Metaphor Voice

*Single-threaded narrative deeply immersed in metaphorical thinking.*

---

Temperature is a volume dial where loud is chaos and quiet is conformity.

Turn it down, and the model whispers conventional answers. It sticks close to the obvious, the safe, the well-trodden path. Every word is the expected word. The output is reliable but predictable, like a musician who only plays the exact notes on the page.

Turn it up, and the model shouts unexpected connections. It grabs words from the margins, assembles surprising phrases, ventures into uncharted territory. The output is exciting but unreliable, like a jazz improviser who might transcend the melody or might miss the chord entirely.

Most conversations want moderate volume: enough variety to stay interesting, enough restraint to stay coherent.

**The probability landscape**

Before sampling, the model sees a landscape of possibilities. Each possible next word is a hill of some height. "The" might be a tall peak. "Elephant" might be a small bump. "Xyzzy" might be barely a ripple.

Temperature reshapes this landscape.

Low temperature makes the tall peaks into mountains and flattens everything else into plains. The highest peak dominates utterly. The model climbs to the top and stays there.

High temperature erodes the mountains and raises the plains. Peaks remain higher, but the differences shrink. The model might climb the highest peak, or it might wander toward an interesting ridge that was invisible before.

Temperature doesn't create new peaks. It changes the relative prominence of the peaks that exist. The possibilities were always there; temperature determines which ones have a chance to be chosen.

**The frozen river**

At temperature zero, the model becomes ice. Each token choice locks to the single highest probability. The same prompt produces the same output, every time. Reliable. Repeatable. Potentially boring, but predictable.

Raise the temperature and the ice melts. The river can now flow in more than one channel. Slightly less likely options become reachable. The model explores tributaries that frozen water could never enter.

Raise it higher and the river becomes a flood. It spreads everywhere, including places that don't make sense. Coherence dissolves as the model chooses increasingly improbable tokens just because they've become possible.

The sweet spot is somewhere between ice and flood: liquid enough to explore, constrained enough to flow somewhere meaningful.

**The die roll**

Every token is a die roll, but temperature changes the shape of the die.

At low temperature, it's a loaded die. One face comes up almost every time. There's technically randomness, but practically, you know what you're getting.

At high temperature, it's closer to fair. Many faces have reasonable chances. You genuinely don't know what's coming. This creates variety, but also risk. Sometimes you roll something wonderful. Sometimes you roll something that derails the whole generation.

The model throws this die thousands of times per response. The shape of the die matters.

**The performance**

Temperature sets the terms of creative performance.

Low temperature is the classical musician: precise, rehearsed, playing exactly what the composer wrote. You know what you're getting. Expertise lies in flawless execution of the expected.

Medium temperature is the skilled improviser: mostly playing what makes sense, occasionally taking small detours, finding moments of spontaneity within structure.

High temperature is the experimental artist: potentially brilliant, potentially nonsense, willing to sacrifice coherence for the chance at something genuinely new.

There's no objectively right setting. The question is what kind of performance you want. Sometimes you need the classical musician. Sometimes you need someone willing to break rules.

**The exploration-exploitation tradeoff**

Temperature is a resolution to an ancient dilemma: do you exploit what you know works, or explore what might work better?

Low temperature exploits. It goes with proven winners. If "the" was the best prediction last time, choose "the" again. Safe. Efficient. Potentially stuck in a local optimum.

High temperature explores. It sometimes chooses "a" or "an" or "their" instead, just to see what happens. Potentially wasteful. Potentially discovers something the exploitation strategy would never find.

Every response is a balance between these forces. Temperature is how you set that balance.

**The signature**

Eventually, you develop a temperature signature. You learn that your creative writing tasks want 0.9. Your code generation wants 0.2. Your explanations want 0.7.

This signature is personal. Someone else might prefer different settings. The model doesn't care; it samples from whatever distribution you shape. The signature reflects your tolerance for risk, your preference for surprise, your working relationship with randomness.

Temperature is how you teach the model how much freedom you want it to take.
