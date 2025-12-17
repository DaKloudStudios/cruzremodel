# Data & API Reference

This document outlines the external APIs used and the internal data structures defined within the application.

## External APIs

### 1. Google Gemini API (`@google/genai`)
Used in the `ChatAssistant` component to provide a conversational agent ("Cruz AI").

*   **Model:** `gemini-2.5-flash`
*   **Configuration:**
    *   `temperature`: 0 (Strict adherence to facts).
    *   `maxOutputTokens`: 1000.
*   **System Instruction:**
    The agent is pre-prompted with a "Knowledge Base" containing:
    *   Business Name, Phone, Website, License Number.
    *   Services list (Kitchens, Bathrooms, etc.).
    *   Process details (3 steps).
    *   **Strict Rule:** If information is not in the knowledge base, the AI *must* refer the user to the phone number `(669) 251-7670`. It is explicitly forbidden from hallucinating prices or services not listed.

### 2. Unsplash Source API
Used for fetching team member photos dynamically in the `Team` component.

## Internal Data Structures (`types.ts`)

### Review Interface
Used in `Reviews.tsx` for client testimonials.
```typescript
export interface Review {
  id: number;
  name: string;
  rating: number; // 1-5
  text: string;
  category: 'Quality' | 'Service' | 'Results';
  date: string;
}
```

### TeamMember Interface
*Note: While defined in types.ts, the current `Team.tsx` implementation uses a hardcoded profile layout for the Founder.*

### Comparisons (Before/After)
Used in `BeforeAfter.tsx`. Not strictly typed in `types.ts` but passed as props:
```typescript
interface ComparisonProps {
  beforeImage: string; // URL
  afterImage: string;  // URL
  beforeLabel?: string;
  afterLabel?: string;
}
```

## Hardcoded Data Sources

Data is currently defined statically within components to ensure instant loading without database latency:

*   **Knowledge Base:** Defined as a constant string `KNOWLEDGE_BASE` inside `ChatAssistant.tsx`.
*   **Reviews Data:** Hardcoded in `Reviews.tsx`.
*   **Stats Data:** Hardcoded in `StatsBar.tsx`.
