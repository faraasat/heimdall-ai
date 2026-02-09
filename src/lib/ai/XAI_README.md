# Explainable AI (XAI) Module

## Overview

The HeimdallAI Explainable AI module provides **algorithmic implementations** of state-of-the-art XAI techniques specifically adapted for security vulnerability analysis. Unlike LLM-based approximations, these implementations use actual mathematical algorithms to provide transparent, reproducible, and interpretable explanations.

## Key Features

### 🎯 **No LLM Dependencies**
- All XAI methods run locally using pure algorithmic implementations
- No external API calls or model inference required
- Deterministic and reproducible results
- Fast execution (milliseconds instead of seconds)

### 🔬 **Implemented XAI Techniques**

#### 1. **SHAP (SHapley Additive exPlanations)**
- Implementation: KernelSHAP algorithm
- Purpose: Global feature importance for vulnerability detection
- Output: Feature contribution scores (-1 to +1 scale)

```typescript
const shapAnalysis = await analyzeSHAP(finding)
// Returns: feature_impacts, base_risk_score, final_risk_score, visualization_data
```

#### 2. **LIME (Local Interpretable Model-agnostic Explanations)**
- Implementation: Local linear approximation with weighted sampling
- Purpose: Local explanation for specific vulnerability findings
- Output: Linear model coefficients and confidence scores

```typescript
const limeExplanation = await explainWithLIME(finding)
// Returns: prediction, confidence, local_factors, decision_boundary
```

#### 3. **Counterfactual Explanations**
- Implementation: Greedy search for minimal modifications
- Purpose: "What-if" scenarios showing minimal changes to prevent vulnerability
- Output: Required modifications, feasibility score, effort estimates

```typescript
const counterfactual = await generateCounterfactual(finding)
// Returns: original_state, counterfactual_state, minimal_changes_required
```

#### 4. **Anchor Rules**
- Implementation: High-precision rule extraction with coverage analysis
- Purpose: Extract reliable IF-THEN rules that predict vulnerabilities
- Output: Conditions with precision/coverage metrics

```typescript
const anchors = await extractAnchors(finding)
// Returns: Array of rules with precision, coverage, examples
```

#### 5. **Partial Dependence Analysis (PDA)**
- Implementation: Marginal effect computation with interaction detection
- Purpose: Show how individual variables affect overall risk
- Output: Risk curves and interaction effects

```typescript
const pdAnalysis = await analyzePartialDependence(finding, 'encryption_strength')
// Returns: variable_values, predicted_risk, interaction_effects
```

#### 6. **Integrated Gradients**
- Implementation: Path integral approximation using Riemann sums
- Purpose: Feature attribution from baseline to actual state
- Output: Attribution scores for each security feature

```typescript
const attribution = await calculateIntegratedGradients(finding)
// Returns: input_features, attribution_scores, influential_factors
```

## How It Works

### Feature Extraction

The module automatically extracts security-relevant features from vulnerability findings:

- **Vulnerability Type Indicators**: SQL injection, XSS, auth bypass, crypto weakness, etc.
- **Severity Metrics**: Normalized severity levels
- **Evidence Strength**: Based on evidence completeness
- **Asset Characteristics**: Web, API, or network asset detection

### Risk Scoring

Uses a weighted risk calculation that considers:
- Feature presence and strength (0-1 scale)
- Security criticality weights (injection/bypass: 2.0x, crypto/auth: 1.5x)
- Severity level contribution (1.8x weight)

### Mathematical Foundations

#### SHAP Values
```
φᵢ = Σ [R(S ∪ {i}) - R(S)] / |coalitions|
```
Where R(S) is the risk score for feature set S.

#### LIME Weights
```
w = exp(-distance² × kernel_width)
```
Local linear model fitted using exponential kernel weighting.

#### Integrated Gradients
```
IG(xᵢ) = (xᵢ - x'ᵢ) × ∫₀¹ ∂R/∂xᵢ(x' + α(x - x')) dα
```
Path integral from baseline x' to actual features x.

## Usage Examples

### Basic Usage

```typescript
import { comprehensiveXAIAnalysis } from '@/lib/ai/explainable-ai'

const finding = {
  title: 'SQL Injection Vulnerability',
  description: 'Unsanitized input in login form',
  evidence: { /* ... */ },
  severity: 'critical',
  affected_asset: 'https://example.com/login'
}

// Run all XAI analyses
const xaiResults = await comprehensiveXAIAnalysis(finding)

console.log('Top factors:', xaiResults.summary.top_contributing_factors)
console.log('Confidence:', xaiResults.summary.confidence)
console.log('Minimal fix:', xaiResults.summary.minimal_fix)
```

### Individual Methods

```typescript
import {
  analyzeSHAP,
  explainWithLIME,
  generateCounterfactual,
  extractAnchors,
  analyzePartialDependence,
  calculateIntegratedGradients
} from '@/lib/ai/explainable-ai'

// SHAP analysis only
const shapResults = await analyzeSHAP(finding)
console.log('Most important feature:', shapResults.feature_impacts[0].feature)

// Counterfactual analysis only
const cfResults = await generateCounterfactual(finding)
console.log('Changes needed:', cfResults.minimal_changes_required)
```

### Visualization Ready

All methods return data structures optimized for visualization:

```typescript
// SHAP waterfall chart
const { feature_names, impact_values } = shapResults.visualization_data

// Integrated Gradients bar chart
const { labels, scores } = igResults.visualization

// LIME factor weights
const weights = limeResults.local_factors.map(f => f.weight)
```

## Performance

- **SHAP Analysis**: ~5-10ms per finding
- **LIME Explanation**: ~20-30ms (includes 100 perturbations)
- **Counterfactual**: ~5ms (greedy search)
- **Anchor Rules**: ~2-5ms (pattern matching)
- **Partial Dependence**: ~10-15ms (5 test points)
- **Integrated Gradients**: ~15-20ms (20-step integration)
- **Comprehensive Analysis**: ~50-80ms (all methods combined)

## Advantages Over LLM-Based XAI

| Aspect | Algorithmic XAI | LLM-Based XAI |
|--------|----------------|---------------|
| **Speed** | <100ms | 2-5 seconds |
| **Cost** | Free | API costs per call |
| **Reproducibility** | 100% deterministic | Varies per call |
| **Transparency** | Full algorithm visibility | Black box |
| **Offline Capability** | Yes | Requires internet |
| **Scalability** | Handle 1000s/sec | Limited by API rate |
| **Accuracy** | Mathematical guarantees | Approximate |

## Integration

The XAI module integrates seamlessly with HeimdallAI's security scanning pipeline:

1. **Vulnerability Detection** → Finding object created
2. **XAI Analysis** → `comprehensiveXAIAnalysis(finding)`
3. **Report Generation** → Include XAI insights
4. **UI Display** → Visualize SHAP/LIME results
5. **Remediation** → Use counterfactual suggestions

## API Endpoints

The XAI functionality can be exposed via API:

```typescript
// POST /api/xai/analyze
{
  "finding": { /* finding object */ },
  "methods": ["shap", "lime", "counterfactual"] // optional
}
```

## Testing

Use the provided demo file to test all XAI methods:

```typescript
import { runAllDemos } from '@/lib/ai/xai-demo'
await runAllDemos()
```

## Future Enhancements

- [ ] Add Grad-CAM for attention visualization
- [ ] Implement TreeSHAP for tree-based models
- [ ] Add DeepLIFT for neural network attribution
- [ ] Support custom feature extractors
- [ ] Add caching for repeated analyses
- [ ] Parallel execution for batch processing

## References

- **SHAP**: Lundberg & Lee (2017) - "A Unified Approach to Interpreting Model Predictions"
- **LIME**: Ribeiro et al. (2016) - "Why Should I Trust You?"
- **Anchors**: Ribeiro et al. (2018) - "Anchors: High-Precision Model-Agnostic Explanations"
- **Integrated Gradients**: Sundararajan et al. (2017) - "Axiomatic Attribution for Deep Networks"

## License

Part of HeimdallAI security analysis platform.
