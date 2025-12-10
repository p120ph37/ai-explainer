# How are LLMs Trained? — Research Voice

*Examines claims and provides supporting evidence, research, and additional context.*

---

## Core Claims and Evidence

### Claim: LLMs are trained by predicting next tokens on massive text corpora

**Foundational paper:** "Language Models are Few-Shot Learners" (Brown et al., OpenAI, 2020) describes GPT-3's training methodology: next-token prediction on 300 billion tokens: https://arxiv.org/abs/2005.14165

**Accessible walkthrough:** Andrej Karpathy's "Let's build GPT: from scratch, in code" (2023) implements a small language model, demonstrating the training loop: https://www.youtube.com/watch?v=kCc8FmEb1nY

**Training objective:** Cross-entropy loss between predicted probability distribution and actual next token. Minimizing this loss maximizes the likelihood of the training data.

---

### Claim: Training uses gradient descent and backpropagation

**Textbook reference:** Deep Learning (Goodfellow, Bengio, Courville, 2016) provides the canonical explanation of gradient descent and backpropagation: https://www.deeplearningbook.org/

**Simple explanation:** 
1. Compute loss (how wrong the prediction was)
2. Compute gradient (how each parameter affected the loss)
3. Update parameters in the direction that reduces loss
4. Repeat

**Variants used in practice:**
- Adam optimizer: adaptive learning rates per parameter
- Learning rate scheduling: decrease learning rate over training
- Gradient clipping: prevent unstable updates

---

### Claim: Training data includes web crawls, books, code, and more

**Common Crawl:** Primary source for web data, containing petabytes of crawled pages: https://commoncrawl.org/

**The Pile:** Open-source 825GB training dataset documenting diverse sources: https://pile.eleuther.ai/
- Includes: PubMed, ArXiv, GitHub, Stack Exchange, Wikipedia, Books3, etc.

**Proprietary datasets:** OpenAI, Anthropic, and others use undisclosed data mixtures likely including licensed content.

**Training data scale:**
- GPT-3: ~300 billion tokens
- Chinchilla: 1.4 trillion tokens (optimal for 70B parameters)
- LLaMA: 1-2 trillion tokens
- Frontier models (2024-25): likely 10+ trillion tokens

---

### Claim: Training requires massive compute (thousands of GPU-years)

**GPT-3 training estimate:** OpenAI reported ~3,640 petaflop/s-days of compute. At H100 efficiency, approximately 1,000-10,000 GPU-years depending on utilization.

**Scaling laws paper:** "Scaling Laws for Neural Language Models" (Kaplan et al., 2020) shows compute requirements scale predictably with model size: https://arxiv.org/abs/2001.08361

**Cost estimates:**
- GPT-3: Estimated $4-12 million in compute
- GPT-4: Estimated $50-100 million
- Frontier 2025 models: Possibly $100-500 million

**Training duration:** Weeks to months on clusters of thousands of GPUs/TPUs.

---

### Claim: Training is distributed across many machines

**Technical approaches:**

**Data parallelism:** Each device processes different batches, gradients are averaged. Papers: "Accurate, Large Minibatch SGD" (Goyal et al., 2017)

**Model parallelism:** Model is split across devices. Papers: "Megatron-LM" (Shoeybi et al., NVIDIA, 2019): https://arxiv.org/abs/1909.08053

**Pipeline parallelism:** Different layers on different devices, pipeline the forward/backward passes. Papers: "GPipe" (Huang et al., 2019)

**Modern frameworks:** DeepSpeed (Microsoft), Megatron-LM (NVIDIA), FSDP (PyTorch) implement these strategies.

---

### Claim: Training has multiple stages (pre-training, SFT, RLHF)

**Pre-training:** Unsupervised next-token prediction on massive data. Creates general language understanding.

**Supervised Fine-Tuning (SFT):** Training on instruction-response pairs. Documented in "Training language models to follow instructions" (Ouyang et al., OpenAI, 2022): https://arxiv.org/abs/2203.02155

**RLHF:** Training on human preferences. Same paper (Ouyang et al.) describes the InstructGPT methodology.

**Alternative: Constitutional AI:** Anthropic's approach uses AI feedback (RLAIF) alongside human feedback: https://arxiv.org/abs/2212.08073

**Training pipeline:**
1. Pre-training: ~99% of compute
2. SFT: Small fraction of compute
3. RLHF/RLAIF: Small fraction of compute, but critical for behavior

---

## Additional Research and Context

### Chinchilla scaling laws

**Paper:** "Training Compute-Optimal Large Language Models" (Hoffmann et al., DeepMind, 2022): https://arxiv.org/abs/2203.15556

**Key finding:** Many LLMs were undertrained. Optimal allocation: roughly equal scaling of parameters and training tokens. A smaller model trained on more data outperforms a larger model trained on less.

**Impact:** Shifted industry toward more training data, not just more parameters.

### Data quality vs quantity

**Findings:** Data quality matters as much as quantity. Deduplication, filtering, and domain balancing significantly affect model quality.

**Paper:** "The Pile: An 800GB Dataset of Diverse Text for Language Modeling" (Gao et al., 2020): https://arxiv.org/abs/2101.00027

### Training instability

**Challenge:** Large model training can diverge (loss spikes, fails to converge). Causes include:
- Learning rate too high
- Data quality issues
- Numerical precision problems

**Mitigations:** Gradient clipping, careful initialization, mixed-precision training, extensive monitoring.

### Environmental impact

**Estimate:** Training GPT-3 emitted ~500 tons of CO2 equivalent (varies by data center energy source).

**Paper:** "Energy and Policy Considerations for Deep Learning in NLP" (Strubell et al., 2019): https://arxiv.org/abs/1906.02243

---

## Recommended Resources

**For understanding:**
1. Karpathy's "Let's build GPT" video
2. Brown et al. GPT-3 paper (accessible for its impact and clarity)
3. Hoffmann et al. Chinchilla paper (scaling insights)

**For implementation:**
1. Hugging Face transformers training tutorials
2. DeepSpeed documentation
3. nanoGPT (Karpathy's minimal implementation): https://github.com/karpathy/nanoGPT

**For research:**
1. Kaplan et al. scaling laws
2. Ouyang et al. InstructGPT/RLHF
3. Constitutional AI paper
