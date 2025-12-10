# How are LLMs Trained? — Metaphor Voice

*Single-threaded narrative deeply immersed in metaphorical thinking.*

---

Training is quarrying marble.

Billions of parameters start as raw stone — random numbers without pattern or purpose. Training is the chisel. Each prediction error is a tap that removes a tiny flake. Trillion taps later, something emerges from the block. Not because the sculptor had a blueprint, but because the stone itself had latent structure, and the taps revealed it.

The training data is the guide. Every sentence the model sees says: "If this is the shape so far, here's what comes next." Wrong predictions get chiseled away. Right predictions remain. Gradually, the stone takes the shape of language itself.

**The gradient river**

Imagine a vast landscape where altitude represents error. The model starts somewhere random, usually on a high plateau where predictions are wrong.

Training is descending this landscape. At each step, you feel which direction slopes downward — that's the gradient. Take a small step in that direction. Repeat.

The landscape has billions of dimensions, one for each parameter. You're not walking down a hillside; you're navigating hyperspace, feeling for descent in directions that have no names.

Remarkably, the descent finds meaningful valleys. The landscape was shaped by human language, so its low points correspond to configurations that understand human language. Walk downhill long enough and you arrive somewhere that predicts text well.

**The primordial soup**

Pre-training creates conditions like the early Earth.

Simple components (parameters), energy sources (compute), consistent pressure (the loss function), and time. Under these conditions, complexity self-organizes. The model doesn't decide to learn grammar or facts or reasoning. These capabilities crystallize because they help survival — in this case, survival means lower loss.

Nobody programmed "understand cause and effect." But text often has causal structure, and predicting it requires tracking causality. So causal reasoning emerges, an evolutionary adaptation to the prediction environment.

The primordial soup of language data, stirred by gradient descent, spontaneously generates something that looks like understanding.

**Carving the sculpture**

If pre-training quarries the marble, fine-tuning is carving.

The raw pre-trained model knows language but doesn't know how to behave. It might complete your prompt as if it's continuing a web page or a Reddit thread or an academic paper. Fine-tuning sculpts this general capability into something specific: an assistant, a coder, a particular persona.

Supervised fine-tuning shows examples: "When you see this kind of request, respond like this." The model adjusts to match the examples. The marble takes a more specific shape.

RLHF is polishing. Human feedback smooths rough edges. "This response was good; that one wasn't." The model learns not just to predict likely text, but to predict text that humans actually prefer. The surface becomes smoother, the expression more refined.

**The foundation matters**

You can't polish a pebble into a masterpiece. Fine-tuning and RLHF shape what's already there — they don't create new capabilities from nothing.

If the pre-trained model doesn't understand math, no amount of fine-tuning will make it a mathematician. Fine-tuning teaches the model to apply its existing knowledge in new ways, to present it better, to access it more reliably. It doesn't add knowledge that wasn't latent in the stone.

This is why pre-training is so expensive and so important. It creates the raw material that everything else depends on.

**The eternal lesson**

The training loop is a single question asked trillions of times: "What comes next?"

Biology faced a similar eternal question: "What survives?" Organisms evolved toward fitness. Models evolve toward prediction accuracy. Neither process has a designer. Both produce complexity that looks designed.

The model that emerges has never been shown how to write poetry. But poetry appeared in training data, and predicting poetry's continuation requires capturing something about what makes poetry work. So the model learns to write poetry, not because anyone asked, but because the prediction task demanded it.

This is the strange miracle: a simple objective, applied relentlessly, produces capabilities no one planned. The lesson repeats itself in every epoch. The model learns not what we taught it, but what it needed to learn in order to predict what we showed it.
