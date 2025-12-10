# Communicating Effectively with LLMs — Primary Voice

*Single-threaded narrative in the primary style: question-led, direct answers, clear explanations.*

---

**Why do small wording changes produce dramatically different results?**

LLMs are sensitive to phrasing. The same question asked two ways can yield different quality answers. Adding a single sentence can transform a mediocre response into an excellent one.

This sensitivity is a feature, not a bug. The model uses every token for context. Change the tokens, change the context, change the predictions.

**Prompt engineering** is the practice of crafting inputs to get better outputs. It's part art, part science, and essential for getting value from LLMs.

**The basics: be clear and specific**

Vague prompts get vague responses. Specific prompts get specific responses.

**Weak**: "Tell me about dogs"
**Better**: "Explain how dogs were domesticated from wolves, focusing on the timeline and genetic evidence"

**Weak**: "Write code for a website"
**Better**: "Write a Python Flask endpoint that accepts POST requests with JSON containing 'email' and 'message' fields, validates them, and returns a success response"

Specificity helps the model focus. It's not reading your mind; it's pattern-matching on your words.

**Provide context**

The model only knows what's in the context window. Background information helps:

- "You are helping a beginner programmer" shapes the explanation level
- "This is for a formal business email" shapes the tone
- "The user is a domain expert in biology" shapes assumed knowledge

Don't assume the model knows your situation. State it explicitly.

**Show examples (few-shot prompting)**

Instead of describing what you want, show it.

Provide a few examples of input-output pairs, then give your actual input. The model pattern-matches your examples and continues the pattern. This often communicates format, style, and expectations more precisely than description.

**Ask for reasoning (chain of thought)**

Complex problems benefit from explicit reasoning. Adding "think step by step" or "explain your reasoning" often improves accuracy.

Why? The model does computation through the tokens it generates. Reasoning steps are where thinking happens. Skip them and you skip the computation.

**Structure your requests**

Clear structure helps the model parse your intent. Use headers, bullet points, explicit sections. The model knows exactly what's task, what's constraint, and what's input.

```
## Task
Summarize the following article.

## Requirements
- Maximum 3 paragraphs
- Include key statistics
- Maintain neutral tone

## Article
[paste article here]
```

**Iterate and refine**

Prompt engineering is often iterative. Try something, see the result, adjust. Common refinements:

- Add constraints if output is too broad
- Remove constraints if output is too narrow
- Provide examples if format is wrong
- Ask for reasoning if accuracy is low
- Adjust length instructions if too long/short

There's rarely a perfect prompt on the first try. Treat prompting as a conversation, not a one-shot command.

**The limits of prompting**

Prompting can't make a model do what it fundamentally can't do. If the capability isn't there, no prompt will unlock it.

Prompting also can't guarantee consistency. Even with a perfect prompt, temperature adds variation. Different runs give different results.

Think of prompting as steering, not programming. You're guiding a capable system, not specifying exact behavior. Good prompts make desired outputs more likely, not certain.
