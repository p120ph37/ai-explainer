# How are LLMs Trained? — Socratic Voice

*Narrative progressing through questions, leading discovery.*

---

If LLMs learn from text, how does that learning actually happen? Is it memorization? Something else?

Something else. The model learns to predict, not to recall.

What's the difference?

Memorization stores specific instances. Prediction learns patterns that generalize. A model that memorized "The capital of France is Paris" knows one fact. A model that learned the pattern of factual questions can answer questions it never saw exactly.

How does it learn these patterns?

Through a cycle repeated billions of times. Show the model some text. Ask it to predict the next word. Compare its prediction to the actual word. Adjust its parameters to make its prediction a little better. Repeat.

That sounds too simple to produce something intelligent.

It does. And yet.

Consider what "predicting text well" requires. To predict how a mystery story continues, you need to track the plot. To predict working code, you need to understand what the code does. To predict a physics derivation, you need to follow the math.

The objective is simple — predict the next token. Achieving that objective across all human writing requires developing something that resembles understanding.

But how do parameters "adjust"? What does that even mean?

Parameters are just numbers. Billions of them. Each one affects the model's predictions in some small way.

When the model makes a wrong prediction, training calculates how much each parameter contributed to the error. Parameters that pushed toward the wrong answer get nudged the other direction. Parameters that helped get reinforced.

This is gradient descent?

Exactly. The "gradient" is a calculation of which way to nudge each parameter. "Descent" because you're descending toward lower error.

Why does this find meaningful configurations?

Here's where it gets interesting. The parameter space has billions of dimensions. Most configurations produce gibberish. But some configurations produce good predictions.

Gradient descent finds those configurations because the training data shapes the landscape. Text has patterns — grammatical, factual, logical, stylistic. Configurations that capture those patterns make better predictions. Gradient descent rolls downhill toward them.

Where does training data come from?

Everywhere humans write. Web crawls capture billions of pages. Books, both public domain and licensed. Code from GitHub. Conversations from forums. Academic papers. Wikipedia.

Trillions of tokens from diverse sources. The model sees the full breadth of human expression because it needs to predict the full breadth.

What about problematic content in that data?

It's there. The web contains misinformation, bias, offensive content. The model learns from all of it.

This is why post-training matters — fine-tuning on curated data and RLHF to align with human preferences. Pre-training gives raw capability; post-training shapes behavior.

What is RLHF?

Reinforcement Learning from Human Feedback. Humans rate model responses. Better ratings reinforce the parameters that produced them. Worse ratings push parameters the other direction.

It's another optimization loop, but optimizing for human preference rather than raw prediction accuracy.

Does RLHF add new capabilities?

No. It teaches the model to use existing capabilities in preferred ways. The model already knew how to produce many kinds of text. RLHF teaches it which kinds humans want.

How much compute does training take?

Staggering amounts. GPT-3 took thousands of GPU-years. Frontier models cost tens to hundreds of millions of dollars in compute alone.

Why so much?

The training loop runs billions of times. Each iteration processes a batch of text through billions of parameters, computes gradients for all of them, and updates them all. Multiply by trillions of training tokens.

This is why few organizations train frontier models. The cost is prohibitive. Most people use pre-trained models.

What should someone take away from understanding training?

That LLMs learn by prediction, not memorization. That the simple objective "predict what comes next" somehow produces complex capabilities. That massive compute and diverse data combine to create something that generalizes far beyond any specific example it saw.

The training process is almost unreasonably effective. A single objective, applied at sufficient scale, produces capabilities that continually surprise the people who built the systems.
