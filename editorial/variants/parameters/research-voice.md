# What are Parameters? — Research Voice

*Examines claims and provides supporting evidence, research, and additional context.*

---

## Core Claims and Evidence

### Claim: Parameters are the learned numbers in a neural network

**Definition:** Parameters include:
- **Weights**: Multiply connections between neurons
- **Biases**: Additive terms at each neuron

In transformers specifically:
- Embedding matrices
- Attention projection matrices (Q, K, V, O)
- Feed-forward layer weights
- Layer normalization parameters

**Counting example:** For a transformer layer with hidden size d and MLP multiplier 4x:
- Self-attention: 4d² parameters (Q, K, V, O projections)
- Feed-forward: 8d² parameters (two layers, 4x expansion)
- Total per layer: ~12d² parameters
- For d=12288 and 96 layers: ~175 billion (GPT-3 scale)

---

### Claim: Knowledge is distributed across parameters, not localized

**Research support:** "Locating and Editing Factual Knowledge in GPT" (Meng et al., 2022) attempts to find where facts are stored: https://arxiv.org/abs/2202.05262

**Finding:** Some localization is possible — specific MLP layers seem more involved in factual recall — but knowledge remains largely distributed.

**Interpretability research:** Anthropic's mechanistic interpretability work: https://www.anthropic.com/research
- Shows features can be identified
- But features are distributed, not localized to individual parameters

---

### Claim: More parameters = more capacity, but needs matching data

**Scaling laws paper:** "Scaling Laws for Neural Language Models" (Kaplan et al., OpenAI, 2020): https://arxiv.org/abs/2001.08361

**Chinchilla paper:** "Training Compute-Optimal Large Language Models" (Hoffmann et al., DeepMind, 2022): https://arxiv.org/abs/2203.15556

**Key finding:** Optimal training allocates compute equally to model size and data. Many models were undertrained: Chinchilla (70B) outperformed Gopher (280B) by training on more data.

**Practical implication:** 10x more parameters doesn't mean 10x better. The scaling must be balanced.

---

### Claim: Parameter counts range from millions to trillions

**Documented sizes:**
- ResNet-50 (2015): ~25 million
- BERT-base (2018): 110 million
- GPT-2 (2019): 1.5 billion
- GPT-3 (2020): 175 billion
- PaLM (2022): 540 billion
- GPT-4 (2023): estimated 1+ trillion (MoE)
- Frontier models (2025): 1-2+ trillion

**MoE note:** Mixture-of-experts models have more total parameters but only activate a subset per token, complicating comparisons.

---

### Claim: Quantization reduces precision while preserving quality

**Key paper:** "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers" (Frantar et al., 2022): https://arxiv.org/abs/2210.17323

**Techniques:**
- FP32 → FP16: Minimal quality loss, 2x size reduction
- FP16 → INT8: Small quality loss, 2x size reduction
- INT8 → INT4: Noticeable but often acceptable loss, 2x size reduction

**Memory savings:**
- 70B at FP16: ~140GB
- 70B at INT8: ~70GB
- 70B at INT4: ~35GB

**Practical impact:** Makes large models runnable on consumer hardware (RTX 4090: 24GB VRAM).

---

### Claim: Initialization is random, training sculpts meaningful configurations

**Initialization methods:**
- Xavier/Glorot initialization
- He initialization
- Various specialized schemes for transformers

**Key property:** Initialization doesn't contain meaningful language knowledge. All capability emerges through training.

**Lottery ticket hypothesis:** "The Lottery Ticket Hypothesis: Finding Sparse, Trainable Neural Networks" (Frankle & Carlin, 2018): suggests good sub-networks exist at initialization, but which ones work is discovered through training: https://arxiv.org/abs/1803.03635

---

## Additional Research and Context

### Interpretability progress

**Superposition:** Parameters may encode multiple features simultaneously. "Toy Models of Superposition" (Elhage et al., Anthropic, 2022): https://transformer-circuits.pub/2022/toy_model/index.html

**Sparse autoencoders:** Recent work uses sparse autoencoders to decompose parameter spaces into interpretable features.

**Current status:** Significant progress but far from complete understanding. We can identify some circuits/features; most remain opaque.

### Efficient parameter use

**LoRA:** "Low-Rank Adaptation of Large Language Models" (Hu et al., 2021): Efficient fine-tuning by adding small trainable matrices: https://arxiv.org/abs/2106.09685

**Adapter layers:** Small trainable modules inserted into frozen models.

**Implication:** Not all parameters need training for all tasks. Pre-trained parameters can be adapted with small additions.

### Parameter efficiency vs. performance

**Research question:** Can smaller models match larger ones with better training/architecture?

**Evidence:** Smaller, well-trained models (Llama 7B) can outperform larger, older models. Architecture and data quality matter, not just size.

---

## Recommended Resources

**For understanding:**
1. 3Blue1Brown neural network videos (visual intuition)
2. GPT-3 paper (scale and capability relationship)
3. Chinchilla paper (optimal scaling)

**For implementation:**
1. Hugging Face model documentation (parameter counts per model)
2. GPTQ/AWQ for quantization
3. LoRA for efficient fine-tuning

**For research:**
1. Anthropic's interpretability publications
2. Scaling laws papers
3. Lottery ticket hypothesis
